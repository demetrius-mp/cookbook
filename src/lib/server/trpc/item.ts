import prisma from '$lib/server/prisma';
import { createProtectedRouter, filterByUserId } from '$lib/server/trpc/utils';
import * as trpc from '@trpc/server';
import { z } from 'zod';

const itemRouter = createProtectedRouter()
	.query('findById', {
		input: z.string().uuid(),
		resolve: async ({ input, ctx }) => {
			const item = await prisma.item.findFirst({
				where: {
					id: input,
					...filterByUserId(ctx.user.id)
				}
			});

			return item;
		}
	})
	.query('list', {
		input: z
			.object({
				query: z.string().optional()
			})
			.default({
				query: undefined
			}),
		resolve: async ({ ctx, input }) => {
			const items = await prisma.item.findMany({
				orderBy: {
					name: 'asc'
				},
				where: {
					state: 'VISIBLE',
					...filterByUserId(ctx.user.id),
					name: {
						contains: input.query,
						mode: 'insensitive'
					}
				}
			});

			return items;
		}
	})
	.mutation('save', {
		input: z.object({
			id: z.string().uuid().optional(),
			name: z.string().min(3),
			baseAmount: z.number().int().min(1),
			amountKind: z.string(),
			price: z.number().min(0.01)
		}),
		resolve: async ({ input: { id, ...data }, ctx }) => {
			if (id) {
				const item = await prisma.item.findFirst({
					where: {
						id,
						...filterByUserId(ctx.user.id)
					}
				});

				if (!item) {
					throw new trpc.TRPCError({
						code: 'NOT_FOUND',
						message: 'The item does not exist.'
					});
				}

				return await prisma.item.update({
					data,
					where: {
						id: item.id
					}
				});
			}

			return await prisma.item.create({
				data: {
					...data,
					userId: ctx.user.id
				}
			});
		}
	})
	.mutation('delete', {
		input: z.string().uuid(),
		resolve: async ({ input, ctx }) => {
			const itemOnRecipe = await prisma.itemsOnRecipes.findFirst({
				where: {
					itemId: input
				}
			});

			if (itemOnRecipe) {
				throw new trpc.TRPCError({
					code: 'CONFLICT',
					message: "You can't delete an item that is being used on a recipe."
				});
			}

			const item = await prisma.item.findFirst({
				where: {
					id: input,
					...filterByUserId(ctx.user.id)
				}
			});

			if (!item) {
				throw new trpc.TRPCError({
					code: 'NOT_FOUND',
					message: 'The item does not exist.'
				});
			}

			await prisma.item.update({
				where: {
					id: item.id
				},
				data: {
					state: 'ARCHIVED'
				}
			});
		}
	});

export default itemRouter;

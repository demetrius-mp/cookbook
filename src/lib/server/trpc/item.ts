import type { Prisma } from '@prisma/client';
import * as trpc from '@trpc/server';
import { z } from 'zod';

import prisma from '$lib/server/prisma';
import { createProtectedRouter, filterByUserId } from '$lib/server/trpc/utils';

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
	.query('listForAutocomplete', {
		input: z
			.object({
				query: z.string().optional(),
				page: z.number().positive().default(1)
			})
			.default({
				query: undefined,
				page: 1
			}),
		resolve: async ({ ctx, input }) => {
			const pageSize = 6;
			const skip = (input.page - 1) * pageSize;
			const take = pageSize;

			const where: Prisma.ItemWhereInput = {
				...filterByUserId(ctx.user.id),
				name: {
					contains: input.query,
					mode: 'insensitive'
				}
			};

			const [items, totalItems] = await prisma.$transaction([
				prisma.item.findMany({
					orderBy: {
						name: 'asc'
					},
					select: {
						id: true,
						name: true,
						amountUnit: true
					},
					where,
					skip,
					take
				}),
				prisma.item.count({
					where
				})
			]);

			return {
				items,
				totalItems,
				pageSize
			};
		}
	})
	.query('list', {
		input: z
			.object({
				query: z.string().optional(),
				page: z.number().positive().default(1),
				isForAutocomplete: z.boolean().default(false)
			})
			.default({
				query: undefined,
				page: 1,
				isForAutocomplete: false
			}),
		resolve: async ({ ctx, input }) => {
			const pageSize = 6;
			const skip = (input.page - 1) * pageSize;
			const take = pageSize;

			const where: Prisma.ItemWhereInput = {
				...filterByUserId(ctx.user.id),
				name: {
					contains: input.query,
					mode: 'insensitive'
				}
			};

			const [items, totalItems] = await prisma.$transaction([
				prisma.item.findMany({
					orderBy: {
						name: 'asc'
					},
					where,
					skip,
					take
				}),
				prisma.item.count({
					where
				})
			]);

			return {
				items,
				totalItems,
				pageSize
			};
		}
	})
	.mutation('save', {
		input: z.object({
			id: z.string().uuid().optional(),
			name: z.string().min(3),
			baseAmount: z.number().int().min(1),
			amountUnit: z.string(),
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
			const [itemOnRecipe, item] = await prisma.$transaction([
				prisma.itemsOnRecipes.findFirst({
					where: {
						itemId: input
					}
				}),
				prisma.item.findFirst({
					where: {
						id: input,
						...filterByUserId(ctx.user.id)
					}
				})
			]);

			if (!item) {
				throw new trpc.TRPCError({
					code: 'NOT_FOUND',
					message: 'The item does not exist.'
				});
			}

			if (itemOnRecipe) {
				throw new trpc.TRPCError({
					code: 'CONFLICT',
					message: "You can't delete an item that is being used on a recipe."
				});
			}

			await prisma.item.delete({
				where: {
					id: item.id
				}
			});
		}
	});

export default itemRouter;

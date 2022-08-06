import prisma from '$lib/server/prisma';
import * as trpc from '@trpc/server';
import { z } from 'zod';

const itemRouter = trpc
	.router()
	.query('findById', {
		input: z.string().uuid(),
		resolve: async ({ input }) => {
			return await prisma.item.findUnique({
				where: {
					id: input
				}
			});
		}
	})
	.query('list', {
		resolve: async () => {
			return await prisma.item.findMany({
				orderBy: {
					name: 'asc'
				},
				where: {
					state: 'VISIBLE'
				}
			});
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
		resolve: async ({ input: { id, ...data } }) => {
			if (id) {
				return await prisma.item.update({
					data,
					where: {
						id
					}
				});
			}

			return await prisma.item.create({
				data
			});
		}
	})
	.mutation('delete', {
		input: z.string().uuid(),
		resolve: async ({ input }) => {
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

			await prisma.item.update({
				where: {
					id: input
				},
				data: {
					state: 'ARCHIVED'
				}
			});
		}
	});

export default itemRouter;

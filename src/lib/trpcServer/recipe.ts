import prisma from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import * as trpc from '@trpc/server';
import { z } from 'zod';

const recipeRouter = trpc
	.router()
	.query('list', {
		resolve: () => {
			return prisma.recipe.findMany({
				include: {
					items: {
						select: {
							amount: true,
							item: {
								select: prisma.$exclude('item', [
									'updatedAt',
									'id',
									'createdAt',
									'updatedAt',
									'state'
								])
							}
						}
					},
					_count: true
				},
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
			id: z.string().optional(),
			name: z.string(),
			items: z.array(
				z.object({
					id: z.string(),
					amount: z.number().int()
				})
			)
		}),
		resolve: ({ input: { id, ...data } }) => {
			const computedData:
				| (Prisma.Without<Prisma.RecipeCreateInput, Prisma.RecipeUncheckedCreateInput> &
						Prisma.RecipeUncheckedCreateInput)
				| (Prisma.Without<Prisma.RecipeUncheckedCreateInput, Prisma.RecipeCreateInput> &
						Prisma.RecipeCreateInput) = {
				name: data.name,
				items: {
					create: data.items.map((item) => {
						return {
							amount: item.amount,
							item: {
								connect: {
									id: item.id
								}
							}
						};
					})
				}
			};

			if (id) {
				return prisma.recipe.update({
					data: computedData,
					where: {
						id
					}
				});
			}

			return prisma.recipe.create({
				data: computedData
			});
		}
	})
	.mutation('delete', {
		input: z.string(),
		resolve: ({ input }) => {
			return prisma.recipe.update({
				where: {
					id: input
				},
				data: {
					state: 'ARCHIVED'
				}
			});
		}
	});

export default recipeRouter;

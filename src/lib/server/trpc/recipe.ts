import prisma from '$lib/server/prisma';
import { createProtectedRouter } from '$lib/server/trpc/utils';
import { filterByUserId } from '$lib/server/trpc/utils';
import type { Prisma } from '@prisma/client';
import * as trpc from '@trpc/server';
import { differenceBy, intersectionWith, isEqual } from 'lodash-es';
import { z } from 'zod';

const recipeRouter = createProtectedRouter()
	.query('findById', {
		input: z.string().uuid(),
		resolve: async ({ input, ctx }) => {
			const recipe = await prisma.recipe.findFirst({
				where: {
					id: input,
					...filterByUserId(ctx.user.id)
				},
				include: {
					items: true
				}
			});

			return recipe;
		}
	})
	.query('list', {
		resolve: async ({ ctx }) => {
			return await prisma.recipe.findMany({
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
					state: 'VISIBLE',
					...filterByUserId(ctx.user.id)
				}
			});
		}
	})
	.mutation('save', {
		input: z.object({
			id: z.string().optional(),
			name: z.string().min(3),
			items: z.array(
				z.object({
					id: z.string().uuid(),
					amount: z.number().min(3)
				})
			)
		}),
		resolve: async ({ input: { id, ...data }, ctx }) => {
			const computedData:
				| (Prisma.Without<Prisma.RecipeCreateInput, Prisma.RecipeUncheckedCreateInput> &
						Prisma.RecipeUncheckedCreateInput)
				| (Prisma.Without<Prisma.RecipeUncheckedCreateInput, Prisma.RecipeCreateInput> &
						Prisma.RecipeCreateInput) = {
				name: data.name,
				userId: ctx.user.id,
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
				const recipe = await prisma.recipe.findUnique({
					where: {
						id,
						...filterByUserId(ctx.user.id)
					},
					include: {
						items: true
					}
				});

				if (!recipe) {
					throw new trpc.TRPCError({
						code: 'NOT_FOUND',
						message: 'The recipe does not exist.'
					});
				}

				const existingItems: typeof data.items = recipe.items.map((item) => {
					return {
						id: item.itemId,
						amount: item.amount
					};
				});

				const itemsToCreate = differenceBy(data.items, existingItems, 'id');
				const itemsToDelete = differenceBy(existingItems, data.items, 'id');
				const itemsToUpdate = intersectionWith(data.items, existingItems, (a, b) => !isEqual(a, b));

				return await prisma.recipe.update({
					where: {
						id: recipe.id
					},
					data: {
						...data,
						items: {
							create: itemsToCreate.map(({ id, ...rest }) => ({
								...rest,
								item: { connect: { id } }
							})),
							deleteMany: itemsToDelete.map((item) => ({ itemId: item.id, recipeId: recipe.id })),
							updateMany: itemsToUpdate.map(({ id, ...rest }) => ({
								data: rest,
								where: {
									itemId: id,
									recipeId: recipe.id
								}
							}))
						}
					}
				});
			}

			return await prisma.recipe.create({
				data: computedData
			});
		}
	})
	.mutation('delete', {
		input: z.string().uuid(),
		resolve: async ({ input, ctx }) => {
			const { count } = await prisma.recipe.updateMany({
				where: {
					id: input,
					...filterByUserId(ctx.user.id)
				},
				data: {
					state: 'ARCHIVED'
				}
			});

			if (count === 0) {
				throw new trpc.TRPCError({
					code: 'NOT_FOUND',
					message: 'The recipe does not exist.'
				});
			}
		}
	});

export default recipeRouter;

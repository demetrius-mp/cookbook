import prisma from '$lib/server/prisma';
import { createProtectedRouter, getDiff } from '$lib/server/trpc/utils';
import { filterByUserId } from '$lib/server/trpc/utils';
import * as trpc from '@trpc/server';
import { z } from 'zod';

async function userAlreadyAcceptedRecipeShare(userId: string, recipeId: string) {
	const alreadyAcceptedShare = (await prisma.usersOnSharedRecipes.findUnique({
		where: {
			userId_sharedRecipeRecipeId: {
				sharedRecipeRecipeId: recipeId,
				userId
			}
		}
	}))
		? true
		: false;

	return alreadyAcceptedShare;
}

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
			isShared: z.boolean().default(false),
			id: z.string().optional(),
			name: z.string().min(3),
			items: z.array(
				z.object({
					id: z.string().uuid(),
					amount: z.number().min(3)
				})
			)
		}),
		resolve: async ({ input: { id, isShared, items, ...input }, ctx }) => {
			const recipe = await prisma.recipe.findUnique({
				where: {
					id
				},
				include: {
					items: {
						include: {
							item: {
								select: prisma.$exclude('item', ['createdAt', 'id', 'updatedAt', 'state', 'userId'])
							}
						}
					}
				}
			});

			if (!recipe) {
				throw new trpc.TRPCError({
					code: 'NOT_FOUND',
					message: 'The recipe does not exist.'
				});
			}

			if (isShared) {
				const alreadyAcceptedShare = await userAlreadyAcceptedRecipeShare(ctx.user.id, recipe.id);

				const createdRecipe = await prisma.recipe.create({
					data: {
						...input,
						userId: ctx.user.id
					}
				});

				if (!alreadyAcceptedShare) {
					await prisma.$transaction(
						recipe.items.map(({ item, amount }) => {
							return prisma.itemsOnRecipes.create({
								data: {
									amount,
									item: {
										create: {
											...item,
											userId: ctx.user.id
										}
									},
									recipe: {
										connect: {
											id: createdRecipe.id
										}
									}
								}
							});
						})
					);

					return createdRecipe;
				} else {
					throw new trpc.TRPCError({
						code: 'CONFLICT',
						message: 'You already accepted this shared recipe.'
					});
				}
			}

			if (id) {
				if (recipe.userId !== ctx.user.id) {
					throw new trpc.TRPCError({
						code: 'NOT_FOUND',
						message: 'The recipe does not exist.'
					});
				}

				const existingItems: typeof items = recipe.items.map((item) => {
					return {
						id: item.itemId,
						amount: item.amount
					};
				});

				const { itemsToCreate, itemsToDelete, itemsToUpdate } = getDiff(existingItems, items);

				const updatedRecipe = await prisma.recipe.update({
					where: {
						id: recipe.id
					},
					data: {
						...input,
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

				return updatedRecipe;
			}

			const createdRecipe = await prisma.recipe.create({
				data: {
					...input,
					userId: ctx.user.id,
					items: {
						create: items.map((item) => {
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
				}
			});

			return createdRecipe;
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
	})
	.mutation('share', {
		input: z.string().uuid(),
		resolve: async ({ ctx, input }) => {
			const recipe = await prisma.recipe.findFirst({
				where: {
					id: input,
					...filterByUserId(ctx.user.id)
				}
			});

			if (!recipe) {
				throw new trpc.TRPCError({
					code: 'NOT_FOUND',
					message: 'The recipe does not exist.'
				});
			}

			const alreadySharedRecipe = await prisma.sharedRecipe.findFirst({
				where: {
					sharingUserId: ctx.user.id,
					recipeId: recipe.id
				}
			});

			if (alreadySharedRecipe) {
				return;
			}

			await prisma.sharedRecipe.create({
				data: {
					recipeId: input,
					sharingUserId: ctx.user.id
				}
			});
		}
	})
	.query('findShared', {
		input: z.string().uuid(),
		resolve: async ({ ctx, input }) => {
			const recipe = await prisma.recipe.findUnique({
				where: {
					id: input
				},
				include: {
					items: {
						select: {
							amount: true,
							itemId: true
						}
					}
				}
			});

			if (!recipe) {
				return null;
			}

			const alreadyAcceptedShare = (await prisma.usersOnSharedRecipes.findUnique({
				where: {
					userId_sharedRecipeRecipeId: {
						sharedRecipeRecipeId: recipe.id,
						userId: ctx.user.id
					}
				}
			}))
				? true
				: false;

			return {
				...recipe,
				alreadyAcceptedShare
			};
		}
	});

export default recipeRouter;

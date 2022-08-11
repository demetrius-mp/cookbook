import prisma from '$lib/server/prisma';
import { createProtectedRouter, getDiff } from '$lib/server/trpc/utils';
import { filterByUserId } from '$lib/server/trpc/utils';
import { Prisma, type Recipe } from '@prisma/client';
import * as trpc from '@trpc/server';
import { z } from 'zod';

const recipeRouter = createProtectedRouter()
	.query('findById', {
		input: z.object({
			id: z.string().uuid(),
			filterByCurrentUser: z.boolean().default(true)
		}),
		resolve: async ({ input, ctx }) => {
			const recipe = await prisma.recipe.findFirst({
				where: {
					id: input.id,
					userId: input.filterByCurrentUser ? ctx.user.id : undefined
				},
				include: {
					items: {
						select: {
							amount: true,
							item: {
								select: prisma.$exclude('item', ['updatedAt', 'createdAt', 'updatedAt'])
							}
						}
					},
					_count: true
				}
			});

			return recipe;
		}
	})
	.query('list', {
		input: z
			.object({
				filterByCurrentUser: z.boolean().default(true),
				filterByLiked: z.boolean().default(false),
				filterByField: z
					.enum(Object.keys(Prisma.RecipeScalarFieldEnum) as [keyof Recipe, ...(keyof Recipe)[]])
					.default('name'),
				query: z.string().optional(),
				page: z.number().positive().default(1)
			})
			.default({
				filterByCurrentUser: true,
				filterByLiked: false,
				filterByField: 'name',
				query: undefined,
				page: 1
			}),
		resolve: async ({ ctx, input }) => {
			const pageSize = 3;
			const skip = (input.page - 1) * pageSize;
			const take = pageSize;

			const where: Prisma.RecipeWhereInput = {
				state: 'VISIBLE',
				likedByUsers: input.filterByLiked
					? {
							some: {
								userId: ctx.user.id
							}
					  }
					: undefined,
				name: input.query
					? {
							contains: input.query,
							mode: 'insensitive'
					  }
					: undefined,
				userId: input.filterByCurrentUser ? ctx.user.id : undefined,
				NOT: {
					userId: !input.filterByCurrentUser ? ctx.user.id : undefined
				}
			};

			const [recipes, totalItems] = await prisma.$transaction([
				prisma.recipe.findMany({
					include: {
						items: {
							select: {
								amount: true,
								item: {
									select: prisma.$exclude('item', ['updatedAt', 'createdAt', 'updatedAt'])
								}
							}
						},
						likedByUsers: {
							select: {
								userId: true
							},
							where: {
								userId: ctx.user.id
							}
						}
					},
					orderBy: {
						likedByUsers: {
							_count: 'asc'
						}
					},
					where,
					skip,
					take
				}),
				prisma.recipe.count({
					where
				})
			]);

			return {
				recipes,
				totalItems,
				pageSize
			};
		}
	})
	.mutation('saveCopy', {
		input: z.string().uuid(),
		resolve: async ({ input, ctx }) => {
			const recipe = await prisma.recipe.findUnique({
				where: {
					id: input
				},
				select: {
					...prisma.$exclude('recipe', ['createdAt', 'id', 'updatedAt', 'userId', 'state']),
					items: {
						select: {
							amount: true,
							item: {
								select: prisma.$exclude('item', ['createdAt', 'id', 'updatedAt', 'userId'])
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

			const { items, ...restRecipeProps } = recipe;

			const createdRecipe = await prisma.recipe.create({
				data: {
					...restRecipeProps,
					userId: ctx.user.id
				}
			});

			await prisma.$transaction(
				recipe.items.map(({ item, ...restItemProps }) => {
					return prisma.itemsOnRecipes.create({
						data: {
							...restItemProps,
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
		}
	})
	.mutation('save', {
		input: z.object({
			id: z.string().optional(),
			name: z.string().min(3),
			items: z
				.array(
					z.object({
						id: z.string().uuid(),
						amount: z.number().min(0.01)
					})
				)
				.superRefine((items, ctx) => {
					items.map((o, i) => {
						items.forEach((e, ind) => {
							if (i > ind && e.id === o.id) {
								ctx.addIssue({
									code: 'custom',
									path: [i, 'id'],
									message: "You can't have duplicate items."
								});

								ctx.addIssue({
									code: 'custom',
									path: [ind, 'id'],
									message: "You can't have duplicate items."
								});
							}
						});
					});
				})
		}),
		resolve: async ({ input: { id, items, ...input }, ctx }) => {
			if (id) {
				const recipe = await prisma.recipe.findUnique({
					where: {
						id
					},
					include: {
						items: {
							include: {
								item: {
									select: prisma.$exclude('item', ['createdAt', 'id', 'updatedAt', 'userId'])
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
	.mutation('like', {
		input: z.object({
			id: z.string().uuid(),
			shouldDislikeIfAlreadyLiked: z.boolean().default(true)
		}),
		resolve: async ({ ctx, input }) => {
			const recipe = await prisma.recipe.findFirst({
				where: {
					id: input.id
				},
				select: {
					id: true,
					userId: true,
					likedByUsers: {
						where: {
							userId: ctx.user.id
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

			if (recipe.userId === ctx.user.id) {
				throw new trpc.TRPCError({
					code: 'BAD_REQUEST',
					message: "You can't like your own recipe!"
				});
			}

			const recipeIsAlreadyLiked = recipe.likedByUsers.length !== 0;

			if (recipeIsAlreadyLiked && input.shouldDislikeIfAlreadyLiked) {
				await prisma.usersOnLikedRecipes.delete({
					where: {
						userId_recipeId: {
							recipeId: input.id,
							userId: ctx.user.id
						}
					}
				});

				return 'disliked';
			}

			await prisma.usersOnLikedRecipes.create({
				data: {
					recipeId: input.id,
					userId: ctx.user.id
				}
			});

			return 'liked';
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

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
								select: prisma.$exclude('item', ['updatedAt', 'createdAt', 'updatedAt', 'state'])
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
				filterByField: z
					.enum(Object.keys(Prisma.RecipeScalarFieldEnum) as [keyof Recipe, ...(keyof Recipe)[]])
					.default('name'),
				query: z.string().optional()
			})
			.default({
				filterByCurrentUser: true,
				filterByField: 'name',
				query: undefined
			}),
		resolve: async ({ ctx, input }) => {
			return await prisma.recipe.findMany({
				include: {
					items: {
						select: {
							amount: true,
							item: {
								select: prisma.$exclude('item', ['updatedAt', 'createdAt', 'updatedAt', 'state'])
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
					name: {
						contains: input.query,
						mode: 'insensitive'
					},
					userId: input.filterByCurrentUser ? ctx.user.id : undefined,
					NOT: {
						userId: !input.filterByCurrentUser ? ctx.user.id : undefined
					}
				}
			});
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
			items: z.array(
				z.object({
					id: z.string().uuid(),
					amount: z.number().min(0.01)
				})
			)
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
									select: prisma.$exclude('item', [
										'createdAt',
										'id',
										'updatedAt',
										'state',
										'userId'
									])
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

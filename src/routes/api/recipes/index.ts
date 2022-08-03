import prisma from '$lib/prisma';
import type { Prisma, Recipe } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export type CustomRecipeCreateInput = {
	name: string;
	items: {
		id: string;
		amount: number;
	}[];
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as CustomRecipeCreateInput;

	const recipe = await prisma.recipe.create({
		data: {
			name: body.name,
			items: {
				create: body.items.map((item) => {
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

	return {
		status: 201,
		body: recipe
	};
};

export const GET: RequestHandler = async () => {
	const recipes = await prisma.recipe.findMany({
		include: {
			items: {
				select: {
					amount: true,
					item: {
						select: prisma.$exclude('item', ['updatedAt', 'id', 'createdAt', 'updatedAt'])
					}
				}
			},
			_count: true
		},
		orderBy: {
			name: 'asc'
		}
	});

	return {
		body: recipes
	};
};

export type GetOutput = (Recipe & {
	items: {
		item: {
			name: string;
			baseAmount: number;
			amountKind: string;
			price: number;
		};
		amount: number;
	}[];
	_count: Prisma.RecipeCountOutputType;
})[];

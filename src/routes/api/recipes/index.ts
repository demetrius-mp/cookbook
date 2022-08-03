import prisma from '$lib/prisma';
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

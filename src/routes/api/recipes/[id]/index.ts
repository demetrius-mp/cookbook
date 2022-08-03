import prisma from '$lib/prisma';
import type { RequestHandler } from '@sveltejs/kit';

// delete recipe by id
export const DELETE: RequestHandler = async ({ params }) => {
	await prisma.recipe.update({
		where: {
			id: params.id
		},
		data: {
			state: 'ARCHIVED'
		}
	});

	return {
		status: 200
	};
};

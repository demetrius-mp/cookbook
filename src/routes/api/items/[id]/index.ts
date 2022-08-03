import prisma from '$lib/prisma';
import type { RequestHandler } from '@sveltejs/kit';

// delete item by id
export const DELETE: RequestHandler = async ({ params }) => {
	await prisma.item.delete({
		where: {
			id: params.id
		}
	});

	return {
		status: 200
	};
};

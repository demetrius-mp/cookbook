import prisma from '$lib/prisma';
import type { RequestHandler } from '@sveltejs/kit';

// delete item by id
export const DELETE: RequestHandler = async ({ params }) => {
	await prisma.item.update({
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

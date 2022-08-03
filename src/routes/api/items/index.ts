import prisma from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

// create item
export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Prisma.ItemCreateInput;

	const item = await prisma.item.create({
		data: body
	});

	return {
		body: item
	};
};

// get all items
export const GET: RequestHandler = async () => {
	const items = await prisma.item.findMany({
		orderBy: {
			name: 'asc'
		},
		where: {
			state: 'VISIBLE'
		}
	});

	return {
		body: items,
		headers: {
			'Content-Type': 'application/json'
		}
	};
};

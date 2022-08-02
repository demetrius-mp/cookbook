import prisma from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Prisma.ItemCreateInput;

	const item = await prisma.item.create({
		data: body
	});

	return {
		body: item
	};
};

export const GET: RequestHandler = async () => {
	const items = await prisma.item.findMany({
		select: prisma.$exclude('item', ['createdAt', 'updatedAt']),
		orderBy: {
			name: 'asc'
		}
	});

	return {
		body: items
	};
};

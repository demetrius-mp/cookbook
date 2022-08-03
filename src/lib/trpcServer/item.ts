import prisma from '$lib/prisma';
import * as trpc from '@trpc/server';
import { z } from 'zod';

const itemRouter = trpc
	.router()
	.query('list', {
		resolve: () => {
			return prisma.item.findMany({
				orderBy: {
					name: 'asc'
				},
				where: {
					state: 'VISIBLE'
				}
			});
		}
	})
	.mutation('save', {
		input: z.object({
			id: z.string().optional(),
			name: z.string(),
			baseAmount: z.number().int(),
			amountKind: z.string(),
			price: z.number()
		}),
		resolve: ({ input: { id, ...data } }) => {
			if (id) {
				return prisma.item.update({
					data,
					where: {
						id
					}
				});
			}

			return prisma.item.create({
				data
			});
		}
	})
	.mutation('delete', {
		input: z.string(),
		resolve: ({ input }) => {
			return prisma.item.update({
				where: {
					id: input
				},
				data: {
					state: 'ARCHIVED'
				}
			});
		}
	});

export default itemRouter;

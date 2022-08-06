import type { Context } from '$lib/server/trpc';
import * as trpc from '@trpc/server';

export function filterByUserId(id: string) {
	return {
		userId: id
	};
}

export function createProtectedRouter() {
	return trpc.router<Context>().middleware(({ ctx, next }) => {
		if (!ctx.user) {
			throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user
			}
		});
	});
}

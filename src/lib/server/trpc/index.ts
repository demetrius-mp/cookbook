import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import * as trpc from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import { ZodError } from 'zod';

import themeRouter from '$lib/server/trpc/theme';
import userRouter from '$lib/server/trpc/user';

import itemRouter from './item';
import recipeRouter from './recipe';

export const createContext = async (event: RequestEvent) => {
	const user = event.locals.user;

	return {
		event,
		user
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;

export const router = trpc
	.router<Context>()
	.formatError(({ shape, error }) => {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
						? error.cause.format()
						: null
			}
		};
	})
	.transformer(trpcTransformer)
	.merge('theme:', themeRouter)
	.merge('users:', userRouter)
	.merge('items:', itemRouter)
	.merge('recipes:', recipeRouter);

export type Router = typeof router;

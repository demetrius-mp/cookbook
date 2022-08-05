import type { inferAsyncReturnType } from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import * as trpc from '@trpc/server';
import itemRouter from './item';
import recipeRouter from './recipe';
import { ZodError } from 'zod';

export const createContext = async () => ({});

export const router = trpc
	.router<inferAsyncReturnType<typeof createContext>>()
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
	.merge('items:', itemRouter)
	.merge('recipes:', recipeRouter);

export type Router = typeof router;

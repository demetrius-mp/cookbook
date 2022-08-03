import type { inferAsyncReturnType } from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import * as trpc from '@trpc/server';
import itemRouter from '$lib/trpcServer/item';
import recipeRouter from '$lib/trpcServer/recipe';

export const createContext = async () => ({});

export const router = trpc
	.router<inferAsyncReturnType<typeof createContext>>()
	.transformer(trpcTransformer)
	.merge('items:', itemRouter)
	.merge('recipes:', recipeRouter);

export type Router = typeof router;

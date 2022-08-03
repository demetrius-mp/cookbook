import type { inferAsyncReturnType } from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import * as trpc from '@trpc/server';
import itemRouter from './item';
import recipeRouter from './recipe';

export const createContext = async () => ({});

export const router = trpc
	.router<inferAsyncReturnType<typeof createContext>>()
	.transformer(trpcTransformer)
	.merge('items:', itemRouter)
	.merge('recipes:', recipeRouter);

export type Router = typeof router;

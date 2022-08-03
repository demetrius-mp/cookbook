import { browser } from '$app/env';
import type { Router } from '$lib/server/trpc';
import type { LoadEvent } from '@sveltejs/kit';
import * as trpc from '@trpc/client';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import trpcTransformer from 'trpc-transformer';

const url = browser ? '/trpc' : 'http://127.0.0.1:5173/trpc';

const trpcClient = (loadFetch?: LoadEvent['fetch']) =>
	trpc.createTRPCClient<Router>({
		url: loadFetch ? '/trpc' : url,
		transformer: trpcTransformer,
		...(loadFetch && { fetch: loadFetch as typeof fetch })
	});

export default trpcClient;

type Query = keyof Router['_def']['queries'];
type Mutation = keyof Router['_def']['mutations'];

export type InferQueryOutput<RouteKey extends Query> = inferProcedureOutput<
	Router['_def']['queries'][RouteKey]
>;
export type InferQueryInput<RouteKey extends Query> = inferProcedureInput<
	Router['_def']['queries'][RouteKey]
>;
export type InferMutationOutput<RouteKey extends Mutation> = inferProcedureOutput<
	Router['_def']['mutations'][RouteKey]
>;
export type InferMutationInput<RouteKey extends Mutation> = inferProcedureInput<
	Router['_def']['mutations'][RouteKey]
>;

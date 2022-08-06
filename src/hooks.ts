import { createContext, router } from '$lib/server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import { getThemeFromCookies } from '$lib/utils/theme.util';
import type { GetSession, Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleCookies: Handle = async ({ event, resolve }) => {
	const theme = getThemeFromCookies(event.request.headers.get('cookie') || '');

	event.locals.theme = theme;

	const response = await resolve(event);

	return response;
};

const handleTRPC: Handle = async ({ event, resolve }) => {
	const response = await createTRPCHandle({
		router,
		createContext,
		event,
		resolve
	});

	return response;
};

export const handle = sequence(handleCookies, handleTRPC);

export const getSession: GetSession = ({ locals }) => {
	const theme = locals.theme;

	return { theme };
};

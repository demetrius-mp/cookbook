import { createContext, router } from '$lib/server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import { getThemeFromCookies } from '$lib/utils/theme.util';
import type { GetSession, Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getUserFromCookies } from '$lib/utils/auth.util';

const handleCookies: Handle = async ({ event, resolve }) => {
	const cookiesString = event.request.headers.get('cookie') || '';

	const theme = getThemeFromCookies(cookiesString);
	event.locals.theme = theme;

	const user = await getUserFromCookies(cookiesString);
	event.locals.user = user;

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

	if (response.ok && event.url.toString().includes('trpc') && event.locals.hasCookie) {
		response.headers.set('Set-Cookie', event.locals.hasCookie);
	}

	return response;
};

export const handle = sequence(handleCookies, handleTRPC);

export const getSession: GetSession = async ({ locals }) => {
	const theme = locals.theme;
	const user = locals.user;

	return { theme, user };
};

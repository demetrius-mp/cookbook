import { getThemeFromCookies } from '$lib/getThemeFromCookies';
import type { GetSession, Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const theme = getThemeFromCookies(event.request.headers.get('cookie') || '');

	event.locals.theme = theme;

	const response = await resolve(event);

	return response;
};

export const getSession: GetSession = ({ locals }) => {
	const theme = locals.theme;

	return { theme };
};

import { isTheme } from '$lib/utils/theme.util';
import type { RequestHandler } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const PUT: RequestHandler = async ({ request }) => {
	const theme = await request.text();

	if (!isTheme(theme)) {
		return {
			status: 400,
			body: `Not a valid theme value: ${theme}`
		};
	}

	const cookie = serialize('theme', theme, {
		sameSite: 'strict',
		httpOnly: true,
		path: '/'
	});

	return {
		headers: {
			'Set-Cookie': cookie
		}
	};
};

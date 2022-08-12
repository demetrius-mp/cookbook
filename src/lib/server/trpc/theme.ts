import type { inferAsyncReturnType } from '@trpc/server';
import * as trpc from '@trpc/server';
import cookie from 'cookie';
import { z } from 'zod';

import type { createContext } from '$lib/server/trpc';
import { themes } from '$lib/utils/theme.util';

const themeRouter = trpc.router<inferAsyncReturnType<typeof createContext>>().mutation('save', {
	input: z.enum(themes),
	resolve: ({ ctx, input }) => {
		const themeCookie = cookie.serialize('theme', input, {
			sameSite: 'strict',
			httpOnly: true,
			path: '/',
			maxAge: 60 * 60 * 24 * 30 * 12
		});

		ctx.event.locals.hasCookie = themeCookie;
	}
});

export default themeRouter;

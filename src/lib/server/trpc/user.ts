import prisma from '$lib/server/prisma';
import * as trpc from '@trpc/server';
import { z } from 'zod';
import cookie from 'cookie';
import AuthService from '$lib/utils/auth.util';
import type { inferAsyncReturnType } from '@trpc/server';
import type { createContext } from '$lib/server/trpc';
import { createHash } from 'node:crypto';

function generateGravatarUrl(email: string) {
	const hashedEmail = createHash('md5').update(email).digest('hex');

	return `https://www.gravatar.com/avatar/${hashedEmail}?d=mp`;
}

const userRouter = trpc
	.router<inferAsyncReturnType<typeof createContext>>()
	.mutation('sign-up', {
		input: z.object({
			name: z.string().min(3),
			email: z.string().email(),
			password: z.string().min(8),
			profilePictureUrl: z.string().url().optional()
		}),
		resolve: async ({ input: { password, profilePictureUrl, ...input } }) => {
			const hashedPassword = await AuthService.generatePasswordHash(password);

			return await prisma.user.create({
				data: {
					...input,
					password: hashedPassword,
					profilePictureUrl: profilePictureUrl || generateGravatarUrl(input.email)
				},
				select: prisma.$exclude('user', ['password'])
			});
		}
	})
	.mutation('sign-in', {
		input: z.object({
			email: z.string().email(),
			password: z.string().min(8)
		}),
		resolve: async ({ input, ctx }) => {
			const user = await prisma.user.findFirst({
				where: {
					email: input.email
				}
			});

			if (!user || !AuthService.verifyPassword(input.password, user.password)) {
				throw new trpc.TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Invalid credentials'
				});
			}

			const jwt = AuthService.generateJwt({ userId: user.id });

			const jwtCookie = cookie.serialize('jwt', jwt, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});

			ctx.event.locals.hasCookie = jwtCookie;

			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		}
	})
	.query('sign-out', {
		resolve: async ({ ctx }) => {
			if (!ctx.user) {
				throw new trpc.TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be authenticated in order to sign out.'
				});
			}

			const jwtCookie = cookie.serialize('jwt', '', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				expires: new Date(0)
			});

			ctx.event.locals.hasCookie = jwtCookie;
		}
	});

export default userRouter;

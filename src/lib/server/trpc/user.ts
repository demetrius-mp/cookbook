import type { inferAsyncReturnType } from '@trpc/server';
import * as trpc from '@trpc/server';
import cookie from 'cookie';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import prisma from '$lib/server/prisma';
import type { createContext } from '$lib/server/trpc';
import AuthService from '$lib/utils/auth.util';

function generateGravatarUrl(email: string) {
	const hashedEmail = createHash('md5').update(email).digest('hex');

	return `https://www.gravatar.com/avatar/${hashedEmail}?d=mp`;
}

const userRouter = trpc
	.router<inferAsyncReturnType<typeof createContext>>()
	.mutation('sign-up', {
		input: z
			.object({
				name: z.string().min(3),
				email: z.string().email(),
				password: z.string().min(8),
				confirmPassword: z.string().min(8)
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: 'Passwords must match',
				path: ['confirmPassword']
			}),
		resolve: async ({ input: { confirmPassword, password, ...input } }) => {
			const hashedPassword = await AuthService.generatePasswordHash(password);

			return await prisma.user.create({
				data: {
					...input,
					password: hashedPassword,
					profilePictureUrl: generateGravatarUrl(input.email)
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
					message: 'Invalid credentials.'
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
	})
	.mutation('update', {
		input: z.object({
			name: z.string().min(8),
			email: z.string().email(),
			currentPassword: z.string().min(8),
			newPassword: z
				.string()
				.optional()
				.transform((newPassword) =>
					newPassword && newPassword.length > 8 ? newPassword : undefined
				),
			profilePictureUrl: z.string().url().optional()
		}),
		resolve: async ({ input: { currentPassword, newPassword, ...input }, ctx }) => {
			if (!ctx.user) {
				throw new trpc.TRPCError({
					code: 'UNAUTHORIZED'
				});
			}

			const user = await prisma.user.findUnique({
				where: {
					id: ctx.user.id
				}
			});

			if (!user || !(await AuthService.verifyPassword(currentPassword, user.password))) {
				throw new trpc.TRPCError({
					code: 'BAD_REQUEST',
					message: 'Incorrect password.',
					cause: new z.ZodError([
						{
							code: 'custom',
							message: 'Incorrect password',
							path: ['currentPassword']
						}
					])
				});
			}

			const password = newPassword
				? await AuthService.generatePasswordHash(newPassword)
				: undefined;

			const { password: _, ...userWithoutPassword } = await prisma.user.update({
				where: {
					id: ctx.user.id
				},
				data: {
					...input,
					password: password
				}
			});

			return userWithoutPassword;
		}
	});

export default userRouter;

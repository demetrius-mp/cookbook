<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ session }) => {
		if (session.user) {
			return {
				status: 302,
				redirect: '/app'
			};
		}
	};
</script>

<script lang="ts">
	import { TRPCClientError } from '@trpc/client';
	import { createForm } from 'svelte-forms-lib';
	import type { ZodFormattedError } from 'zod';

	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import InputError from '$lib/components/Forms/InputError/InputError.svelte';
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';

	type SignInUser = InferMutationInput<'users:sign-in'>;
	type SignInUserError = ZodFormattedError<SignInUser>;

	let errors: SignInUserError | undefined;

	const { handleSubmit, form, isSubmitting, handleReset } = createForm<SignInUser>({
		initialValues: {
			email: '',
			password: ''
		},
		onSubmit: async (values) => {
			try {
				const user = await trpcClient().mutation('users:sign-in', values);
				$session.user = user;

				toastStore.push({
					kind: 'success',
					message: 'Signed up successfully!',
					removeAfter: 2000
				});

				errors = undefined;
				handleReset();

				await goto('/app/recipes');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					if (e.data.code === 'UNAUTHORIZED') {
						toastStore.push({
							kind: 'error',
							message: e.message,
							removeAfter: 3000
						});
					}
					errors = e.data.zodError;
				}

				console.error(e);
			}
		}
	});
</script>

<div class="card bg-base-200 shadow-xl">
	<div class="card-body">
		<h3 class="text-4xl font-bold">Sign in</h3>
		<small class="text-sm opacity-50">
			Don't have an account?
			<a class="link" href="/sign-up">Sign up</a>
		</small>
		<form
			on:submit|preventDefault={handleSubmit}
			class="flex flex-col gap-3 items-center justify-center"
		>
			<div class="form-control w-full">
				<label for="email" class="label">
					<span class="label-text">Email</span>
				</label>
				<input
					bind:value={$form.email}
					required
					name="email"
					type="email"
					autocomplete="email"
					class="input input-bordered w-full"
					class:input-error={errors?.email?._errors}
				/>
				<InputError errors={errors?.email?._errors} />
			</div>

			<div class="form-control w-full">
				<label for="password" class="label">
					<span class="label-text">Password</span>
				</label>
				<input
					bind:value={$form.password}
					required
					name="password"
					type="password"
					autocomplete="new-password"
					class="input input-bordered w-full"
					class:input-error={errors?.password?._errors}
				/>
				<InputError errors={errors?.password?._errors} />
			</div>

			<button
				type="submit"
				class:loading={$isSubmitting}
				class="btn btn-outline btn-secondary w-full mt-3"
			>
				Sign in
			</button>
		</form>
	</div>
</div>

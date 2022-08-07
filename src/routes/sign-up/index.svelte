<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';
	import { TRPCClientError } from '@trpc/client';
	import InputError from '$lib/components/InputError/InputError.svelte';
	import type { ZodFormattedError } from 'zod';
	import { goto } from '$app/navigation';

	type SignInUser = InferMutationInput<'users:sign-up'>;
	type SignInUserError = ZodFormattedError<SignInUser>;

	let errors: SignInUserError | undefined;

	const { handleSubmit, form, isSubmitting, handleReset } = createForm<SignInUser>({
		initialValues: {
			email: '',
			name: '',
			password: ''
		},
		onSubmit: async (values) => {
			try {
				await trpcClient().mutation('users:sign-up', values);

				toastStore.push({
					kind: 'success',
					message: 'Signed up successfully!',
					removeAfter: 2000
				});

				errors = undefined;
				handleReset();

				await goto('/sign-in');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					errors = e.data.zodError;
				}

				console.error(e);
			}
		}
	});
</script>

<div class="card bg-base-200 shadow-xl card-body">
	<h3 class="text-4xl font-bold">Sign up</h3>
	<small class="text-sm opacity-50">
		Already have an account?
		<a class="link" href="/sign-in">Sign in</a>
	</small>
	<form
		on:submit|preventDefault={handleSubmit}
		class="flex flex-col gap-3 items-center justify-center"
	>
		<div class="form-control w-full">
			<label for="name" class="label">
				<span class="label-text">Name</span>
			</label>
			<input
				bind:value={$form.name}
				required
				name="name"
				type="text"
				min="3"
				class="input input-bordered w-full"
				class:input-error={errors?.name?._errors}
			/>
			<InputError errors={errors?.name?._errors} />
		</div>

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
			Sign up
		</button>
	</form>
</div>

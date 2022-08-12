<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';
	import { TRPCClientError } from '@trpc/client';
	import InputError from '$lib/components/Forms/InputError/InputError.svelte';
	import type { ZodFormattedError } from 'zod';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { MD5 } from 'crypto-js';
	import IconInformationCircle from '$lib/components/Icons/IconInformationCircle.svelte';

	type UpdateUser = InferMutationInput<'users:update'>;
	type UpdateUserError = ZodFormattedError<UpdateUser>;

	let errors: UpdateUserError | undefined;

	const { email, name, profilePictureUrl } = $session.user as NonNullable<typeof $session.user>;

	const { handleSubmit, form, isSubmitting, handleReset, isModified } = createForm<UpdateUser>({
		initialValues: {
			email,
			name,
			profilePictureUrl: profilePictureUrl || '',
			currentPassword: '',
			newPassword: ''
		},
		onSubmit: async (values) => {
			try {
				await trpcClient().mutation('users:update', values);

				toastStore.push({
					kind: 'success',
					message: 'Saved informations successfully!',
					removeAfter: 2000
				});

				errors = undefined;
				handleReset();

				await goto('/app/recipes');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					errors = e.data.zodError;
				}

				console.error(e);
			}
		}
	});

	function generateGravatarUrl(email: string) {
		const hashedEmail = MD5(email).toString();

		return `https://www.gravatar.com/avatar/${hashedEmail}`;
	}

	async function setProfilePictureUrlUsingGravatar() {
		const gravatarUrl = generateGravatarUrl($form.email);

		const r = await fetch(gravatarUrl + '?d=404');

		if (r.status === 404) {
			toastStore.push({
				kind: 'info',
				message: `No Gravatar profile found!`,
				removeAfter: 3000
			});

			return;
		}

		$form.profilePictureUrl = gravatarUrl + '?d=mp';
	}
</script>

<h3 class="text-4xl font-bold text-center">Profile information</h3>
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
		<label for="profilePictureUrl" class="label">
			<span class="label-text">Profile picture URL</span>
			<div class="label-text-alt flex items-center gap-1">
				<button type="button" class="underline" on:click={setProfilePictureUrlUsingGravatar}>
					Get from Gravatar
				</button>
				<button
					title="What is Gravatar?"
					type="button"
					on:click={() => goto('https://en.gravatar.com/')}
					class="btn btn-circle btn-ghost btn-xs text-info hover:text-info"
				>
					<IconInformationCircle />
					<span class="sr-only"> What is Gravatar? </span>
				</button>
			</div>
		</label>
		<input
			bind:value={$form.profilePictureUrl}
			name="profilePictureUrl"
			type="url"
			class="input input-bordered w-full"
			class:input-error={errors?.profilePictureUrl?._errors}
		/>
		<InputError errors={errors?.profilePictureUrl?._errors} />
	</div>

	<div class="form-control w-full">
		<label for="newPassword" class="label">
			<span class="label-text">New password</span>
		</label>
		<input
			bind:value={$form.newPassword}
			name="newPassword"
			type="password"
			class="input input-bordered w-full"
			class:input-error={errors?.newPassword?._errors}
			minlength="8"
		/>
		<InputError errors={errors?.newPassword?._errors} />
	</div>

	<div class="form-control w-full">
		<label for="currentPassword" class="label">
			<span class="label-text">Current password</span>
		</label>
		<input
			bind:value={$form.currentPassword}
			required
			name="currentPassword"
			type="password"
			class="input input-bordered w-full"
			class:input-error={errors?.currentPassword?._errors}
			minlength="8"
		/>
		<InputError errors={errors?.currentPassword?._errors} />
	</div>

	<button
		type="submit"
		disabled={!$isModified}
		class:loading={$isSubmitting}
		class="btn btn-outline btn-secondary w-full mt-3"
	>
		Save
	</button>
</form>

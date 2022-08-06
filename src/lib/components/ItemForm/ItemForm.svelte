<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';
	import { createEventDispatcher } from 'svelte';
	import { TRPCClientError } from '@trpc/client';
	import InputError from '$lib/components/InputError/InputError.svelte';
	import type { ZodFormattedError } from 'zod';

	const dispatch = createEventDispatcher<{
		submit: void;
	}>();

	type SaveItem = InferMutationInput<'items:save'>;
	type SaveItemError = ZodFormattedError<SaveItem>;

	export let item: SaveItem = {
		amountKind: '',
		baseAmount: 0,
		name: '',
		price: 0
	};

	let errors: SaveItemError | undefined;

	const { handleSubmit, form, isSubmitting, handleReset } = createForm<SaveItem>({
		initialValues: item,
		onSubmit: async (values) => {
			try {
				await trpcClient().mutation('items:save', values);

				toastStore.push({
					kind: 'success',
					message: 'Item saved successfully!',
					removeAfter: 2000
				});

				errors = undefined;
				handleReset();

				dispatch('submit');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					errors = e.data.zodError;
				}
			}
		}
	});
</script>

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
		<label for="baseAmount" class="label">
			<span class="label-text">Base amount</span>
		</label>
		<input
			bind:value={$form.baseAmount}
			required
			name="baseAmount"
			type="number"
			min="1"
			step="1"
			class="input input-bordered w-full"
			class:input-error={errors?.baseAmount?._errors}
		/>
		<InputError errors={errors?.baseAmount?._errors} />
	</div>

	<div class="form-control w-full">
		<label for="amountKind" class="label">
			<span class="label-text">Amount kind</span>
		</label>
		<input
			bind:value={$form.amountKind}
			required
			name="amountKind"
			type="text"
			class="input input-bordered w-full"
			class:input-error={errors?.amountKind?._errors}
		/>
		<InputError errors={errors?.amountKind?._errors} />
	</div>

	<div class="form-control w-full">
		<label for="price" class="label">
			<span class="label-text">Price</span>
		</label>
		<input
			bind:value={$form.price}
			required
			name="price"
			type="number"
			min="0.01"
			step="0.01"
			class="input input-bordered w-full"
			class:input-error={errors?.price?._errors}
		/>
		<InputError errors={errors?.price?._errors} />
	</div>

	<button type="submit" class:loading={$isSubmitting} class="btn btn-outline btn-secondary w-full">
		Save item
	</button>
</form>

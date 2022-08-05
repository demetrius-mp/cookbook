<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';
	import { createEventDispatcher } from 'svelte';
	import { TRPCClientError } from '@trpc/client';
	import { makeMappedZodErrors } from '$lib/utils/zod.util';
	import InputWrapper from '$lib/components/FormHelpers/InputWrapper.svelte';

	const dispatch = createEventDispatcher<{
		submit: void;
	}>();

	type SaveItem = InferMutationInput<'items:save'>;

	export let item: SaveItem = {
		amountKind: '',
		baseAmount: 0,
		name: '',
		price: 0
	};

	let errors = makeMappedZodErrors(item);

	const { handleSubmit, form, isSubmitting } = createForm<SaveItem>({
		initialValues: item,
		onSubmit: async (values) => {
			try {
				await trpcClient().mutation('items:save', values);

				toastStore.push({
					kind: 'success',
					message: 'Item saved successfully!',
					removeAfter: 2000
				});

				errors = makeMappedZodErrors(item);

				dispatch('submit');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					delete e.data.zodError._errors;
					errors = {
						...makeMappedZodErrors(item),
						...e.data.zodError
					};
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
		<InputWrapper let:hasError {errors} key={'name'}>
			<input
				bind:value={$form.name}
				required
				name="name"
				type="text"
				class="input input-bordered w-full"
				class:input-error={hasError}
			/>
		</InputWrapper>
	</div>

	<div class="form-control w-full">
		<InputWrapper let:hasError {errors} key={'baseAmount'}>
			<input
				bind:value={$form.baseAmount}
				required
				name="baseAmount"
				type="number"
				min="1"
				step="1"
				class="input input-bordered w-full"
				class:input-error={hasError}
			/>
		</InputWrapper>
	</div>

	<div class="form-control w-full">
		<InputWrapper let:hasError {errors} key={'amountKind'}>
			<input
				bind:value={$form.amountKind}
				required
				name="amountKind"
				type="text"
				class="input input-bordered w-full"
				class:input-error={hasError}
			/>
		</InputWrapper>
	</div>

	<div class="form-control w-full">
		<InputWrapper let:hasError {errors} key={'price'}>
			<input
				bind:value={$form.price}
				required
				name="price"
				type="number"
				min="0.01"
				step="0.01"
				class="input input-bordered w-full"
				class:input-error={hasError}
			/>
		</InputWrapper>
	</div>

	<button type="submit" class:loading={$isSubmitting} class="btn btn-outline btn-secondary w-full">
		Save item
	</button>
</form>

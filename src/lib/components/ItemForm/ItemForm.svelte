<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';
	import { createEventDispatcher } from 'svelte';

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

	const { handleSubmit, form, isSubmitting } = createForm<SaveItem>({
		initialValues: item,
		onSubmit: async (values) => {
			await trpcClient().mutation('items:save', values);

			toastStore.push({
				kind: 'success',
				message: 'Item saved successfully!',
				removeAfter: 2000
			});

			dispatch('submit');
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
			class="input input-bordered w-full"
		/>
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
			class="input input-bordered w-full"
		/>
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
		/>
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
			class="input input-bordered w-full"
		/>
	</div>

	<button type="submit" class:loading={$isSubmitting} class="btn btn-outline btn-secondary w-full">
		Save item
	</button>
</form>

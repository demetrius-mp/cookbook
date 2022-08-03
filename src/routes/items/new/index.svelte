<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput } from '$lib/trpcClient';
	import { createForm } from 'svelte-forms-lib';

	type CreateItem = InferMutationInput<'items:save'>;

	const { handleSubmit, form, isSubmitting } = createForm<CreateItem>({
		initialValues: {
			amountKind: '',
			baseAmount: 0,
			name: '',
			price: 0
		},
		onSubmit: async (values) => {
			await trpcClient().mutation('items:save', values);

			toastStore.push({
				kind: 'success',
				message: 'Item created successfully!',
				removeAfter: 2000
			});
		}
	});
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-3 items-center justify-center"
>
	<h3 class="text-4xl font-bold">Add new item</h3>
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
		Create item
	</button>
</form>

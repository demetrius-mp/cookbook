<script lang="ts">
	import { goto } from '$app/navigation';

	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput, type InferQueryOutput } from '$lib/trpcClient';
	import { createEventDispatcher } from 'svelte';
	import { createForm } from 'svelte-forms-lib';

	type Item = InferQueryOutput<'items:list'>[number];
	export let items: Item[] = [];

	type SaveRecipe = InferMutationInput<'recipes:save'>;
	export let recipe: SaveRecipe = {
		name: '',
		items: [makeNewItem()]
	};

	const dispatch = createEventDispatcher<{
		submit: void;
	}>();

	const { form, handleSubmit, handleReset, isSubmitting } = createForm<SaveRecipe>({
		initialValues: recipe,
		onSubmit: async (values) => {
			await trpcClient().mutation('recipes:save', values);

			toastStore.push({
				kind: 'success',
				message: 'Recipe saved successfully!',
				removeAfter: 2000
			});

			handleReset();

			dispatch('submit');
		}
	});

	function makeNewItem(): SaveRecipe['items'][number] {
		const itemToUseId =
			items.find((v) => {
				return $form && !$form.items.some((item) => item.id === v.id);
			}) || items[0];

		return {
			amount: 0,
			id: itemToUseId.id
		};
	}

	let addNewItemButtonIsDisabled = recipe.items.length === items.length;
	function addItem() {
		if ($form.items.length === items.length) {
			return;
		}

		$form.items = [...$form.items, makeNewItem()];
	}

	function removeItem(index: number) {
		if ($form.items.length === 1) {
			toastStore.push({
				kind: 'error',
				message: 'You must keep at least 1 item.',
				removeAfter: 3000
			});

			return;
		}

		$form.items = $form.items.filter((_, i) => i !== index);
	}

	$: addNewItemButtonIsDisabled = $form.items.length === items.length;
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-3 items-center justify-center"
>
	<div class="form-control w-full">
		<label for="recipeName" class="label">
			<span class="label-text">Recipe name</span>
		</label>
		<input
			bind:value={$form.name}
			required
			name="recipeName"
			type="text"
			class="input input-bordered w-full"
		/>
	</div>
	<div class="divider" />
	<div class="card bg-base-200 w-full shadow-xl mb-4">
		<div class="card-body p-5">
			{#each $form.items as recipeItem, i}
				<div class="flex justify-between">
					<h2 class="card-title">Item {i + 1}</h2>
					<button type="button" on:click={() => removeItem(i)} class="btn btn-square btn-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="form-control w-full">
					<label for="itemName" class="label">
						<span class="label-text">Item name</span>
						<span class="label-text-alt text-sm">
							<a class="link" href="/items/new">Create a new item</a>
						</span>
					</label>
					{#if items.length === 0}
						<button
							type="button"
							on:click={() => goto('/items/new')}
							class="btn btn-outline btn-ghost justify-start">Create a new item</button
						>
					{:else}
						<select required bind:value={recipeItem.id} class="select select-bordered">
							{#each items as item}
								<option
									hidden={$form.items.some((i) => i.id === item.id && i.id !== recipeItem.id)}
									value={item.id}
								>
									{item.name}
								</option>
							{/each}
						</select>
					{/if}
				</div>
				<div class="form-control w-full">
					<label for="amount" class="label">
						<span class="label-text">Amount</span>
					</label>
					<input
						bind:value={recipeItem.amount}
						required
						name="amount"
						type="number"
						class="input input-bordered w-full"
					/>
				</div>
				<div class="divider" />
			{/each}
			<button
				disabled={addNewItemButtonIsDisabled}
				type="button"
				on:click={addItem}
				class="btn btn-outline btn-accent w-full"
			>
				+ New item
			</button>
		</div>
	</div>

	<div class="divider" />

	<button type="submit" class:loading={$isSubmitting} class="btn btn-outline btn-secondary w-full">
		Save recipe
	</button>
</form>

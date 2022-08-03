<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const items = await trpcClient(fetch).query('items:list');

		return {
			props: {
				items
			}
		};
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import Autocomplete from '$lib/components/Autocomplete/Autocomplete.svelte';
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput, type InferQueryOutput } from '$lib/trpcClient';
	import type { Load } from '@sveltejs/kit';

	export let items: InferQueryOutput<'items:list'>;

	let recipe: InferMutationInput<'recipes:save'> = {
		items: [newItem()],
		name: ''
	};

	function removeItem(index: number) {
		if (recipe.items.length === 1) {
			toastStore.push({
				kind: 'error',
				message: 'You must keep at least 1 item.',
				removeAfter: 3000
			});

			return;
		}

		recipe.items = recipe.items.filter((_, i) => i !== index);
	}

	function newItem(): InferMutationInput<'recipes:save'>['items'][number] {
		return {
			amount: 0,
			id: ''
		};
	}

	function addItem() {
		recipe.items = [...recipe.items, newItem()];
	}

	async function handleSubmit() {
		await trpcClient().mutation('recipes:save', recipe);

		toastStore.push({
			kind: 'success',
			message: 'Recipe created successfully!',
			removeAfter: 2000
		});
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-3 items-center justify-center"
>
	<h3 class="text-4xl font-bold">Add new recipe</h3>
	<div class="form-control w-full">
		<label for="recipeName" class="label">
			<span class="label-text">Recipe name</span>
		</label>
		<input
			bind:value={recipe.name}
			required
			name="recipeName"
			type="text"
			class="input input-bordered w-full"
		/>
	</div>
	<div class="divider" />
	<div class="card bg-base-200 w-full shadow-xl mb-4">
		<div class="card-body p-5">
			{#each recipe.items as recipeItem, i}
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
					</label>
					<div>
						<Autocomplete
							options={items}
							labelKey={'name'}
							selectedId={recipeItem.id}
							idKey={'id'}
							on:emptyOptionsAction={() => goto('/items/new')}
							on:select={(e) => (recipeItem.id = e.detail.id)}
						>
							<svelte:fragment slot="empty options">
								You don't have any items. Click here to create a new item.
							</svelte:fragment>
						</Autocomplete>
					</div>
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
			<button type="button" on:click={addItem} class="btn btn-outline btn-accent w-full">
				+ New item
			</button>
		</div>
	</div>

	<div class="divider" />

	<button type="submit" class="btn btn-outline btn-secondary w-full">Create recipe</button>
</form>

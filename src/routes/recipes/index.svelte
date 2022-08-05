<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const recipes = await trpcClient(fetch).query('recipes:list');

		return {
			props: {
				recipes
			}
		};
	};
</script>

<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatting.util';
	import type { Load } from '@sveltejs/kit';
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import { goto } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	export let recipes: InferQueryOutput<'recipes:list'>;

	$: computedRecipes = recipes.map((recipe) => {
		const recipeItems = recipe.items.map((item) => {
			return {
				...item,
				computedPrice: (item.amount * item.item.price) / item.item.baseAmount
			};
		});

		return {
			...recipe,
			items: recipeItems,
			totalPrice: recipeItems.reduce((partial, { computedPrice }) => partial + computedPrice, 0)
		};
	});

	async function handleDeleteRecipe(id: string) {
		const confirmDelete = confirm('Are you sure you want to delete this item?');
		if (!confirmDelete) return;

		await trpcClient().mutation('recipes:delete', id);

		toastStore.push({
			kind: 'success',
			message: 'Item deleted successfully',
			removeAfter: 2000
		});

		recipes = await trpcClient().query('recipes:list');
	}

	async function handleEditRecipe(id: string) {
		await goto(`/recipes/${id}/edit`);
	}

	function closeDropdown() {
		(document.activeElement as HTMLElement).blur();
	}
</script>

<div class="flex sm:flex-row flex-col justify-between items-center mb-5 gap-3">
	<div>
		<h3 class="text-4xl font-bold">Recipes</h3>
	</div>
	<div class="sm:w-fit w-full">
		<a class="btn btn-primary w-full" href="/recipes/new">+ New Recipe</a>
	</div>
</div>

{#if computedRecipes.length > 0}
	<ul class="grid sm:grid-cols-2 gap-6 md:grid-cols-3">
		{#each computedRecipes as recipe (recipe.id)}
			<li
				animate:flip={{ duration: 500 }}
				transition:fade={{ duration: 300 }}
				class="col-span-1 flex flex-col rounded-lg"
			>
				<div class="card bg-base-200 shadow-xl">
					<div class="card-body p-5">
						<div class="flex justify-between items-center gap-3">
							<h2 class="card-title">{recipe.name}</h2>
							<div class="dropdown dropdown-end">
								<label for="dropdown" tabindex="0" class="btn btn-sm btn-square">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
										/>
									</svg>
								</label>
								<ul
									on:click={closeDropdown}
									tabindex="0"
									class="dropdown-content menu p-2 shadow bg-base-100 rounded-box"
								>
									<li>
										<button on:click={() => handleEditRecipe(recipe.id)} class="text-info">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-6 w-6"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
											Edit
										</button>
									</li>
									<li>
										<button on:click={() => handleDeleteRecipe(recipe.id)} class="text-error">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-6 w-6"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
											Delete
										</button>
									</li>
								</ul>
							</div>
						</div>
						<div class="divider my-0" />
						<ul>
							{#each recipe.items as { item, amount, computedPrice }}
								<li class="flex items-center justify-between">
									<div>
										<span class="text-lg">
											- {item.name}
										</span>
										<span class="text-sm opacity-50">
											{amount}
											{item.amountKind}
										</span>
									</div>
									<div>
										{formatCurrency(computedPrice)}
									</div>
								</li>
							{/each}
						</ul>
						<div class="divider my-0" />
						<div class="flex items-center justify-between">
							<div class="text-2xl">Total:</div>
							<div>
								{formatCurrency(recipe.totalPrice)}
							</div>
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<h3 class="text-3xl">You haven't created any recipes.</h3>
{/if}

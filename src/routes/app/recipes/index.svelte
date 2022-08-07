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
	import IconTrash from '$lib/components/Icons/IconTrash.svelte';
	import IconPencilAlt from '$lib/components/Icons/IconPencilAlt.svelte';
	import IconDotsVertical from '$lib/components/Icons/IconDotsVertical.svelte';
	import IconShare from '$lib/components/Icons/IconShare.svelte';
	import { TRPCClientError } from '@trpc/client';

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
		await goto(`/app/recipes/${id}/edit`);
	}

	async function handleShareRecipe(id: string) {
		try {
			await trpcClient().mutation('recipes:share', id);

			console.log(window.location.origin);

			navigator.clipboard.writeText('');

			toastStore.push({
				kind: 'success',
				message: 'Copied sharing link to clipboard!',
				removeAfter: 2000
			});
		} catch (e) {
			if (e instanceof TRPCClientError) {
				console.error(e);
			}
		}
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
		<a class="btn btn-primary w-full" href="/app/recipes/new">+ New Recipe</a>
	</div>
</div>

{#if computedRecipes.length > 0}
	<ul class="grid sm:grid-cols-2 gap-6 md:grid-cols-3">
		{#each computedRecipes as recipe (recipe.id)}
			<li
				animate:flip={{ duration: 500 }}
				transition:fade|local={{ duration: 300 }}
				class="col-span-1 flex flex-col rounded-lg"
			>
				<div class="card bg-base-200 shadow-xl overflow-visible">
					<div class="card-body p-5">
						<div class="flex justify-between items-center gap-3">
							<h2 class="card-title">{recipe.name}</h2>
							<div class="dropdown dropdown-end">
								<label for="dropdown" tabindex="0" class="btn btn-sm btn-square">
									<IconDotsVertical />
								</label>
								<ul
									on:click={closeDropdown}
									tabindex="0"
									class="dropdown-content menu p-2 shadow bg-base-100 rounded-box"
								>
									<li>
										<button on:click={() => handleEditRecipe(recipe.id)}>
											<IconPencilAlt />
											Edit
										</button>
									</li>
									<li>
										<button on:click={() => handleShareRecipe(recipe.id)}>
											<IconShare />
											Share
										</button>
									</li>
									<li>
										<button on:click={() => handleDeleteRecipe(recipe.id)} class="text-error">
											<IconTrash />
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

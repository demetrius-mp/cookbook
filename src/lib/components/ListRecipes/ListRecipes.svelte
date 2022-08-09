<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatting.util';
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
	import IconClipboard from '$lib/components/Icons/IconClipboard.svelte';

	export let recipes: InferQueryOutput<'recipes:list'>;
	export let viewType: 'own' | 'browsing' = 'browsing';

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
			const sharingLink = `${window.location.origin}/app/recipes/${id}`;

			if (!navigator.canShare) {
				navigator.clipboard.writeText(sharingLink);

				toastStore.push({
					kind: 'success',
					message: 'Copied sharing link to clipboard!',
					removeAfter: 2000
				});

				return;
			}

			navigator.share({
				url: sharingLink,
				title: 'Check out my recipe!'
			});
		} catch (e) {
			if (e instanceof TRPCClientError) {
				console.error(e);
			}
		}
	}

	async function handleCopyRecipe(id: string) {
		try {
			const loadingToastId = toastStore.push({
				kind: 'loading',
				message: 'Copying recipe...',
				removeAfter: 'never'
			});

			await trpcClient().mutation('recipes:saveCopy', id);

			toastStore.close(loadingToastId);

			toastStore.push({
				kind: 'success',
				message: 'Recipe copied successfully!',
				removeAfter: 3000
			});

			await goto('/app/recipes');
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

{#if computedRecipes.length > 0}
	<ul class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
		{#each computedRecipes as recipe (recipe.id)}
			<li
				animate:flip={{ duration: 500 }}
				transition:fade|local={{ duration: 300 }}
				class="col-span-1 flex flex-col rounded-lg"
			>
				<div class="card bg-base-200 shadow-xl overflow-visible">
					<div class="card-body p-5">
						<div class="flex justify-between gap-3">
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
									{#if viewType === 'browsing'}
										<li>
											<button on:click={() => handleCopyRecipe(recipe.id)}>
												<IconClipboard />
												Copy
											</button>
										</li>
										<li>
											<button on:click={() => handleShareRecipe(recipe.id)}>
												<IconShare />
												Share
											</button>
										</li>
									{:else if viewType === 'own'}
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
									{/if}
								</ul>
							</div>
						</div>
						<div class="divider my-0" />
						<ul>
							{#each recipe.items as { item, amount, computedPrice }}
								<li class="flex items-center justify-between">
									<div class="flex flex-col">
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
	<slot name="no results">
		<h3 class="text-3xl">No recipes were found.</h3>
	</slot>
{/if}
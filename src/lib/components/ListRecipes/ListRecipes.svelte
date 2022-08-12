<script lang="ts">
	import { TRPCClientError } from '@trpc/client';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { createForm } from 'svelte-forms-lib';

	import { goto } from '$app/navigation';
	import overflow from '$lib/actions/overflow.action';
	import IconClipboard from '$lib/components/Icons/IconClipboard.svelte';
	import IconDotsVertical from '$lib/components/Icons/IconDotsVertical.svelte';
	import IconHeart from '$lib/components/Icons/IconHeart.svelte';
	import IconPencilAlt from '$lib/components/Icons/IconPencilAlt.svelte';
	import IconSearch from '$lib/components/Icons/IconSearch.svelte';
	import IconShare from '$lib/components/Icons/IconShare.svelte';
	import IconTrash from '$lib/components/Icons/IconTrash.svelte';
	import { Pagination } from '$lib/components/Navigation';
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationOutput, type InferQueryOutput } from '$lib/trpcClient';
	import { formatCurrency } from '$lib/utils/formatting.util';

	export let recipes: InferQueryOutput<'recipes:list'>;
	export let viewType: 'own' | 'browsing' = 'browsing';
	export let loadRecipes: (options: { query: string; page: number }) => Promise<typeof recipes>;

	$: computedRecipes = recipes.recipes.map((recipe) => {
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

	function userLikedRecipe(recipe: typeof recipes.recipes[number]) {
		return recipe.likedByUsers.length > 0;
	}

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

	async function handleLikeRecipe(id: string) {
		try {
			const result = await trpcClient().mutation('recipes:like', {
				id
			});

			dispatch('like', {
				id,
				result
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

	const dispatch = createEventDispatcher<{
		like: {
			id: string;
			result: InferMutationOutput<'recipes:like'>;
		};
	}>();

	const { form, isSubmitting, handleSubmit } = createForm({
		initialValues: {
			query: '',
			currentPage: 1
		},
		onSubmit: async (values) => {
			recipes = await loadRecipes({
				page: values.currentPage,
				query: values.query
			});
		}
	});
</script>

<form on:submit={handleSubmit} class="w-full mb-5">
	<div class="form-control">
		<div class="input-group">
			<input
				type="search"
				bind:value={$form.query}
				placeholder="Search…"
				class="input input-bordered w-full"
			/>
			<button type="submit" class:loading={$isSubmitting} class="btn btn-square">
				{#if !$isSubmitting}
					<IconSearch />
				{/if}
			</button>
		</div>
	</div>
</form>

{#if computedRecipes.length > 0}
	<div class="mb-3">
		<Pagination
			pageSize={recipes.pageSize}
			totalItems={recipes.totalItems}
			bind:currentPage={$form.currentPage}
			on:pageChange={handleSubmit}
			loading={$isSubmitting}
		/>
	</div>
	<ul class:loading-state={$isSubmitting} class="grid grid-cols-1 sm:grid-cols-2 gap-6">
		{#each computedRecipes as recipe (recipe.id)}
			{@const liked = userLikedRecipe(recipe)}
			<li
				animate:flip={{ duration: 500 }}
				transition:fade|local={{ duration: 250 }}
				class="col-span-1 flex flex-col rounded-lg"
			>
				<div class="card bg-base-200 shadow-xl h-96 overflow-visible">
					<div class="card-body p-5 justify-evenly">
						<div class="flex justify-between gap-3">
							<h2 class="card-title">
								{#if viewType === 'own'}
									<a class="link" href="/app/recipes/{recipe.id}/edit">{recipe.name}</a>
								{:else}
									{recipe.name}
								{/if}
							</h2>
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
											<button on:click={() => handleLikeRecipe(recipe.id)}>
												<IconHeart fill={liked} />
												{liked ? 'Dislike' : 'Like'}
											</button>
										</li>
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
						<div class="max-h-44 overflow-y-auto">
							<ul use:overflow={['mr-3']}>
								{#each recipe.items as { item, amount, computedPrice }}
									<li class="flex items-center justify-between">
										<div class="flex flex-col">
											<span class="text-lg">
												- {item.name}
											</span>
											<span class="text-sm opacity-50">
												{amount}
												{item.amountUnit}
											</span>
										</div>
										<div>
											{formatCurrency(computedPrice)}
										</div>
									</li>
								{/each}
							</ul>
						</div>
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
	<div class="flex flex-wrap">
		<slot name="no results">
			<h3 class="text-3xl">No recipes were found.</h3>
		</slot>
	</div>
{/if}

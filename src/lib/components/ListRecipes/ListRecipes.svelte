<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { createForm } from 'svelte-forms-lib';

	import IconSearch from '$lib/components/Icons/IconSearch.svelte';
	import RecipeCard from '$lib/components/ListRecipes/RecipeCard.svelte';
	import { Pagination } from '$lib/components/Navigation';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';

	export let recipes: InferQueryOutput<'recipes:list'>;
	export let viewType: 'own' | 'browsing' = 'browsing';
	export let loadRecipes: (options: { query: string; page: number }) => Promise<typeof recipes>;

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

{#if recipes.recipes.length > 0}
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
		{#each recipes.recipes as recipe (recipe.id)}
			<li
				animate:flip={{ duration: 500 }}
				transition:fade|local={{ duration: 250 }}
				class="col-span-1 flex flex-col rounded-lg"
			>
				<RecipeCard
					{recipe}
					{viewType}
					on:like
					on:delete={async () => (recipes = await trpcClient().query('recipes:list'))}
				/>
				<!-- <div class="card bg-base-200 shadow-xl h-96 overflow-visible">
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
				</div> -->
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

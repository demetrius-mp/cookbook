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
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import ListRecipes from '$lib/components/ListRecipes/ListRecipes.svelte';
	import { createForm } from 'svelte-forms-lib';

	export let recipes: InferQueryOutput<'recipes:list'>;

	let currentPage = 1;

	const { form, isSubmitting, handleSubmit } = createForm({
		initialValues: {
			query: ''
		},
		onSubmit: async () => {
			loadRecipes();
		}
	});

	async function loadRecipes() {
		recipes = await trpcClient().query('recipes:list', {
			filterByField: 'name',
			query: $form.query,
			page: currentPage
		});
	}

	function handlePageChange(page: number) {
		currentPage = page;

		loadRecipes();
	}
</script>

<div class="flex flex-col justify-between items-start mb-5 gap-3">
	<div class="flex items-center justify-between gap-3 w-full">
		<h3 class="text-4xl font-bold">Recipes</h3>
		<div class="">
			<a class="btn btn-primary" href="/app/recipes/new">+ New Recipe</a>
		</div>
	</div>
	<div class="w-full">
		<form on:submit={handleSubmit} class="w-full">
			<div class="form-control">
				<div class="input-group">
					<input
						type="search"
						bind:value={$form.query}
						placeholder="Search…"
						class="input input-bordered w-full"
					/>
					<button type="submit" class:loading={$isSubmitting} class="btn btn-square">
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

<ListRecipes on:pageChange={({ detail }) => handlePageChange(detail)} {recipes} viewType="own" />

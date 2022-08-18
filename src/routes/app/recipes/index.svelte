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

	import ListRecipes from '$lib/components/ListRecipes/ListRecipes.svelte';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';

	export let recipes: InferQueryOutput<'recipes:list'>;
</script>

<div class="flex items-center justify-between w-full mb-3">
	<h3 class="text-4xl font-bold">Recipes</h3>
	<div class="">
		<a class="btn btn-primary" href="/app/recipes/new">+ New Recipe</a>
	</div>
</div>

<ListRecipes
	{recipes}
	viewType="own"
	loadRecipes={async (options) => {
		return await trpcClient().query('recipes:list', {
			filterByField: 'name',
			query: options.query,
			page: options.page
		});
	}}
/>

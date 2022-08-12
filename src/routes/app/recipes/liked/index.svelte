<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const recipes = await trpcClient(fetch).query('recipes:list', {
			filterByCurrentUser: false,
			filterByLiked: true
		});

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

	async function loadRecipes() {
		recipes = await trpcClient().query('recipes:list', {
			filterByCurrentUser: false,
			filterByLiked: true,
			filterByField: 'name',
			query: ''
		});
	}
</script>

<h3 class="text-4xl font-bold mb-3">Liked recipes</h3>

<ListRecipes
	{recipes}
	viewType="browsing"
	on:like={() => loadRecipes()}
	loadRecipes={async (options) => {
		return await trpcClient().query('recipes:list', {
			filterByCurrentUser: false,
			filterByLiked: true,
			filterByField: 'name',
			query: options.query,
			page: options.page
		});
	}}
/>

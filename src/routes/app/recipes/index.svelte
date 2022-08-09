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

	export let recipes: InferQueryOutput<'recipes:list'>;
</script>

<div class="flex justify-between items-center mb-5 gap-3">
	<h3 class="text-4xl font-bold">Recipes</h3>
	<div>
		<a class="btn btn-primary w-full" href="/app/recipes/new">+ New Recipe</a>
	</div>
</div>

<ListRecipes {recipes} viewType="own" />

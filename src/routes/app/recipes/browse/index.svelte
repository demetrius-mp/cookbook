<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const recipes = await trpcClient(fetch).query('recipes:list', {
			filterByCurrentUser: false
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
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import ListRecipes from '$lib/components/ListRecipes/ListRecipes.svelte';

	export let recipes: InferQueryOutput<'recipes:list'>;
</script>

<div class="flex sm:flex-row flex-col justify-between items-center mb-5 gap-3">
	<div>
		<h3 class="text-4xl font-bold">Browsing recipes</h3>
		<small class="text-sm">
			<a class="link" href="/app/recipes">Browse through my recipes.</a>
		</small>
	</div>
</div>

<ListRecipes {recipes} viewType="browsing" />

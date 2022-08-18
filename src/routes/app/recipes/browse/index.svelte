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

	import { session } from '$app/stores';
	import ListRecipes from '$lib/components/ListRecipes/ListRecipes.svelte';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';

	export let recipes: InferQueryOutput<'recipes:list'>;
</script>

<h3 class="text-4xl font-bold mb-3">Browsing recipes</h3>

<ListRecipes
	on:like={({ detail }) => {
		recipes.recipes = recipes.recipes.map((recipe) => {
			if (recipe.id === detail.id && $session.user) {
				recipe.likedByUsers =
					detail.result === 'liked'
						? [
								{
									userId: $session.user.id
								}
						  ]
						: [];
			}
			return recipe;
		});
	}}
	loadRecipes={async (options) => {
		return await trpcClient().query('recipes:list', {
			filterByCurrentUser: false,
			filterByField: 'name',
			query: options.query,
			page: options.page
		});
	}}
	{recipes}
	viewType="browsing"
/>

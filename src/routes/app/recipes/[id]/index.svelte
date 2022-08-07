<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const recipe = await trpcClient(fetch).query('recipes:findById', {
			id: params.id,
			filterByCurrentUser: false
		});

		if (!recipe) {
			return {
				redirect: '/app/recipes',
				status: 302
			};
		}

		return {
			props: {
				recipe
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import ListRecipes from '$lib/components/ListRecipes/ListRecipes.svelte';

	export let recipe: InferQueryOutput<'recipes:findById'>;
</script>

<h3 class="text-4xl font-bold text-center">Copy recipe</h3>
{#if recipe}
	<ListRecipes recipes={[recipe]} />
{/if}

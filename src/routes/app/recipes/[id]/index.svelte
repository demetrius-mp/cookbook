<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const recipe = await trpcClient(fetch).query('recipes:findById', {
			id: params.id,
			filterByCurrentUser: false
		});

		if (!recipe) {
			const queryParams = qs.stringify({
				redirectReason: 'The recipe does not exist.'
			});

			return {
				redirect: `/app/recipes?${queryParams}`,
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
	import qs from 'query-string';

	import RecipeCard from '$lib/components/ListRecipes/RecipeCard.svelte';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';

	export let recipe: InferQueryOutput<'recipes:findById'>;
</script>

<h3 class="text-4xl font-bold text-center mb-5">View recipe</h3>
{#if recipe}
	<RecipeCard {recipe} viewType="browsing" />
{/if}

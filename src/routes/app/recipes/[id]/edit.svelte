<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const dbRecipe = await trpcClient(fetch).query('recipes:findById', params.id);
		const items = await trpcClient(fetch).query('items:list');

		if (!dbRecipe) {
			return {
				redirect: '/app/recipes',
				status: 302
			};
		}

		return {
			props: {
				dbRecipe,
				items
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferMutationInput, type InferQueryOutput } from '$lib/trpcClient';
	import RecipeForm from '$lib/components/RecipeForm/RecipeForm.svelte';
	import { goto } from '$app/navigation';

	type SaveRecipe = InferQueryOutput<'recipes:findById'>;
	export let dbRecipe: SaveRecipe;
	export let items: InferQueryOutput<'items:list'>;

	let recipe: InferMutationInput<'recipes:save'>;

	if (dbRecipe) {
		recipe = {
			id: dbRecipe.id,
			name: dbRecipe?.name,
			items: dbRecipe?.items.map((item) => {
				return {
					id: item.itemId,
					amount: item.amount
				};
			})
		};
	}
</script>

<h3 class="text-4xl font-bold text-center">Edit recipe</h3>
{#if dbRecipe}
	<RecipeForm {items} {recipe} on:submit={() => goto('/app/recipes')} />
{/if}

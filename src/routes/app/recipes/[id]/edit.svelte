<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const recipe = await trpcClient(fetch).query('recipes:findById', {
			id: params.id,
			filterByCurrentUser: true
		});

		const items = await trpcClient(fetch).query('items:listForAutocomplete');

		if (!recipe) {
			return {
				redirect: '/app/recipes',
				status: 302
			};
		}

		return {
			props: {
				recipe,
				items
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import RecipeForm from '$lib/components/RecipeForm/RecipeForm.svelte';
	import { goto } from '$app/navigation';
	import TitleWithGoBackIcon from '$lib/components/TitleWithGoBackIcon/TitleWithGoBackIcon.svelte';

	export let recipe: InferQueryOutput<'recipes:findById'>;
	export let items: InferQueryOutput<'items:listForAutocomplete'>;
</script>

<TitleWithGoBackIcon href="/app/recipes" title="Edit recipe" />

<RecipeForm
	items={items.items}
	totalItems={items.totalItems}
	{recipe}
	on:submit={() => goto('/app/recipes')}
/>

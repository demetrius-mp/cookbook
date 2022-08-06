<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const items = await trpcClient(fetch).query('items:list');

		if (items.length === 0) {
			const queryParams = qs.stringify({
				redirectReason: 'You must create an item first.'
			});

			return {
				status: 302,
				redirect: `/items/new?${queryParams}`
			};
		}

		return {
			props: {
				items
			}
		};
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import qs from 'query-string';
	import RecipeForm from '$lib/components/RecipeForm/RecipeForm.svelte';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import type { Load } from '@sveltejs/kit';

	export let items: InferQueryOutput<'items:list'>;
</script>

<h3 class="text-4xl font-bold text-center">Add new recipe</h3>
<RecipeForm on:submit={() => goto('/recipes')} {items} />

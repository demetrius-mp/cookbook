<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const items = await trpcClient(fetch).query('items:listForAutocomplete');

		return {
			props: {
				items
			}
		};
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/Forms/RecipeForm/RecipeForm.svelte';
	import { TitleWithGoBackIcon } from '$lib/components/Navigation';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import type { Load } from '@sveltejs/kit';

	export let items: InferQueryOutput<'items:listForAutocomplete'>;
</script>

<TitleWithGoBackIcon href="/app/recipes" title="New recipe" />
<RecipeForm
	on:submit={() => goto('/app/recipes')}
	items={items.items}
	totalItems={items.totalItems}
/>

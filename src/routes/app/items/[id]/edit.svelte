<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const item = await trpcClient(fetch).query('items:findById', params.id);

		if (!item) {
			return {
				redirect: '/app/items',
				status: 302
			};
		}

		return {
			props: {
				item
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import ItemForm from '$lib/components/ItemForm/ItemForm.svelte';
	import { goto } from '$app/navigation';
	import TitleWithGoBackIcon from '$lib/components/TitleWithGoBackIcon/TitleWithGoBackIcon.svelte';

	type SaveItem = InferQueryOutput<'items:findById'>;
	export let item: SaveItem;
</script>

<TitleWithGoBackIcon href="/app/items" title="Edit item" />

{#if item}
	<ItemForm {item} on:submit={() => goto('/app/items')} />
{/if}

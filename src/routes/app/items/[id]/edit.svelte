<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const item = await trpcClient(fetch).query('items:findById', params.id);

		if (!item) {
			const queryParams = qs.stringify({
				redirectReason: 'The item does not exist.'
			});

			return {
				redirect: `/app/items?${queryParams}`,
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
	import qs from 'query-string';

	import { goto } from '$app/navigation';
	import ItemForm from '$lib/components/Forms/ItemForm/ItemForm.svelte';
	import { TitleWithGoBackIcon } from '$lib/components/Navigation';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';

	type SaveItem = InferQueryOutput<'items:findById'>;
	export let item: SaveItem;
</script>

<TitleWithGoBackIcon href="/app/items" title="Edit item" />

{#if item}
	<ItemForm {item} on:submit={() => goto('/app/items')} />
{/if}

<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const item = await trpcClient(fetch).query('items:findById', params.id);

		if (!item) {
			return {
				redirect: '/items',
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

	type SaveItem = InferQueryOutput<'items:findById'>;
	export let item: SaveItem;
</script>

<h3 class="text-4xl font-bold text-center">Edit item</h3>
{#if item}
	<ItemForm {item} on:submit={() => goto('/items')} />
{/if}

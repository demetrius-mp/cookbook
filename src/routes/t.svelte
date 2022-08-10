<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const items = (await trpcClient(fetch).query('items:list')).slice(0, 2);

		return {
			props: {
				items
			}
		};
	};
</script>

<script lang="ts">
	import Autocomplete from '$lib/components/Autocomplete/Autocomplete.svelte';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import sleep from '$lib/utils/sleep.util';
	import type { Load } from '@sveltejs/kit';

	export let items: InferQueryOutput<'items:list'>;

	async function searchFunction(query: string) {
		await sleep(2000);

		return (
			await trpcClient(fetch).query('items:list', {
				query
			})
		).slice(0, 2);
	}

	let selected: typeof items[number] = {
		id: '78a898e7-7796-4797-bb33-e1a8d67c377a',
		name: 'Macarrão',
		baseAmount: 100,
		amountKind: 'gramas',
		price: 3,
		createdAt: new Date('2022-08-10T17:18:18.717Z'),
		updatedAt: new Date('2022-08-10T17:18:18.717Z'),
		userId: '7f152fef-d4b5-4cc5-b3bb-1e261eafcc86'
	};

	$: console.log(selected);
</script>

<Autocomplete
	options={items}
	{selected}
	getLabel={(i) => i.name}
	idKey={'id'}
	{searchFunction}
	on:select={({ detail }) => (selected = detail)}
/>

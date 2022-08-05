<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const items = await trpcClient(fetch).query('items:list');

		return {
			props: {
				items
			}
		};
	};
</script>

<script lang="ts">
	import toastStore from '$lib/components/Toast/toast.store';

	import { formatCurrency } from '$lib/utils/formatting.util';
	import trpcClient from '$lib/trpcClient';
	import type { Item } from '@prisma/client';
	import type { Load } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	export let items: Item[];

	async function handleDeleteItem(id: string) {
		const confirmDelete = confirm('Are you sure you want to delete this item?');
		if (!confirmDelete) return;

		await trpcClient().mutation('items:delete', id);

		toastStore.push({
			kind: 'success',
			message: 'Item deleted successfully',
			removeAfter: 2000
		});

		items = await trpcClient().query('items:list');
	}

	async function handleEditItem(id: string) {
		await goto(`/items/${id}/edit`);
	}
</script>

<div class="flex sm:flex-row flex-col justify-between items-center mb-5 gap-3">
	<div>
		<h3 class="text-4xl font-bold">Items</h3>
	</div>
	<div class="sm:w-fit w-full">
		<a class="btn btn-primary w-full" href="/items/new">+ New item</a>
	</div>
</div>

<div class="overflow-x-auto w-full rounded-lg shadow-lg ring-base-300">
	<table class="table w-full">
		<thead>
			<tr>
				<th>Name</th>
				<th>Info</th>
				<th class="text-center">Actions</th>
			</tr>
		</thead>

		<tbody>
			{#each items as item (item.id)}
				<tr>
					<td class="font-bold">
						{item.name}
					</td>
					<td>
						<div class="flex items-center space-x-3">
							<div>
								<div>{formatCurrency(item.price)}</div>
								<div class="text-sm opacity-50">
									{item.baseAmount}
									{item.amountKind}
								</div>
							</div>
						</div>
					</td>
					<td class="w-0">
						<button
							on:click={() => handleDeleteItem(item.id)}
							class="btn btn-sm btn-outline btn-error"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
						<button
							on:click={() => handleEditItem(item.id)}
							class="btn btn-sm btn-outline btn-info"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="3"> No records found. </td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

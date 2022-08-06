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
	import { TRPCClientError } from '@trpc/client';
	import IconPencilAlt from '$lib/components/Icons/IconPencilAlt.svelte';
	import IconTrash from '$lib/components/Icons/IconTrash.svelte';

	export let items: Item[];

	async function handleDeleteItem(id: string) {
		const confirmDelete = confirm('Are you sure you want to delete this item?');
		if (!confirmDelete) return;

		try {
			await trpcClient().mutation('items:delete', id);

			toastStore.push({
				kind: 'success',
				message: 'Item deleted successfully',
				removeAfter: 2000
			});

			items = await trpcClient().query('items:list');
		} catch (e) {
			if (e instanceof TRPCClientError) {
				toastStore.push({
					kind: 'error',
					message: e.message,
					removeAfter: 5000
				});
			}
		}
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
							<IconTrash />
						</button>
						<button
							on:click={() => handleEditItem(item.id)}
							class="btn btn-sm btn-outline btn-info"
						>
							<IconPencilAlt />
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

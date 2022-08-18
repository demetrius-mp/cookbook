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
	import type { Load } from '@sveltejs/kit';
	import { TRPCClientError } from '@trpc/client';
	import { createForm } from 'svelte-forms-lib';

	import { goto } from '$app/navigation';
	import IconPencilAlt from '$lib/components/Icons/IconPencilAlt.svelte';
	import IconSearch from '$lib/components/Icons/IconSearch.svelte';
	import IconTrash from '$lib/components/Icons/IconTrash.svelte';
	import { Pagination } from '$lib/components/Navigation';
	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferQueryOutput } from '$lib/trpcClient';
	import { formatCurrency } from '$lib/utils/formatting.util';

	export let items: InferQueryOutput<'items:list'>;

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
		await goto(`/app/items/${id}/edit`);
	}

	const { form, isSubmitting, handleSubmit } = createForm({
		initialValues: {
			query: '',
			currentPage: 1
		},
		onSubmit: async (values) => {
			items = await trpcClient().query('items:list', {
				page: values.currentPage,
				query: values.query
			});
		}
	});
</script>

<div class="flex justify-between items-center mb-5 gap-3">
	<div>
		<h3 class="text-4xl font-bold">Items</h3>
	</div>
	<div class="">
		<a class="btn btn-primary w-full" href="/app/items/new">+ New item</a>
	</div>
</div>

<form on:submit={handleSubmit} class="w-full mb-5">
	<div class="form-control">
		<div class="input-group">
			<input
				type="search"
				bind:value={$form.query}
				placeholder="Search…"
				class="input input-bordered w-full"
			/>
			<button type="submit" class:loading={$isSubmitting} class="btn btn-square">
				{#if !$isSubmitting}
					<IconSearch />
				{/if}
			</button>
		</div>
	</div>
</form>

<div class="mb-3">
	<Pagination
		pageSize={items.pageSize}
		totalItems={items.totalItems}
		loading={$isSubmitting}
		bind:currentPage={$form.currentPage}
		on:pageChange={handleSubmit}
	/>
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

		<tbody class:loading-state={$isSubmitting}>
			{#each items.items as item (item.id)}
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
									{item.amountUnit}
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

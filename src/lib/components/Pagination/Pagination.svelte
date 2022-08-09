<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentPage = 1;
	export let pageSize = 5;
	export let totalItems = 1;

	$: start = (currentPage - 1) * pageSize + 1;
	$: end = Math.min(start + pageSize, totalItems);
	$: totalPages = Math.ceil(totalItems / pageSize);

	const dispatch = createEventDispatcher<{
		pageChange: number;
	}>();

	$: dispatch('pageChange', currentPage);
</script>

<div class="flex flex-wrap justify-between items-center gap-3">
	<h4>Showing {start} to {end} of {totalItems} results.</h4>
	<div class="btn-group">
		<button class="btn btn-sm" disabled={currentPage === 1} on:click={() => currentPage--}>
			«
		</button>
		<button class="btn btn-sm btn-active pointer-events-none" on:click={() => null}>
			{currentPage}
		</button>
		<button class="btn btn-sm" disabled={currentPage === totalPages} on:click={() => currentPage++}>
			»
		</button>
	</div>
</div>

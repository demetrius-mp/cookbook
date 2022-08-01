<script lang="ts">
	import toastStore from './toast.store';
	import Toast from './Toast.svelte';

	let className = '';
	export { className as class };
</script>

<div class="toast z-50 margins {className}">
	{#each $toastStore as toast (toast.id)}
		<div>
			<Toast {...toast} />
		</div>
	{/each}
</div>

<style>
	.margins {
		--margin: calc(0.5rem + 7px);
		margin-top: var(--margin);
		margin-bottom: var(--margin);
		margin-left: var(--margin);
		margin-right: var(--margin);
	}
</style>

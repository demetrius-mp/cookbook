<script lang="ts">
	import IconArrowLeft from '$lib/components/Icons/IconArrowLeft.svelte';

	export let href: string;
	export let title: string | undefined = undefined;
</script>

<div class="grid grid-cols-3 justify-center items-center mb-3">
	<a class="w-fit" {href}>
		<div>
			<IconArrowLeft class="h-9 w-9" />
		</div>
	</a>
	<div class="text-center">
		{#if !title}
			<slot />
		{:else}
			<h3 class="text-4xl font-bold text-center">{title}</h3>
		{/if}
	</div>
</div>

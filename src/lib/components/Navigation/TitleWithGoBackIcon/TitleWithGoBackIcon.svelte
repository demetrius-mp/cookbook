<script lang="ts">
	import IconArrowLeft from '$lib/components/Icons/IconArrowLeft.svelte';

	export let href: string;
	export let title: string | undefined = undefined;
</script>

<div class="grid grid-cols-3 justify-center items-center mb-3">
	<a class="w-fit" {href}>
		<div>
			<IconArrowLeft class="md:w-9 w-6" />
		</div>
	</a>
	<div class="text-center">
		{#if !title}
			<slot />
		{:else}
			<h3 class="md:text-4xl text-xl font-bold">{title}</h3>
		{/if}
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores';

	interface NavOption {
		label: string;
		href: string;
	}

	export let navOptions: NavOption[];

	$: activeOptionIdx = navOptions.findIndex(({ href }) => href === $page.url.pathname);

	$: {
		if (activeOptionIdx === -1) {
			activeOptionIdx = 0;
		}
	}
</script>

<div class="tabs grid grid-flow-col mb-5">
	{#each navOptions as { label, href }, i (href)}
		<a {href} class:tab-active={i === activeOptionIdx} class="tab tab-bordered">
			{label}
		</a>
	{/each}
</div>

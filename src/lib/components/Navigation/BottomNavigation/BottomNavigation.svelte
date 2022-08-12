<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { page } from '$app/stores';

	interface BottomNavigationOption {
		label: string;
		href: string;
		icon: typeof SvelteComponent;
	}

	export let navOptions: BottomNavigationOption[] = [];
</script>

<div class="btm-nav btm-nav-sm lg:hidden bg-base-300">
	{#each navOptions as { label, href, icon } (href)}
		<a {href} class:active={$page.url.pathname.startsWith(href)} class="bg-base-300">
			<!-- <IconBookOpen class="h-5 w-5" /> -->
			<svelte:component this={icon} class="h-5 w-5" />
			<span class="btm-nav-label active">{label}</span>
		</a>
	{/each}
</div>

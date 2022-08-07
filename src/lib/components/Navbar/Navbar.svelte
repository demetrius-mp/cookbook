<script lang="ts">
	import { session } from '$app/stores';
	import drawerStore from '$lib/components/Drawer/drawer.store';
	import IconMenu from '$lib/components/Icons/IconMenu.svelte';
	import ProfileDropdown from '$lib/components/Navbar/ProfileDropdown.svelte';
	import ThemeSelector from './ThemeSelector.svelte';
</script>

<div class="w-full navbar bg-base-200 lg:justify-end">
	{#if $session.user}
		<div class="flex-none lg:hidden">
			<button on:click={drawerStore.open} class="btn btn-square btn-ghost">
				<IconMenu class="inline-block w-6 h-6 stroke-current" />
			</button>
		</div>
	{/if}
	<div class:lg:hidden={$session.user} class="flex-1">
		<a href={$session.user ? '/app' : '/'} class="btn btn-ghost normal-case text-xl">cookbook</a>
	</div>
	<div class="flex gap-2">
		<ThemeSelector />
		{#if !$session.user}
			<a class="btn btn-secondary btn-outline" href="/sign-in">Sign in</a>
		{:else}
			<ProfileDropdown />
		{/if}
	</div>
</div>

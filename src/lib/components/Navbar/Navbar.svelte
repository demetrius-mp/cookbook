<script lang="ts">
	import { session } from '$app/stores';
	import ProfileDropdown from '$lib/components/Navbar/ProfileDropdown.svelte';
	import ThemeSelector from './ThemeSelector.svelte';
</script>

<div class="w-full navbar bg-base-200 lg:justify-end">
	<div class="flex-none lg:hidden">
		<label for="my-drawer" class="btn btn-square btn-ghost">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="inline-block w-6 h-6 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</label>
	</div>
	<div class="flex-1 lg:hidden">
		<a href="/" class="btn btn-ghost normal-case text-xl">cookbook</a>
	</div>
	<div class="flex gap-2">
		<ThemeSelector />
		{#if !$session.user}
			<a class="btn btn-accent btn-outline" href="/sign-up">Sign up</a>
			<a class="btn btn-secondary btn-outline" href="/sign-in">Sign in</a>
		{:else}
			<ProfileDropdown />
		{/if}
	</div>
</div>

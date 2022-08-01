<script lang="ts">
	import { session } from '$app/stores';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>CookBook!</title>
</svelte:head>
<div style="height: 100vh;" data-theme={$session.theme}>
	<div class="navbar bg-base-200">
		<div class="flex-none">
			<button class="btn btn-square btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block w-5 h-5 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>
		<div class="flex-1">
			<a href="/" class="btn btn-ghost normal-case text-xl">cookbook</a>
		</div>
		<ThemeSelector />
	</div>

	<slot />
</div>

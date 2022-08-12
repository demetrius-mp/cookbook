<script lang="ts">
	import { session } from '$app/stores';
	import IconColorSwatch from '$lib/components/Icons/IconColorSwatch.svelte';
	import IconDropdown from '$lib/components/Icons/IconDropdown.svelte';
	import trpcClient from '$lib/trpcClient';
	import { type Theme,themes } from '$lib/utils/theme.util';

	async function handleSetTheme(theme: Theme) {
		try {
			await trpcClient().mutation('theme:save', theme);
			$session.theme = theme;
		} catch (e) {
			console.error(e);
		}
	}
</script>

<div title="Change Theme" class="dropdown dropdown-end">
	<div tabindex="0" class="btn gap-1 normal-case btn-ghost">
		<IconColorSwatch class="inline-block h-5 w-5 stroke-current md:h-6 md:w-6" />
		<span class="hidden md:inline">Theme</span>
		<IconDropdown class="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block" />
	</div>
	<div
		class="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 w-52 overflow-y-auto shadow-2xl mt-16"
	>
		<div class="grid grid-cols-1 gap-3 p-3" tabindex="0">
			{#each themes as theme}
				<div
					class="outline-base-content overflow-hidden rounded-lg outline-2 outline-offset-2"
					class:outline={$session.theme === theme}
					data-set-theme={theme}
					data-act-class="outline"
					on:click={() => handleSetTheme(theme)}
				>
					<div
						data-theme={theme}
						class="bg-base-100 text-base-content w-full cursor-pointer font-sans"
					>
						<div class="grid grid-cols-5 grid-rows-3">
							<div class="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4">
								<div class="flex-grow text-sm font-bold">{theme}</div>
								<div class="flex flex-shrink-0 flex-wrap gap-1">
									<div class="bg-primary w-2 rounded" />
									<div class="bg-secondary w-2 rounded" />
									<div class="bg-accent w-2 rounded" />
									<div class="bg-neutral w-2 rounded" />
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

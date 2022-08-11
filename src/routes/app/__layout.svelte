<script lang="ts" context="module">
	import BottomNavigation from '$lib/components/BottomNavigation/BottomNavigation.svelte';
	import IconBookOpen from '$lib/components/Icons/IconBookOpen.svelte';
	import IconShoppingBag from '$lib/components/Icons/IconShoppingBag.svelte';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ session }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/sign-in'
			};
		}
	};
</script>

<slot />

<BottomNavigation
	navOptions={[
		{
			href: '/app/recipes',
			label: 'Recipes',
			icon: IconBookOpen
		},
		{
			href: '/app/items',
			label: 'Items',
			icon: IconShoppingBag
		}
	]}
/>

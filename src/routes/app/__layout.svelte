<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	
	import IconBookOpen from '$lib/components/Icons/IconBookOpen.svelte';
	import IconShoppingBag from '$lib/components/Icons/IconShoppingBag.svelte';
	import { BottomNavigation } from '$lib/components/Navigation/';

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

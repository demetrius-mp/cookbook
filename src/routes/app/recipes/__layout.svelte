<script lang="ts">
	import TabsNavigation from '$lib/components/TabsNavigation/TabsNavigation.svelte';
</script>

<TabsNavigation
	navOptions={[
		{
			href: '/app/recipes',
			label: 'Recipes'
		},
		{
			href: '/app/recipes/browse',
			label: 'Browse'
		},
		{
			href: '/app/recipes/liked',
			label: 'Liked'
		}
	]}
/>

<slot />

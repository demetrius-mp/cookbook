<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import drawerStore from '$lib/components/Drawer/drawer.store';
	import isDrawerLayoutStore from '$lib/components/Drawer/isDrawerLayout.store';

	afterNavigate(drawerStore.close);
</script>

<div class="drawer drawer-mobile">
	<input bind:checked={$drawerStore} id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<slot name="page content" />
	</div>
	{#if $isDrawerLayoutStore}
		<div class="drawer-side">
			<label for="my-drawer" class="drawer-overlay" />
			<slot name="drawer content" />
		</div>
	{/if}
</div>

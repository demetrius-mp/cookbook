<script lang="ts">
	import { session } from '$app/stores';
	import Container from '$lib/components/Container.svelte';
	import DrawerContent from '$lib/components/DrawerContent.svelte';
	import DrawerLayout from '$lib/components/DrawerLayout.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>cookbook!</title>
</svelte:head>

<div data-theme={$session.theme}>
	<DrawerLayout>
		<svelte:fragment slot="page content">
			<Navbar />
			<Container>
				<slot />
			</Container>
		</svelte:fragment>
		<svelte:fragment slot="drawer content">
			<DrawerContent />
		</svelte:fragment>
	</DrawerLayout>
</div>

<script lang="ts">
	import { session } from '$app/stores';
	import Container from '$lib/components/Container/Container.svelte';
	import DrawerContent from '$lib/components/Drawer/DrawerContent.svelte';
	import DrawerLayout from '$lib/components/Drawer/DrawerLayout.svelte';
	import Navbar from '$lib/components/Navbar/Navbar.svelte';
	import ToastContainer from '$lib/components/Toast/ToastContainer.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>cookbook!</title>
</svelte:head>

<ToastContainer class="toast-end toast-bottom" />

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

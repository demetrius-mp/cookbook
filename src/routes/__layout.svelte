<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page, session } from '$app/stores';
	import Container from '$lib/components/Container/Container.svelte';
	import DrawerContent from '$lib/components/Drawer/DrawerContent.svelte';
	import DrawerLayout from '$lib/components/Drawer/DrawerLayout.svelte';
	import Navbar from '$lib/components/Navbar/Navbar.svelte';
	import PageLoader from '$lib/components/PageLoader/PageLoader.svelte';
	import toastStore from '$lib/components/Toast/toast.store';
	import ToastContainer from '$lib/components/Toast/ToastContainer.svelte';
	import qs from 'query-string';
	import '../app.css';

	afterNavigate(() => {
		const queryParams = qs.parse($page.url.search) as {
			redirectReason?: string;
		};

		if (queryParams.redirectReason !== undefined) {
			toastStore.push({
				kind: 'info',
				message: queryParams.redirectReason,
				removeAfter: 3000
			});
		}
	});
</script>

<svelte:head>
	<title>cookbook!</title>
</svelte:head>

<ToastContainer class="toast-end toast-bottom" />

<div data-theme={$session.theme}>
	{#if true}
		<div>
			<PageLoader />
		</div>
	{/if}
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

<script lang="ts">
	import { fade } from 'svelte/transition';

	import Spinner from '$lib/components/Spinner/Spinner.svelte';

	import toastStore from './toast.store';
	import type { Toast as ToastProps } from './types';

	export let id: ToastProps['id'];
	export let message: ToastProps['message'];
	export let kind: ToastProps['kind'] = 'success';
	export let removeAfter: ToastProps['removeAfter'] = 'never';

	if (removeAfter !== 'never') {
		toastStore.closeAfter({
			id,
			milliseconds: removeAfter
		});
	}

	const className: Record<ToastProps['kind'], string> = {
		error: 'alert-error',
		info: 'alert-info',
		success: 'alert-success',
		warning: 'alert-warning',
		loading: ''
	};
</script>

<div
	transition:fade={{ duration: kind === 'loading' ? 0 : undefined }}
	class="alert {className[kind]} min-w-[256px] block"
>
	<div>
		{#if kind === 'loading'}
			<Spinner />
		{/if}
		<span>{message}</span>
	</div>
</div>

<script lang="ts">
	import Spinner from '$lib/components/Spinner/Spinner.svelte';
	import { fade } from 'svelte/transition';

	import toastStore from './toast.store';
	import type { Toast as ToastProps } from './types';

	export let id: ToastProps['id'];
	export let message: ToastProps['message'];
	export let kind: ToastProps['kind'] = 'success';
	export let removeAfter: ToastProps['removeAfter'] = 'never';
	export let promise: ToastProps['promise'] = undefined;

	if (!promise && removeAfter !== 'never') {
		toastStore.closeAfter({
			id,
			milliseconds: removeAfter
		});
	}

	async function awaitToastPromise() {
		if (promise) {
			await promise.resolve();

			if (removeAfter !== 'never') {
				toastStore.closeAfter({
					id,
					milliseconds: removeAfter
				});
			}
		}
	}

	const className: Record<ToastProps['kind'], string> = {
		error: 'alert-error',
		info: 'alert-info',
		success: 'alert-success',
		warning: 'alert-warning'
	};
</script>

<div transition:fade class="alert {className[kind]} min-w-[256px] block">
	{#await awaitToastPromise()}
		<div>
			<Spinner />
			<span>{promise?.message}</span>
		</div>
	{:then _}
		<div>
			<span>{message}</span>
		</div>
	{/await}
</div>

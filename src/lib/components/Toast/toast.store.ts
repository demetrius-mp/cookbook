import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { Toast, ToastCreateInput } from './types';

type ToastStore = {
	subscribe: Writable<Toast[]>['subscribe'];

	push: (toast: ToastCreateInput) => string;
	close: (id: string) => void;
	closeAfter: ({ id, milliseconds }: { id: string; milliseconds: number }) => void;
};

function createToastStore(): ToastStore {
	const { subscribe, update } = writable<Toast[]>([]);

	const close: ToastStore['close'] = (id) => {
		update((all) => all.filter((toast) => toast.id !== id));
	};

	const closeAfter: ToastStore['closeAfter'] = ({ id, milliseconds }) => {
		setTimeout(() => {
			close(id);
		}, milliseconds);
	};

	return {
		subscribe,
		close,
		closeAfter,
		push(toastInfo) {
			const id = new Date().valueOf() + toastInfo.message;
			update((all) => [
				{
					id,
					...toastInfo
				},
				...all
			]);

			return id;
		}
	};
}

const toastStore = createToastStore();

export default toastStore;

import { writable, type Writable } from 'svelte/store';

interface DrawerStore extends Writable<boolean> {
	toggle(): void;
	open(): void;
	close(): void;
}

function createDrawerStore(): DrawerStore {
	const { set, subscribe, update } = writable<boolean>(false);

	return {
		set,
		subscribe,
		update,
		close() {
			set(false);
		},
		open() {
			set(true);
		},
		toggle() {
			update((v) => !v);
		}
	};
}

const drawerStore = createDrawerStore();

export default drawerStore;

import { type Readable, derived } from 'svelte/store';

import { page, session } from '$app/stores';

type IsDrawerLayoutStore = Readable<boolean>;

function createIsDrawerLayoutStore(): IsDrawerLayoutStore {
	const isDrawerLayoutStore = derived([session, page], ([$session, $page]) => {
		if ($session.user && $page.url.pathname.startsWith('/app')) return true;
		return false;
	});

	return isDrawerLayoutStore;
}

const isDrawerLayoutStore = createIsDrawerLayoutStore();
export default isDrawerLayoutStore;

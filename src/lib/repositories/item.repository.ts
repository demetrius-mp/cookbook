import type { Item, Prisma } from '@prisma/client';

type FetchType = (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

type BaseInput = {
	fetch?: FetchType;
};

const globalFetch = fetch;

type LoadItemsInput = BaseInput;

export async function loadItems({ fetch = globalFetch }: LoadItemsInput): Promise<Item[]> {
	// const fetch = input?.fetch
	const r = await fetch('/api/items', {
		headers: {
			Accept: 'application/json'
		}
	});

	const items = (await r.json()) as Item[];

	return items;
}

type CreateItemInput = BaseInput & {
	item: Prisma.ItemCreateInput;
};

export async function createItem({ fetch = globalFetch, item }: CreateItemInput): Promise<Item> {
	const r = await fetch('/api/items', {
		method: 'POST',
		headers: {
			Accept: 'application/json'
		},
		body: JSON.stringify(item)
	});

	const createdItem = (await r.json()) as Item;

	return createdItem;
}

type DeleteItemInput = BaseInput & {
	id: Item['id'];
};

export async function deleteItem({ fetch = globalFetch, id }: DeleteItemInput): Promise<void> {
	await fetch(`/api/items/${id}`, {
		method: 'DELETE'
	});
}

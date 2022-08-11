import type { Context } from '$lib/server/trpc';
import * as trpc from '@trpc/server';
import { differenceBy, intersectionWith, isEqual } from 'lodash-es';

export function filterByUserId(id: string) {
	return {
		userId: id
	};
}

export function createProtectedRouter() {
	return trpc.router<Context>().middleware(({ ctx, next }) => {
		if (!ctx.user) {
			throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user
			}
		});
	});
}

export function getItemsToCreate<T>(existingItems: T[], newItems: T[]) {
	const itemsToCreate = differenceBy(newItems, existingItems, 'id');

	return itemsToCreate;
}

export function getItemsToDelete<T>(existingItems: T[], newItems: T[]) {
	const itemsToDelete = differenceBy(existingItems, newItems, 'id');

	return itemsToDelete;
}

export function getItemsToUpdate<T>(existingItems: T[], newItems: T[], idKey: keyof T) {
	const itemsToUpdate = intersectionWith(
		newItems,
		existingItems,
		(a, b) => a[idKey] === b[idKey] && !isEqual(a, b)
	);

	return itemsToUpdate;
}

export function getDiff<T>(existingItems: T[], newItems: T[], idKey: keyof T) {
	const itemsToCreate = getItemsToCreate(existingItems, newItems);
	const itemsToDelete = getItemsToDelete(existingItems, newItems);
	const itemsToUpdate = getItemsToUpdate(existingItems, newItems, idKey);

	return {
		itemsToCreate,
		itemsToDelete,
		itemsToUpdate
	};
}

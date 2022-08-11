import { elementIsOverflowing } from '$lib/utils/dom.util';

export default function overflow(node: HTMLElement, classes: string[]): SvelteActionReturnType {
	const isOverflowing = node.parentElement ? elementIsOverflowing(node.parentElement) : false;

	if (isOverflowing) {
		node.classList.add(...classes);
	}

	return {
		destroy() {
			node.classList.remove(...classes);
		},
		update() {
			node.classList.add(...classes);
		}
	};
}

export function elementIsOverflowing(node: HTMLElement) {
	const curOverflow = node.style.overflow;

	if (!curOverflow || curOverflow === 'visible') node.style.overflow = 'hidden';

	const isOverflowing =
		node.clientWidth < node.scrollWidth || node.clientHeight < node.scrollHeight;
	node.style.overflow = curOverflow;

	return isOverflowing;
}

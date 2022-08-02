<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic;

	export let options: T[];
	export let key: keyof T;
	export let label: keyof T;
	export let value: Partial<T> | undefined = undefined;

	let isFocused = false;
	const setFocus = () => (isFocused = true);
	const removeFocus = () => (isFocused = false);

	const dispatch = createEventDispatcher<{
		selected: T;
	}>();

	let currentOptionFocused = value;
	let index = 0;
	function handleKeydown(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (e.key === 'ArrowDown') {
			index += index === options.length - 1 ? 0 : 1;
		} else if (e.key === 'ArrowUp') {
			index -= index === 0 ? 0 : 1;
		} else if (e.key === 'Enter') {
			e.preventDefault();

			dispatch('selected', options[index]);
		}
	}

	$: currentOptionFocused = options[index];
</script>

<div class="relative inline-block w-full">
	<input
		on:focus={setFocus}
		on:blur={removeFocus}
		on:keydown={handleKeydown}
		value={currentOptionFocused ? options[index][label] : ''}
		required
		name="itemName"
		type="text"
		class="input input-bordered w-full"
	/>
	{#if isFocused}
		<div class="absolute z-50 top-full left-0 right-0 w-full">
			<ul class="menu bg-base-100 w-full max-h-48 p-2 rounded-box overflow-y-auto gap-2">
				{#each options as option}
					<li on:click={() => dispatch('selected', option)}>
						<span class:active={currentOptionFocused && option[key] === currentOptionFocused[key]}>
							{option[label]}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

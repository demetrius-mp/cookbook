<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic;

	export let options: T[];
	export let labelKey: keyof T;
	export let idKey: keyof T;
	export let selectedId = options[0][idKey] || '';

	let isFocused = false;
	const setFocus = () => (isFocused = true);
	const removeFocus = () => (isFocused = false);

	const indexOfSelectedId = options.findIndex((item) => item[idKey] === selectedId);

	let index = indexOfSelectedId === -1 ? 0 : indexOfSelectedId;
	function handleKeydown(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const ACTION_KEYS = ['ArrowDown', 'ArrowUp'];
		if (ACTION_KEYS.includes(e.key) && !isFocused) {
			setFocus();
			return;
		}

		if (e.key === 'ArrowDown') {
			index += index === options.length - 1 ? 0 : 1;
		} else if (e.key === 'ArrowUp') {
			index -= index === 0 ? 0 : 1;
		} else if (e.key === 'Enter') {
			e.preventDefault();

			removeFocus();
		}
	}

	const dispatch = createEventDispatcher<{
		select: T;
		emptyOptionsAction: void;
	}>();

	$: currentOption = options[index];
	$: dispatch('select', currentOption);
</script>

<div class="relative inline-block w-full">
	<input
		on:click={setFocus}
		on:focus={setFocus}
		on:keydown={handleKeydown}
		on:blur={removeFocus}
		value={currentOption ? currentOption[labelKey] : ''}
		required
		name="itemName"
		type="text"
		class="input input-bordered w-full"
	/>
	{#if isFocused}
		<div class="absolute z-50 top-full left-0 right-0 w-full">
			<ul class="menu bg-base-100 w-full max-h-48 p-2 rounded-box overflow-y-auto gap-2">
				{#each options as option, i}
					<li>
						<button
							on:mousedown|preventDefault={() => {
								index = i;
								removeFocus();
							}}
							type="button"
							class:active={index === i}
						>
							{option[labelKey]}
						</button>
					</li>
				{:else}
					<li>
						<button
							type="button"
							on:mousedown|preventDefault={() => dispatch('emptyOptionsAction')}
						>
							<slot name="empty options" />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

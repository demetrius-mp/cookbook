<script lang="ts">
	import Spinner from '$lib/components/Spinner/Spinner.svelte';

	import { debounce, uniqBy } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic;

	export let selected: T | undefined = undefined;
	export let options: T[] = [];
	export let idKey: keyof T;
	export let getLabel: (item: T) => string;
	export let searchFunction: (query: string) => Promise<T[]>;
	export let error = false;

	$: {
		if (selected && selected[idKey]) {
			options = uniqBy([selected, ...options], 'id');
		}
	}

	let isLoading = false;
	async function search(query: string) {
		isLoading = true;

		const fetchedOptions = await searchFunction(query);

		if (selected && selected[idKey]) {
			options = uniqBy([selected, ...fetchedOptions], 'id');
		} else {
			options = fetchedOptions;
		}

		isLoading = false;
	}

	async function handleInput(value: string) {
		search(value);
		currentInputValue = value;
	}

	const debouncedHandleInput = debounce(handleInput, 500);

	let status: 'focus' | 'blur' = 'blur';
	$: value = selected ? getLabel(selected) : '';
	$: currentInputValue = value;
	$: selectedIdx = options.findIndex((v) => (selected ? selected[idKey] === v[idKey] : false));
	$: optionsMenuIsOpen = status === 'focus';
	$: showCreateNewItemOption =
		currentInputValue.trim() !== '' &&
		options.findIndex((option) => getLabel(option) === currentInputValue.trim()) === -1;

	const dispatch = createEventDispatcher<{
		select: T;
		create: string;
	}>();

	// key down handlers
	async function handleEscapeKeyDown() {
		input.blur();
		return;
	}

	async function handleEnterKeyDown(e: KeyboardEvent) {
		e.preventDefault();
		if (selectedIdx !== -1) {
			dispatch('select', options[selectedIdx]);
			optionsMenuIsOpen = false;
		} else {
			dispatch('create', currentInputValue);
		}

		return;
	}

	async function handleArrowUpKeyDown() {
		if (selectedIdx === 0 && showCreateNewItemOption) {
			selectedIdx = -1;
			return;
		}

		const computedIdx = (selectedIdx - 1) % options.length;
		selectedIdx = computedIdx <= -1 ? options.length - 1 : computedIdx;

		if (isNaN(selectedIdx)) {
			selectedIdx = -1;
		}

		return;
	}

	async function handleArrowDownKeyDown() {
		if (status === 'blur') {
			status = 'focus';
			return;
		}

		if (selectedIdx === options.length - 1 && showCreateNewItemOption) {
			selectedIdx = -1;
			return;
		}

		const computedIdx = (selectedIdx + 1) % options.length;
		selectedIdx = computedIdx === -1 ? 0 : computedIdx;

		if (isNaN(selectedIdx)) {
			selectedIdx = -1;
		}

		return;
	}

	async function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Escape': {
				return await handleEscapeKeyDown();
			}
			case 'Enter': {
				if (isLoading) return;
				return await handleEnterKeyDown(e);
			}
			case 'ArrowUp': {
				if (isLoading) return;
				return await handleArrowUpKeyDown();
			}
			case 'ArrowDown': {
				if (isLoading) return;
				return await handleArrowDownKeyDown();
			}
		}
	}
	// key down handlers

	let input: HTMLInputElement;
</script>

<div class="relative">
	<div
		role="combobox"
		aria-expanded={status === 'focus'}
		aria-owns="listbox-1"
		aria-haspopup="listbox"
	>
		{#key selected}
			<input
				class="input input-bordered w-full"
				placeholder="Start typing..."
				id="combobox-1"
				aria-autocomplete="list"
				aria-controls="listbox-1"
				type="text"
				required
				aria-activedescendant={selectedIdx !== -1 ? `listbox-1-option-${selectedIdx}` : null}
				value={selected ? getLabel(selected) : ''}
				class:input-error={error}
				bind:this={input}
				on:keydown={handleKeyDown}
				on:input={({ currentTarget: { value } }) => debouncedHandleInput(value)}
				on:focus={() => (status = 'focus')}
				on:blur={() => (status = 'blur')}
			/>
		{/key}
		{#if optionsMenuIsOpen}
			<ul
				class="absolute z-50 menu bg-base-300 gap-1 p-2 rounded-box overflow-y-auto w-full mt-2"
				id="listbox-1"
				role="listbox"
				tabindex="-1"
			>
				{#if isLoading}
					<li class="disabled">
						<span class="flex items-center">
							<Spinner />
							Loading...
						</span>
					</li>
				{:else}
					{#each options as option, i (option[idKey])}
						<li
							id="listbox-1-option-{i}"
							role="option"
							aria-setsize={options.length}
							aria-posinset={i + 1}
							data-selected={selectedIdx === i}
							on:mousedown={() => dispatch('select', option)}
						>
							<button
								type="button"
								class:active={i === selectedIdx}
								class:font-bold={selected?.[idKey] === option[idKey]}
							>
								{getLabel(option)}
							</button>
						</li>
					{/each}
					{#if showCreateNewItemOption}
						<li class="menu-title">
							<span>Create a new item</span>
						</li>
						<li>
							<button
								type="button"
								class:active={-1 === selectedIdx}
								on:mousedown={() => dispatch('create', currentInputValue)}
							>
								<span>
									Create
									<strong class="font-bold">
										{currentInputValue}
									</strong>
								</span>
							</button>
						</li>
					{/if}
				{/if}
			</ul>
		{/if}
	</div>
</div>

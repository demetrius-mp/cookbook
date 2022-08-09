<script lang="ts">
	import Spinner from '$lib/components/Spinner/Spinner.svelte';
	import sleep from '$lib/utils/sleep.util';
	import { debounce } from 'lodash-es';
	import { tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic;

	export let options: T[] = [];
	export let selected = options[0] || undefined;
	export let getOptionLabel: (option: T) => string;
	export let idKey: keyof T = 'id' as keyof T;
	export let delayInMs = 500;
	export let searchFunction: (query: string) => Promise<T[]> = async (query) => {
		const shouldDisplayAllOptions = selected && getOptionLabel(selected) === query;
		await sleep(2000);

		if (shouldDisplayAllOptions) {
			return options;
		}

		return options.filter((option) =>
			getOptionLabel(option).toLowerCase().includes(query.toLowerCase())
		);
	};

	let status: 'blur' | 'focus' = 'blur';
	let value = selected ? getOptionLabel(selected) : '';
	let input: HTMLInputElement;
	let list: HTMLUListElement;
	$: selectedIdx = findIndexOfOption(selected);
	$: menuListIsOpen = status === 'focus';

	let isLoading = false;
	async function triggerSearch(query: string) {
		isLoading = true;

		options = await searchFunction(query);

		isLoading = false;
	}

	const debouncedTriggerSearch = debounce(triggerSearch, delayInMs);

	function findIndexOfOption(option?: T): number {
		return (option && options?.findIndex((v) => v[idKey] === option[idKey])) || 0;
	}

	function getSelectedOption(): HTMLElement | null {
		const active = list.querySelector('[data-selected="true"]') as HTMLElement | null;

		return active;
	}

	function setSelectedOption(index: number) {
		value = getOptionLabel(options?.[index]);
		selectedIdx = index;
		selected = options?.[index];
		dispatchSelect(selected);
	}

	// key down handlers
	async function handleEscapeKeyDown() {
		input.blur();
		return;
	}

	async function handleEnterKeyDown(e: Event) {
		e.preventDefault();
		if (selectedIdx !== -1) {
			setSelectedOption(selectedIdx);
			menuListIsOpen = false;
		} else {
			dispatchAddNewEntry();
		}

		return;
	}

	async function handleArrowUpKeyDown() {
		const computedIdx = (selectedIdx - 1) % options.length;
		selectedIdx = computedIdx === -1 ? options.length - 1 : computedIdx;

		if (isNaN(selectedIdx)) {
			selectedIdx = -1;
		}

		await tick();
		if (list) {
			const selected = getSelectedOption();
			if (selected) {
				if (selectedIdx === options.length - 1) {
					list.scrollTop = selected.offsetTop;
					return;
				}
				if (selected.offsetTop < list.scrollTop) {
					selected.scrollIntoView();
				}
			}
		}

		return;
	}

	async function handleArrowDownKeyDown() {
		if (!menuListIsOpen) {
			menuListIsOpen = true;
			return;
		}

		const computedIdx = (selectedIdx + 1) % options.length;
		selectedIdx = computedIdx === -1 ? 0 : computedIdx;

		if (isNaN(selectedIdx)) {
			selectedIdx = -1;
		}

		await tick();
		if (list) {
			const selected = getSelectedOption();
			if (selected) {
				if (selectedIdx === 0) {
					list.scrollTop = 0;
					return;
				}
				if (selected.offsetTop + selected.clientHeight > list.scrollTop + list.offsetHeight) {
					selected.scrollIntoView();
				}
			}
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

	// events
	const dispatch = createEventDispatcher<{
		addNewEntry: string;
		select: T;
	}>();

	function dispatchAddNewEntry() {
		if (value) {
			dispatch('addNewEntry', value);
		}
	}

	function dispatchSelect(item: T) {
		dispatch('select', item);
	}
	// events
</script>

<div class="relative">
	<div class="form-control w-full max-w-xs">
		<label for="" class="label">
			<span class="label-text">What is your name?</span>
		</label>
	</div>
	<div
		role="combobox"
		aria-expanded={status === 'focus'}
		aria-owns="listbox-1"
		aria-haspopup="listbox"
	>
		<input
			class="input input-bordered w-full"
			placeholder="Start typing..."
			id="combobox-1"
			aria-autocomplete="list"
			aria-controls="listbox-1"
			type="text"
			required
			aria-activedescendant={selectedIdx !== -1 ? `listbox-1-option-${selectedIdx}` : null}
			bind:value
			bind:this={input}
			on:keydown={handleKeyDown}
			on:input={({ currentTarget: { value } }) => debouncedTriggerSearch(value)}
			on:focus={() => (status = 'focus')}
			on:blur={() => (status = 'blur')}
		/>

		{#if menuListIsOpen}
			<ul
				class="absolute menu bg-base-100 gap-1 p-2 rounded-box overflow-y-auto w-full mt-2"
				id="listbox-1"
				role="listbox"
				tabindex="-1"
				bind:this={list}
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
							on:mousedown={() => setSelectedOption(i)}
						>
							<button
								type="button"
								class:active={i === selectedIdx}
								class:font-bold={selected?.[idKey] === option[idKey]}
							>
								{getOptionLabel(option)}
							</button>
						</li>
					{:else}
						<li class="menu-title">
							<span>No items found</span>
						</li>
						<li>
							<button
								type="button"
								class:active={-1 === selectedIdx}
								on:mousedown={dispatchAddNewEntry}
							>
								Create a new item
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
</div>

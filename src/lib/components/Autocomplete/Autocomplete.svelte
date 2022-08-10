<script lang="ts">
	import Spinner from '$lib/components/Spinner/Spinner.svelte';

	import { debounce, uniqBy } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic;

	export let selected: T | undefined = undefined;
	export let options: T[] = [];
	$: {
		if (selected) {
			options = uniqBy([selected, ...options], 'id');
		}
	}

	export let idKey: keyof T;
	export let getLabel: (item: T) => string;
	export let searchFunction: (query: string) => Promise<T[]>;

	let isLoading = false;
	async function search(query: string) {
		isLoading = true;

		const fetchedOptions = await searchFunction(query);

		if (selected) {
			options = uniqBy([...fetchedOptions, selected], 'id');
		} else {
			options = fetchedOptions;
		}

		isLoading = false;
	}

	const debouncedSearch = debounce(search, 500);

	let status: 'focus' | 'blur' = 'blur';
	$: value = selected ? getLabel(selected) : '';
	$: selectedIdx = options.findIndex((v) => (selected ? selected[idKey] === v[idKey] : false));

	const dispatch = createEventDispatcher<{
		select: T;
	}>();
</script>

<div class="relative">
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
			{value}
			on:input={({ currentTarget: { value } }) => debouncedSearch(value)}
			on:focus={() => (status = 'focus')}
			on:blur={() => (status = 'blur')}
		/>
		{#if status === 'focus'}
			<ul
				class="absolute menu bg-base-300 gap-1 p-2 rounded-box overflow-y-auto w-full mt-2"
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
					{:else}
						<li class="menu-title">
							<span>No items found</span>
						</li>
						<li>
							<button
								type="button"
								class:active={-1 === selectedIdx}
								on:mousedown={() => alert('add new entry')}
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

<script lang="ts">
	import Autocomplete from '$lib/components/Autocomplete/Autocomplete.svelte';

	import InputError from '$lib/components/InputError/InputError.svelte';
	import ItemForm from '$lib/components/ItemForm/ItemForm.svelte';

	import toastStore from '$lib/components/Toast/toast.store';
	import trpcClient, { type InferMutationInput, type InferQueryOutput } from '$lib/trpcClient';
	import { TRPCClientError } from '@trpc/client';
	import { createEventDispatcher } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import type { ZodFormattedError } from 'zod';

	export let items: InferQueryOutput<'items:listForAutocomplete'>['items'];
	export let totalItems: number;

	type SaveRecipe = InferMutationInput<'recipes:save'>;
	type RecipeForm = Omit<SaveRecipe, 'items'> & {
		items: Array<
			SaveRecipe['items'][number] & {
				name: string;
			}
		>;
	};

	export let recipe: InferQueryOutput<'recipes:findById'> = null;

	let recipeForm: RecipeForm = {
		id: recipe?.id || '',
		name: recipe?.name || '',
		items: recipe?.items.map((i) => ({ amount: i.amount, id: i.item.id, name: i.item.name })) || [
			makeNewItem()
		]
	};

	type SaveItemErrors = ZodFormattedError<RecipeForm>;
	let errors: SaveItemErrors | undefined;

	const dispatch = createEventDispatcher<{
		submit: void;
	}>();

	const { form, handleSubmit, handleReset, isSubmitting } = createForm<RecipeForm>({
		initialValues: recipeForm,
		onSubmit: async (values) => {
			try {
				await trpcClient().mutation('recipes:save', values);

				toastStore.push({
					kind: 'success',
					message: 'Recipe saved successfully!',
					removeAfter: 2000
				});

				handleReset();
				errors = undefined;

				dispatch('submit');
			} catch (e) {
				if (e instanceof TRPCClientError) {
					errors = e.data.zodError;
				}

				console.error(e);
			}
		}
	});

	function makeNewItem(item?: { id: string; name: string }): RecipeForm['items'][number] {
		return {
			amount: 0,
			name: item?.name || '',
			id: item?.id || ''
		};
	}

	function addItem(item?: { id: string; name: string }) {
		if ($form.items.length === totalItems) {
			return;
		}

		$form.items = [...$form.items, makeNewItem(item)];
	}

	function removeItem(index: number) {
		if ($form.items.length === 1) {
			toastStore.push({
				kind: 'error',
				message: 'You must keep at least 1 item.',
				removeAfter: 3000
			});

			return;
		}

		$form.items = $form.items.filter((_, i) => i !== index);
	}

	$: addNewItemButtonIsDisabled = $form.items.length === totalItems;

	let newItemName = '';
	let createNewItemModalIsOpen = false;
	const openCreateNewItemModal = () => (createNewItemModalIsOpen = true);
	const closeCreateNewItemModal = () => (createNewItemModalIsOpen = false);
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-3 items-center justify-center"
>
	<div class="form-control w-full">
		<label for="recipeName" class="label">
			<span class="label-text">Name</span>
		</label>
		<input
			bind:value={$form.name}
			required
			name="recipeName"
			type="text"
			class="input input-bordered w-full"
			minlength="3"
			class:input-error={errors?.name?._errors}
		/>
		<InputError errors={errors?.name?._errors} />
	</div>
	<div class="divider" />
	<div class="card overflow-visible bg-base-200 w-full shadow-xl mb-4">
		<div class="card-body p-5">
			{#each $form.items as recipeItem, i}
				<div class="flex justify-between">
					<h2 class="card-title">Item {i + 1}</h2>
					<button type="button" on:click={() => removeItem(i)} class="btn btn-square btn-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="form-control w-full">
					<label for="items[{i}].name" class="label">
						<span class="label-text">Item name</span>
						<span class="label-text-alt text-sm">
							<button type="button" class="link" on:click={openCreateNewItemModal}>
								Create a new item
							</button>
						</span>
					</label>
					{#if items.length === 0}
						<button
							type="button"
							on:click={openCreateNewItemModal}
							class="btn btn-outline btn-ghost justify-start">Create a new item</button
						>
					{:else}
						<Autocomplete
							selected={recipeItem}
							options={items.map((i) => ({ name: i.name, id: i.id }))}
							getLabel={(i) => i.name}
							idKey={'id'}
							error={Boolean(errors?.items?.[i]?.id?._errors)}
							searchFunction={async (query) => {
								const { items } = await trpcClient(fetch).query('items:listForAutocomplete', {
									query
								});

								return items;
							}}
							on:select={({ detail }) => {
								const itemAlreadyExistsInThisRecipe = $form.items.some(
									(item, idx) => idx !== i && item.id === detail.id
								);

								if (itemAlreadyExistsInThisRecipe) {
									toastStore.push({
										kind: 'error',
										message: "You can't have duplicate items.",
										removeAfter: 3000
									});
									return;
								}

								recipeItem = {
									...recipeItem,
									id: detail.id,
									name: detail.name
								};
							}}
							on:create={({ detail }) => {
								newItemName = detail;
								openCreateNewItemModal();
							}}
						/>
						<InputError errors={errors?.items?.[i]?.id?._errors} />
					{/if}
				</div>
				<div class="form-control w-full">
					<label for="items[{i}].amount" class="label">
						<span class="label-text">Amount</span>
					</label>
					<input
						bind:value={recipeItem.amount}
						required
						name="amount"
						type="number"
						class="input input-bordered w-full"
						class:input-error={errors?.items?.[i]?.amount?._errors}
					/>
					<InputError errors={errors?.items?.[i]?.amount?._errors} />
				</div>
				<div class="divider" />
			{/each}
			<button
				disabled={addNewItemButtonIsDisabled}
				type="button"
				on:click={() => addItem()}
				class="btn btn-accent btn-outline w-full"
			>
				+ Add item
			</button>
		</div>
	</div>

	<div class="divider" />

	<button type="submit" class:loading={$isSubmitting} class="btn btn-outline btn-secondary w-full">
		Save recipe
	</button>
</form>

<input
	type="checkbox"
	id="createNewItemModal"
	class="modal-toggle"
	bind:checked={createNewItemModalIsOpen}
/>
<label for="createNewItemModal" class="modal cursor-pointer">
	<label for="" class="modal-box relative">
		{#key newItemName}
			<ItemForm
				item={{
					name: newItemName
				}}
				on:submit={async ({ detail }) => {
					closeCreateNewItemModal();
					addItem(detail);
					newItemName = '';
				}}
			/>
		{/key}
	</label>
</label>

<script lang="ts">
	import type { Recipe } from '$lib/types';

	let recipe: Recipe = {
		items: [
			{
				name: '',
				weight: 0
			}
		],
		name: ''
	};

	function removeItem(index: number) {
		recipe.items = recipe.items.filter((_, i) => i !== index);
	}

	function addItem() {
		recipe.items = [
			...recipe.items,
			{
				name: '',
				weight: 0
			}
		];
	}

	async function handleSubmit() {
		alert(JSON.stringify(recipe));
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="flex flex-col gap-3 items-center justify-center"
>
	<h3 class="text-4xl font-bold">Add new recipe</h3>
	<div class="form-control w-full">
		<label for="recipeName" class="label">
			<span class="label-text">Recipe name</span>
		</label>
		<input
			bind:value={recipe.name}
			name="recipeName"
			type="text"
			class="input input-bordered w-full"
		/>
	</div>
	<div class="divider" />
	{#if recipe.items.length > 0}
		<div class="card bg-base-200 w-full shadow-xl mb-4">
			<div class="card-body p-5">
				{#each recipe.items as item, i}
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
						<label for="itemName" class="label">
							<span class="label-text">Item name</span>
						</label>
						<input
							bind:value={item.name}
							name="itemName"
							type="text"
							class="input input-bordered w-full"
						/>
					</div>
					<div class="form-control w-full">
						<label for="weight" class="label">
							<span class="label-text">Item weight (in grams)</span>
						</label>
						<input
							bind:value={item.weight}
							name="weight"
							type="number"
							class="input input-bordered w-full"
						/>
					</div>
					<div class="divider" />
				{/each}
			</div>
		</div>
	{/if}

	<button type="button" on:click={addItem} class="btn btn-outline btn-accent w-full">
		+ New item
	</button>

	<div class="divider" />

	<button type="submit" class="btn btn-outline btn-secondary w-full">Create recipe</button>
</form>

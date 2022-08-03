<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const r = await fetch('/api/recipes');

		const recipes = (await r.json()) as Recipes;

		return {
			props: {
				recipes
			}
		};
	};
</script>

<script lang="ts">
	import { formatCurrency } from '$lib/formatter';

	import type { Load } from '@sveltejs/kit';
	import type { GetOutput as Recipes } from 'src/routes/api/recipes';

	export let recipes: Recipes;

	let computedRecipes = recipes.map((recipe) => {
		const recipeItems = recipe.items.map((item) => {
			return {
				...item,
				computedPrice: (item.amount * item.item.price) / item.item.baseAmount
			};
		});

		return {
			...recipe,
			items: recipeItems,
			totalPrice: recipeItems.reduce((partial, { computedPrice }) => partial + computedPrice, 0)
		};
	});
</script>

<div class="flex sm:flex-row flex-col justify-between items-center mb-5 gap-3">
	<div>
		<h3 class="text-4xl font-bold">Recipes</h3>
	</div>
	<div class="sm:w-fit w-full">
		<a class="btn btn-primary w-full" href="/recipes/new">+ New Recipe</a>
	</div>
</div>

<ul class="grid sm:grid-cols-2 gap-6 md:grid-cols-3">
	{#each computedRecipes as recipe}
		<li class="col-span-1 flex flex-col rounded-lg">
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body p-5">
					<div class="flex justify-between gap-3">
						<h2 class="card-title">{recipe.name}</h2>
						<button type="button" class="btn btn-square btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
					<div class="divider my-0" />
					<ul>
						{#each recipe.items as { item, amount, computedPrice }}
							<li class="flex items-center justify-between">
								<div>
									<span class="text-lg">
										- {item.name}
									</span>
									<span class="text-sm opacity-50">
										{amount}
										{item.amountKind}
									</span>
								</div>
								<div>
									{formatCurrency(computedPrice)}
								</div>
							</li>
						{/each}
					</ul>
					<div class="divider my-0" />
					<div class="flex items-center justify-between">
						<div class="text-2xl">Total:</div>
						<div>
							{formatCurrency(recipe.totalPrice)}
						</div>
					</div>
				</div>
			</div>
		</li>
	{/each}
</ul>

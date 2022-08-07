<script lang="ts" context="module">
	export const load: Load = async ({ params, fetch }) => {
		const dbRecipe = await trpcClient(fetch).query('recipes:findShared', params.id);

		if (!dbRecipe) {
			return {
				redirect: '/app/recipes',
				status: 302
			};
		}

		const items = await trpcClient(fetch).query('items:list', {
			includedInRecipe: dbRecipe.id
		});

		return {
			props: {
				dbRecipe,
				items
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import trpcClient, { type InferMutationInput, type InferQueryOutput } from '$lib/trpcClient';
	import RecipeForm from '$lib/components/RecipeForm/RecipeForm.svelte';
	import { goto } from '$app/navigation';
	import toastStore from '$lib/components/Toast/toast.store';

	type SaveRecipe = InferQueryOutput<'recipes:findShared'>;
	export let dbRecipe: SaveRecipe;
	export let items: InferQueryOutput<'items:list'>;

	let recipe: InferMutationInput<'recipes:save'>;

	if (dbRecipe) {
		recipe = {
			id: dbRecipe.id,
			name: dbRecipe?.name,
			isShared: true,
			items: dbRecipe?.items.map((item) => {
				return {
					id: item.itemId,
					amount: item.amount
				};
			})
		};

		if (dbRecipe.alreadyAcceptedShare) {
			toastStore.push({
				kind: 'info',
				message: 'You already saved this shared recipe!',
				removeAfter: 5000
			});
		}
	}
</script>

<h3 class="text-4xl font-bold text-center">Save shared recipe</h3>
{#if dbRecipe}
	<RecipeForm {items} {recipe} on:submit={() => goto('/app/recipes')} />
{/if}

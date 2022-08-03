import type { Recipe } from '@prisma/client';
import type { ApiRecipeCreateInput, ApiRecipeOutput } from 'src/routes/api/recipes';

type FetchType = (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

type BaseInput = {
	fetch?: FetchType;
};

const globalFetch = fetch;

type LoadRecipesInput = BaseInput;

export async function loadRecipes({
	fetch = globalFetch
}: LoadRecipesInput): Promise<ApiRecipeOutput[]> {
	const r = await fetch('/api/recipes', {
		headers: {
			Accept: 'application/json'
		}
	});

	const recipes = (await r.json()) as ApiRecipeOutput[];

	return recipes;
}

type CreateRecipeInput = BaseInput & {
	recipe: ApiRecipeCreateInput;
};

export async function createRecipe({
	fetch = globalFetch,
	recipe
}: CreateRecipeInput): Promise<Recipe> {
	const r = await fetch('/api/recipes', {
		method: 'POST',
		headers: {
			Accept: 'application/json'
		},
		body: JSON.stringify(recipe)
	});

	const createdRecipe = (await r.json()) as Recipe;

	return createdRecipe;
}

type DeleteRecipeInput = BaseInput & {
	id: Recipe['id'];
};

export async function deleteRecipe({ fetch = globalFetch, id }: DeleteRecipeInput): Promise<void> {
	await fetch(`/api/recipes/${id}`, {
		method: 'DELETE'
	});
}

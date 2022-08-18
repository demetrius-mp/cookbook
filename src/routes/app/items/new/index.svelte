<script lang="ts">
	import { goto } from '$app/navigation';
	import ItemForm from '$lib/components/Forms/ItemForm/ItemForm.svelte';
	import { TitleWithGoBackIcon } from '$lib/components/Navigation';
</script>

<TitleWithGoBackIcon href="/app/items" title="New item" />

<ItemForm on:submit={() => goto('/app/items')} />

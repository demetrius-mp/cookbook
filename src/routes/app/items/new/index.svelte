<script lang="ts">
	import { goto } from '$app/navigation';

	import ItemForm from '$lib/components/ItemForm/ItemForm.svelte';
	import TitleWithGoBackIcon from '$lib/components/TitleWithGoBackIcon/TitleWithGoBackIcon.svelte';
</script>

<TitleWithGoBackIcon href="/app/items" title="New item" />

<ItemForm on:submit={() => goto('/app/items')} />

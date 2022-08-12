<script lang="ts">
	export let errors: string[] = [];
</script>

{#if errors && errors.length > 0}
	<label for="baseAmount" class="label">
		{#each errors as error}
			<span class="label-text-alt">{error}</span>
		{/each}
	</label>
{/if}

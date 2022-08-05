<script lang="ts">
	export let show = false;
	export let errors: string[] = [];
</script>

{#if show}
	<label for="baseAmount" class="label">
		{#each errors as error}
			<span class="label-text-alt">{error}</span>
		{/each}
	</label>
{/if}

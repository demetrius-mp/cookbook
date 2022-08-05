<script lang="ts">
	import InputError from './InputError.svelte';
	import type { MappedZodError } from '$lib/utils/zod.util';
	import { startCase } from 'lodash-es';

	type T = $$Generic;
	type Errors = MappedZodError<T>;

	export let errors: Errors | undefined = undefined;
	export let key: keyof Errors;
	export let label = startCase(String(key));

	$: hasError = errors !== undefined && errors[key] && errors[key]._errors.length > 0;
</script>

{#if $$slots.label || label}
	<slot name="label">
		<label for={String(key)} class="label">
			<span class="label-text">{label}</span>
		</label>
	</slot>
{/if}

<slot {hasError} />

{#if errors}
	<InputError show={hasError} errors={errors[key]._errors} />
{/if}

<script lang="ts">
	import InputError from './InputError.svelte';
	import { startCase } from 'lodash-es';
	import type { ZodFormattedError } from 'zod';

	type T = $$Generic;
	type Errors = ZodFormattedError<T>;

	export let errors: Errors | undefined = undefined;
	export let key: keyof Omit<Errors, '_errors'>;
	export let label = startCase(String(key));

	$: hasError =
		errors !== undefined &&
		errors[key] !== undefined &&
		(errors[key] as { _errors: string[] })._errors.length > 0;
</script>

{#if $$slots.label || label}
	<slot name="label">
		<label for={String(key)} class="label">
			<span class="label-text">{label}</span>
		</label>
	</slot>
{/if}

<slot {hasError} />

{#if errors && hasError}
	<InputError show={hasError} errors={errors[key]._errors} />
{/if}

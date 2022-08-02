<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="overflow-y-auto w-80 bg-base-200">
	<div class="navbar">
		<a href="/" class="btn btn-ghost normal-case text-xl">cookbook</a>
	</div>
	<div class="divider my-0 h-0" />
	<ul class="menu p-3 mt-1 gap-2">
		<li>
			<a class:active={$page.url.pathname.includes('recipes')} href="/recipes">Recipes</a>
		</li>
		<li>
			<a class:active={$page.url.pathname.includes('items')} href="/items">Items</a>
		</li>
	</ul>
</div>

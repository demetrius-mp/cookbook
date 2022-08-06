<script lang="ts">
	import { session } from '$app/stores';

	import IconLogout from '$lib/components/Icons/IconLogout.svelte';
	import trpcClient from '$lib/trpcClient';

	async function handleSignOut() {
		try {
			await trpcClient().query('users:sign-out');
			$session.user = null;
		} catch (e) {
			console.error(e);
		}
	}
</script>

<div class="dropdown dropdown-end">
	<button tabindex="0" for="profile dropdown">
		<div class="avatar">
			<div class="rounded-full w-10">
				<img alt="profile" src={$session.user?.profilePictureUrl} />
			</div>
		</div>
	</button>
	<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
		<li>
			<button on:click={handleSignOut} class="text-error">
				<IconLogout />
				Sign out
			</button>
		</li>
	</ul>
</div>

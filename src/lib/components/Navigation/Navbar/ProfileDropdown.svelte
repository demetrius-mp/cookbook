<script lang="ts">
	import { session } from '$app/stores';
import IconLogout from '$lib/components/Icons/IconLogout.svelte';
	import IconUser from '$lib/components/Icons/IconUser.svelte';
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
	<ul tabindex="0" class="dropdown-content menu shadow bg-base-300 rounded-box w-52">
		<div class="px-4 pt-3">
			<p class="text-sm">Signed in as</p>
			<p class="text-sm font-medium truncate">{$session.user?.email}</p>
		</div>
		<div class="divider m-0 mt-2 h-0" />
		<li>
			<a href="/app/profile">
				<IconUser />
				Profile
			</a>
		</li>
		<div class="divider m-0 h-0.5" />
		<li>
			<button on:click={handleSignOut} class="text-error">
				<IconLogout />
				Sign out
			</button>
		</li>
	</ul>
</div>

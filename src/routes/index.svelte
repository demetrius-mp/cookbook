<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ session }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/sign-in'
			};
		}

		return {
			status: 302,
			redirect: '/app'
		};
	};
</script>

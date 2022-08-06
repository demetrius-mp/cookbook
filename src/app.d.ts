// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	interface Locals {
		theme: import('./lib/utils/theme.util').Theme;
		user: Omit<import('@prisma/client').User, 'password'> | null;
		hasCookie?: string;
	}
	// interface Platform {}
	// interface PrivateEnv {}
	// interface PublicEnv {}
	interface Session {
		theme: import('./lib/utils/theme.util').Theme;
		user: Omit<import('@prisma/client').User, 'password'> | null;
	}
	// interface Stuff {}
}

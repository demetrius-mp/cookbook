# cookbook

# About the stack

This application is built using the following technologies:

- Frontend: [SvelteKit](https://github.com/sveltejs/kit)
- CSS: [TailwindCSS](https://github.com/tailwindlabs/tailwindcss) with [DaisyUI](https://github.com/saadeghi/daisyui) components
- Backend: [tRPC](https://github.com/trpc/trpc)
- Database: [PostgreSQL](https://github.com/postgres/postgres) with [Prisma](https://github.com/prisma/prisma) as the ORM.
- Deploy: [Vercel](https://github.com/vercel/vercel) for the frontend, and [Supabase](https://github.com/supabase/supabase) for the PostgreSQL provider.

# Developing

1. Install the dependencies using `npm i` or your preferred package manager.
2. Run `cp .env.example .env` to create the environment file.
3. Define the required environment variables, such as `VITE_JWT_SECRET_KEY` and `DATABASE_URL`.

# Environment variables description

`VITE_JWT_SECRET_KEY`: Secret key used to generate JWT's.

Recommended value: the output of the `openssl rand -hex 32` command.

`DATABASE_URL`: PostgreSQL connection string.

# Features

- [x] Manage items to use on recipes.
- [x] Manage recipes.
- [x] Browse through other user's recipes.
- [x] Sharing link for recipes.
- [x] Create copy of recipes to your own account.
- [x] Like/dislike recipes.
- [x] Enchanced app navigation with drawers, tabs, and back buttons.
- [x] Enchanced form experience by allowing to create items without leaving the recipe page.

# Known Issues

- Recipes and item deletions might not work properly due to referential integrity.

# Possible improvements

- Use a modal instead of native js `confirm` to confirm delete and other critical actions.

# My personal experience with this stack

```
TODO
```

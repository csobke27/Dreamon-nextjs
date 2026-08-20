# Dreamon

This project now runs on Next.js with the App Router.

## Scripts

- `npm run dev` starts the local development server on `http://localhost:3000`.
- `npm run build` creates the production build.
- `npm run start` serves the production build.
- `npm run test` prints the current test-runner status.

## Content Source

Blog content is fetched from the WordPress API configured in `NEXT_PUBLIC_WP_API_BASE`.

If that environment variable is not set, the app falls back to:

`https://public-api.wordpress.com/wp/v2/sites/coreytestblog4.wordpress.com/`

## Migration Notes

- Routing is handled by Next.js file-based routes under `src/app`.
- Shared site chrome is applied from the root layout and route-aware shell.
- Blog listing and blog post pages fetch WordPress data on the server.
- Existing public assets continue to load from `public/images` and `public/fonts`.

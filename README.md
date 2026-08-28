# Dreamon

Dreamon is a Next.js website for Dreamon Interactive, with blog content managed in Sanity and deployed to Cloudflare Workers through OpenNext.

## Scripts

- `npm run dev` starts the local development server on `http://localhost:3000`.
- `npm run build` creates the production build.
- `npm run start` serves the production build.
- `npm run test` runs the Jest test suite.
- `npm run build:worker` creates the Cloudflare Worker bundle with OpenNext.
- `npm run deploy` builds and deploys the site to Cloudflare Workers.

## Sanity

The blog, post detail pages, related posts, and Nyx Legacy updates use Sanity content. The embedded Sanity Studio is available at `/studio` during local development and in production.

Create a local `.env.local` file with:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-08-27
```

`NEXT_PUBLIC_SANITY_API_VERSION` is optional and defaults to `2026-08-27`.

Add each website origin to Sanity's CORS settings if it needs to access the Studio. For local development, use `http://localhost:3000`. Add the production URL before deploying.

The root layout renders `SanityLive`, so pages using `sanityFetch` update when published Sanity content changes.

## Cloudflare Deployment

The Cloudflare Worker configuration is in `wrangler.jsonc`. Before deploying, make sure the Sanity environment variables are available during the Cloudflare build and that Wrangler is authenticated.

```bash
npm run build:worker
npm run deploy
```

## Project Structure

- Routing is handled by Next.js file-based routes under `src/app`.
- Shared site chrome is applied from the root layout and route-aware shell.
- Sanity schemas and client helpers are in `src/sanity`.
- The embedded Studio is mounted at `src/app/studio/[[...tool]]`.
- Blog listing and blog post pages fetch Sanity data on the server.
- Existing public assets continue to load from `public/images` and `public/fonts`.

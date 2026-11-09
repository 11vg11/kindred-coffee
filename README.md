# Kindred Coffee

A full-stack coffee shop MVP with a React storefront and an Express API.

## Architecture

- `apps/frontend` — React, TypeScript, and Vite.
- `apps/backend` — Express and TypeScript.
- The Vite development server proxies `/api` requests to the backend on port `3001`.
- Orders are currently stored in memory and disappear when the backend restarts.

## Run locally

```sh
npm ci
npm run dev
```

Open the frontend URL printed by Vite (usually `http://localhost:5173`). The API is available at `http://localhost:3001/api`.

Run frontend tests with `npm run test:frontend` and create production builds with `npm run build`.

The verified DevOps roadmap, with completed and remaining work, is in [1README.md](./1README.md).

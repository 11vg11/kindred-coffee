# Kindred Coffee

A small full-stack coffee shop ordering app with a React storefront and a separate Express API.

## Architecture

- `apps/frontend` — React, TypeScript, and Vite. Renders the menu, category filters, cart, and checkout.
- `apps/backend` — Express and TypeScript. Serves the menu and validates/stores orders in memory.
- The Vite development server proxies `/api` requests to the backend on port `3001`.

## Run locally

```sh
npm install
npm run dev
```

Open the frontend URL printed by Vite (usually `http://localhost:5173`). The API is available at `http://localhost:3001/api`.

To create production builds, run `npm run build`. To run the built API, run `npm start`.

Run the frontend component tests with `npm run test:frontend`.

Pull requests targeting `frontend-stage` run the frontend tests and production build in GitHub Actions. A failed check blocks merging and posts a failure notice on the pull request.

Orders are kept in process memory for this MVP and are cleared when the API restarts. Add a database and persistent repository before using it for real orders.

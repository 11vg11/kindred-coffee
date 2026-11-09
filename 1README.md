# Kindred Coffee — Project Guide and Infrastructure Roadmap

Kindred Coffee is a full-stack coffee shop MVP and a learning project for building, testing, and promoting application changes through GitHub. This guide describes the current implementation and separates working features from planned infrastructure.

**Repository:** [11vg11/kindred-coffee](https://github.com/11vg11/kindred-coffee)

**Status last verified:** 2026-11-09

## Contents

- [Project overview](#project-overview)
- [Architecture](#architecture)
- [Requirements and local setup](#requirements-and-local-setup)
- [API reference](#api-reference)
- [Testing and builds](#testing-and-builds)
- [Branches and promotion workflow](#branches-and-promotion-workflow)
- [Current delivery status](#current-delivery-status)
- [Infrastructure roadmap](#infrastructure-roadmap)
- [Security and operational guidance](#security-and-operational-guidance)

## Project overview

The application provides a small coffee menu and an ordering experience. The storefront loads products from the API, filters by category, maintains a cart, calculates a displayed subtotal, and submits an order. The backend validates submitted product IDs and quantities and calculates the authoritative total from its own menu prices.

### Implemented

- React storefront with category filters, cart controls, and checkout confirmation.
- Express API with health, product menu, and order endpoints.
- Request validation and server-side order pricing.
- Frontend tests for menu rendering, category filtering, cart totals, and order confirmation.
- GitHub Actions workflows for frontend validation and promotion checks on the branches where those workflows are installed.

### Current limitations

- Orders are held in process memory. They are lost when the backend restarts, and there is no database.
- No authentication, payment processing, or production-ready customer/order management is implemented.
- The Vite proxy is for local development; production routing has not been configured.
- The project has no Docker images, deployment automation, cloud infrastructure, or Kubernetes configuration yet.
- Backend unit and API integration tests have not been added.

This is an MVP and learning environment, not a production ordering service.

## Architecture

| Component | Technology | Location | Responsibility |
| --- | --- | --- | --- |
| Web client | React, TypeScript, Vite | `apps/frontend` | Menu, cart, checkout UI |
| API | Express, TypeScript | `apps/backend` | Health, products, order validation and totals |
| Workspace | npm workspaces | repository root | Shared dependency installation and scripts |
| CI | GitHub Actions | `.github/workflows` | Frontend checks and promotion checks |

During local development, the Vite server proxies requests under `/api` to the backend at `http://localhost:3001`. The frontend and backend are started together by the root `dev` script.

### Repository layout

```text
.
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── data/
│   │       ├── routes/
│   │       └── server.ts
│   └── frontend/
│       ├── src/
│       └── tests/
├── package.json
├── package-lock.json
├── README.md
└── 1README.md
```

## Requirements and local setup

Install a current Node.js LTS release and npm. Then, from the repository root:

```sh
npm ci
npm run dev
```

Open the frontend URL printed by Vite, usually `http://localhost:5173`. The API listens on port `3001` by default.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install exact dependencies from the lockfile |
| `npm run dev` | Start frontend and backend in development mode |
| `npm run test:frontend` | Run frontend tests |
| `npm run build` | Build frontend and compile backend |
| `npm start` | Start the compiled backend |

The backend reads `PORT` when set and otherwise uses port `3001`. The development proxy currently targets port `3001`, so changing the backend port may require updating the Vite configuration as well.

## API reference

All endpoints are served by the backend under `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Return API health status |
| `GET` | `/api/products` | Return the available menu products |
| `GET` | `/api/orders` | Return orders held in backend memory |
| `POST` | `/api/orders` | Validate and create an order |

Create an order by sending product IDs and quantities. Prices and names are resolved by the backend; client-supplied prices are not used.

```json
{
  "items": [
    { "productId": "cappuccino", "quantity": 2 }
  ]
}
```

Each order must include at least one known product. Each item quantity must be an integer from 1 to 20. Invalid requests return HTTP `400`; successful creation returns HTTP `201` with the created order. The order total is calculated from the server's product catalog.

## Testing and builds

Run the frontend test suite and production builds before submitting changes:

```sh
npm run test:frontend
npm run build
```

The frontend tests currently cover:

- Rendering menu products returned by the mocked API.
- Filtering products by category.
- Updating the cart and subtotal after adding an item.
- Submitting a cart and displaying successful confirmation.

The production build type-checks and bundles the frontend, then compiles the backend TypeScript. API-level tests, backend test coverage, Docker builds, and container smoke tests are future work.

## Branches and promotion workflow

The active repository branches and their current purpose are:

| Branch | Purpose | Required checks / status |
| --- | --- | --- |
| `main` | Release baseline | `promotion-ci` and `qa-lead-signoff`; setup PR #5 is still open |
| `stage` | Integration branch | `promotion-ci` |
| `frontend-stage` | Frontend integration | `frontend-ci` and `promotion-ci` |
| `backend-stage` | Backend integration | Pull requests required; no CI check is currently required |
| `feature/qa-lead-gates` | Current setup branch | Open PR #5 to `main` |

Pull requests are required on the protected branches. Force pushes and branch deletion are disabled there. The repository is used by one learner, so the required approving-review count is zero.

### Intended change flow

```text
feature/* → frontend-stage or backend-stage → stage → main
```

For a frontend change:

1. Create a focused feature branch from `frontend-stage`.
2. Open a pull request into `frontend-stage` and resolve the required frontend and promotion CI checks.
3. Promote the integrated change into `stage` through a pull request; require `promotion-ci`.
4. Open a pull request from `stage` to `main`.
5. Complete QA and lead review evidence, then satisfy the `qa-lead-signoff` gate.

For a backend change, use `backend-stage` as the first integration target. Add and require backend CI there before relying on it as a merge gate.

The QA/lead gate checks for the `qa-approved` and `lead-approved` labels and completed QA and lead checklist items in the pull request. In this solo repository, those are self-attested learning checkpoints, not independent approvals. A team workflow should require actual reviewers and enforce separation of duties.

### Current promotion setup

- PR [#5](https://github.com/11vg11/kindred-coffee/pull/5) is open from `feature/qa-lead-gates` to `main`.
- Its `promotion-ci` check passes. The `qa-lead-signoff` check fails intentionally until the required labels and checklist evidence are supplied.
- The `promotion-ci` workflow is present on `frontend-stage` and `feature/qa-lead-gates`; it is not yet installed on `main`, `stage`, or `backend-stage`.
- The `frontend-ci` and `promotion-ci` checks are required on `frontend-stage`; `promotion-ci` is required on `stage` and `main`.
- `backend-stage` does not yet have a required status check.

Do not treat a configured required check as proof that a workflow is available on every branch. After PR #5 is resolved, verify that each workflow runs on the target branch and that branch protection reports the expected check before making that check a merge prerequisite.

## Current delivery status

| Area | Status | Notes |
| --- | --- | --- |
| Application baseline | ✅ Complete | Local storefront and API were verified |
| Branch protections | 🟡 In progress | Branch protection is configured; backend CI is not required yet |
| Frontend CI | ✅ Available on `frontend-stage` | Tests and frontend build run in GitHub Actions |
| Promotion CI | 🟡 In progress | Workflow is on `frontend-stage`; setup PR #5 is still open |
| QA/lead gate | 🟡 In progress | Self-attestation gate is defined; PR #5 remains intentionally blocked |
| Backend automated tests | ⬜ Not started | No backend test suite yet |
| Persistent storage | ⬜ Not started | Orders are in memory |
| Docker and Compose | ⬜ Not started | No container definitions |
| Image publishing and deployment | ⬜ Not started | No registry or deployment workflow |
| Cloud infrastructure | ⬜ Not started | No Terraform or Ansible configuration |
| Kubernetes | ⬜ Not started | No local or cloud cluster configuration |
| Monitoring and recovery | ⬜ Not started | No production logging, alerting, or backup process |

## Infrastructure roadmap

Work through these phases in order. Keep deployment and cloud provisioning out of scope until the application tests and container behavior are reliable.

### 1. Complete application validation

- Add backend unit and API integration tests.
- Cover health response, menu schema, valid and invalid orders, trusted pricing, and order retrieval.
- Extend frontend tests for quantity limits, request failures, and error messages.
- Add explicit lint and type-check scripts if they improve local and CI feedback.

**Exit criteria:** relevant tests and builds pass consistently on pull requests.

### 2. Finish GitHub promotion controls

- Merge and verify the promotion workflow setup through the intended review process.
- Install and run the workflow on each intended promotion target.
- Add backend CI to `backend-stage` before requiring its status check.
- Verify status-check names and branch protection settings against actual Actions runs.
- Replace self-attested QA/lead labels with independent reviews if additional reviewers join.

**Exit criteria:** each protected merge target has an available, passing required CI check.

### 3. Add persistence

- Select a database and define order storage and migration strategy.
- Move order creation and retrieval behind a persistence layer.
- Use isolated test data or a disposable test database in CI.
- Test that orders remain available after an application restart.

**Exit criteria:** order behavior is tested against persistent storage without leaking test data.

### 4. Containerize and smoke-test

- Create production Dockerfiles with multi-stage builds, minimal runtime images, and non-root execution.
- Add `.dockerignore` and a Compose configuration for local integration.
- Select production routing; the Vite proxy is development-only.
- Add health checks and smoke tests through the public application entry point.
- Verify logs and cleanup behavior when a smoke test fails.

**Exit criteria:** a documented command starts the app containers, and frontend-to-API behavior works through production routing.

### 5. Publish versioned images

- Publish frontend and backend images to GHCR only from trusted, passing workflows.
- Tag images with immutable commit identifiers and release versions.
- Scan images and document which vulnerability findings block publication.
- Verify images can be pulled and run without source files on the host.

**Exit criteria:** every deployed image can be traced to source and a passing CI run.

### 6. Provision and configure infrastructure

- Confirm AWS access, region, budget, and cleanup expectations before creating resources.
- Provision only the required infrastructure with Terraform and protect state and credentials.
- Configure a clean host with Ansible; keep the playbook idempotent.
- Restrict network access and keep data and service ports private where possible.

**Exit criteria:** infrastructure can be reproduced from reviewed configuration and configured from a clean host.

### 7. Deploy, observe, and recover

- Deploy to staging only after CI passes; define a deliberate release process for `main`.
- Use GitHub Environments, least-privilege permissions, and AWS OIDC where supported.
- Add post-deployment health checks, logs, alerts, and deployment serialization.
- Record image versions and test rollback.
- Back up persistent data and verify restoration.

**Exit criteria:** releases are traceable, observable, and recoverable.

### 8. Learn Kubernetes (optional)

- Start with a local cluster such as Minikube.
- Add Deployments, Services, probes, resource limits, configuration, and ingress.
- Add persistent storage only after the storage design is understood.
- Practice rollout, workload recovery, and rollback before considering a cloud cluster.

AWS Kubernetes is optional learning work and can incur substantial cost. A single-node lab is not highly available.

## Security and operational guidance

- Never commit credentials, private keys, `.env` files, or Terraform state.
- Commit only safe example configuration; provide secrets at runtime through a secrets manager or GitHub Environment.
- Keep GitHub Actions permissions and cloud roles as narrow as practical.
- Do not place credentials in Dockerfiles, source-controlled Compose files, logs, or container images.
- Review Terraform plans before applying them. Cloud resources can incur charges; document and verify cleanup.
- Define a vulnerability policy before turning dependency or image scan results into merge blockers.
- Treat backups as unverified until a restore has been tested.

## Recommended next steps

1. Resolve PR #5’s setup checks and verify workflow availability on the protected branches.
2. Add backend API tests and frontend error-path coverage.
3. Implement persistent order storage and restart/retrieval tests.
4. Containerize the frontend and backend and test their production routing together.
5. Add image publishing and deployment only after the preceding checks pass.

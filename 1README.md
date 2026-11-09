# Kindred Coffee — Final DevOps Roadmap

Repository: [11vg11/kindred-coffee](https://github.com/11vg11/kindred-coffee)

This is the implementation plan and status record for the coffee app. It is based on the actual repository and GitHub branches, not the earlier NestJS/Nginx assumptions.

## Status key

- ✅ Done and verified
- 🟡 Partially done
- ⬜ Not started
- ◻ Optional future work

**Last verified:** 2026-11-09

## Current application

- Frontend: React, TypeScript, and Vite in `apps/frontend`.
- Backend: Express and TypeScript in `apps/backend` (this is not NestJS).
- Root npm workspaces: `npm ci`, `npm run dev`, and `npm run build`.
- The Vite development server proxies `/api` to the backend on port `3001`.
- The API provides health and menu endpoints, accepts validated orders, and exposes the in-memory order list.
- Orders are not persistent; restarting the backend clears them. There is no database yet.
- The frontend and backend were started together and an order was submitted through the browser. Invalid orders were rejected. A clean-lockfile install and production build also passed.

## Git and CI status

| Branch | Purpose | Current protection |
| --- | --- | --- |
| `main` | Reviewed release baseline | Pull request required; no status check required |
| `stage` | Integrate frontend, backend, and DevOps work | Pull request required; no status check required |
| `backend-stage` | Backend integration | Pull request required; no status check required |
| `frontend-stage` | Frontend integration | Pull request and `frontend-ci` check required |
| `fronend-stage` | Old, misspelled branch | Retained unchanged; do not use for new work |

Pull requests are required on the four working branches; force pushes and branch deletion are disabled. Force pushes and branch deletion are disabled. The required reviewer count is zero because this is a solo learning repository. `frontend-stage` requires `frontend-ci`; `stage` and `main` require the promotion checks configured by the current setup PR. The `backend-stage` CI check is also being added by this PR.

The frontend “Surprise me” feature and its test are on `frontend-stage`. The feature was reverted from `main`; `stage` and `backend-stage` have not yet received it.

Recommended workflow:

```text
feature/* → frontend-stage or backend-stage → stage → main
```

Use focused feature branches and pull requests. The intended process is:

```text
feature/* → frontend-stage (frontend CI) → stage (promotion CI) → main
                                                               ├─ QA checklist + qa-approved label
                                                               └─ Lead checklist + lead-approved label
```

In this solo learning repository, QA and lead labels/checklists are self-attested milestones, not independent approvals. A real team should use independent reviewers.

## Roadmap overview

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Verify application baseline | ✅ Done |
| 2 | Establish Git controls | 🟡 Branches/protection done; checks incomplete |
| 3 | Containerize application | ⬜ Not started |
| 4 | Complete CI and automated tests | 🟡 Frontend test/build workflow only |
| 5 | Publish versioned images | ⬜ Not started |
| 6 | Provision AWS with Terraform | ⬜ Not started |
| 7 | Configure EC2 with Ansible | ⬜ Not started |
| 8 | Automate deployment and rollback | ⬜ Not started |
| 9 | Run Kubernetes locally | ⬜ Not started |
| 10 | Optional Kubernetes on AWS | ◻ Optional |
| 11 | Monitoring, security, and recovery | ⬜ Not started |

## Phase 1 — Verify the application baseline

**Status: ✅ Done**

- ✅ Confirmed repository structure, npm workspaces, and actual stack.
- ✅ Verified local startup, health and menu APIs, and frontend-to-backend proxying.
- ✅ Completed a browser checkout and verified order validation and calculated total.
- ✅ Ran `npm ci` and `npm run build`.
- ✅ Confirmed orders are in memory and disappear when the backend restarts.
- ✅ Documented startup and architecture in the root README.
- ⚠️ No database, `.env.example`, or persistent order storage exists. The `PORT` environment variable is optional.

**Result:** the current MVP runs locally and can complete an order. It is not production-ready for real orders because data is not persisted.

## Phase 2 — Establish Git controls

**Status: 🟡 Partially done**

- ✅ Created `stage`, `backend-stage`, and correctly spelled `frontend-stage` from the application baseline.
- ✅ Protected `main`, `stage`, `backend-stage`, and `frontend-stage` with pull-request requirements.
- ✅ Required the `frontend-ci` check on `frontend-stage`.
- ✅ Require `promotion-ci` on `stage`.
- ✅ Require `promotion-ci` and `qa-lead-signoff` on `main`.
- 🟡 Add `promotion-ci` to `backend-stage` after the workflow update is merged.
- ⬜ Add required CI checks to `backend-stage`, `stage`, and `main` after those workflows exist.
- ⬜ Decide whether to remove the obsolete `fronend-stage` branch; do not delete it without approval.
- ⬜ Add reviewer requirements if the repository gains additional reviewers.

**Acceptance:** each protected branch requires its appropriate passing CI check before merge.

## Phase 3 — Containerize the application

**Status: ⬜ Not started**

- [ ] Add frontend and backend Dockerfiles using multi-stage builds and maintained base images.
- [ ] Run the backend as a non-root user and add a `.dockerignore`.
- [ ] Choose and implement production routing. The current Vite proxy is for development only; Nginx is one option, not an existing component.
- [ ] Add a Compose file with frontend, backend, internal networking, health checks, and restart policies.
- [ ] Choose persistent storage before claiming order data survives restarts.
- [ ] Verify container recreation and data behavior without deleting data volumes.

**Acceptance:** one documented command starts the containerized app; the website can reach the API through the production routing layer.

## Phase 4 — Complete continuous integration

**Status: 🟡 Partially done**

### Existing CI

- ✅ On pull requests and pushes to `frontend-stage`, GitHub Actions runs `npm ci`, the frontend component test, and the frontend production build.
- ✅ Failure posts a comment on the pull request with a link to the run.
- ✅ The `frontend-ci` check is required before merging into `frontend-stage`.
- 🟡 The frontend has coverage for menu rendering, category filtering, cart totals, checkout, and the “Surprise me” feature on `frontend-stage`.
- 🟡 Promotion CI runs frontend tests and both production builds for PRs to `stage` and `main`.
- 🟡 Main-promotion QA and lead checklists/labels are required self-attestation gates; they are not independent approvals.

### Work still needed

- [ ] Add lint and explicit type-check scripts where useful; the frontend build currently runs TypeScript checking as part of Vite's build command.
- [ ] Add backend unit tests and API integration tests.
- [ ] Test health, menu shape, valid/invalid orders, trusted pricing, and order retrieval.
- [ ] Add frontend tests for menu rendering/filtering, quantity controls, checkout success, and API errors.
- [ ] Add a root CI workflow that runs all relevant checks for pull requests to `backend-stage`, `frontend-stage`, `stage`, and `main`.
- [ ] Build both production applications in CI.
- [ ] Configure the passing checks as required branch protection checks on all merge targets.
- [ ] Keep CI test data isolated; use temporary storage or a test database once persistence is implemented.

**Acceptance:** every application pull request runs relevant tests and builds; failed checks block merging and link to clear failure logs.

## Phase 5 — Publish container images

**Status: ⬜ Not started**

- [ ] Publish frontend and backend images to GitHub Container Registry (GHCR).
- [ ] Publish only from trusted branches/releases after checks pass.
- [ ] Tag images with the source commit SHA and release versions.
- [ ] Scan images and review vulnerabilities.
- [ ] Verify the published images can be pulled and run without source code on the server.

**Acceptance:** deployments use immutable, traceable image versions.

## Phase 6 — Provision AWS with Terraform

**Status: ⬜ Not started**

- [ ] Choose an AWS region and confirm access, budget, and cleanup expectations.
- [ ] Define only the required network, server, and security-group resources.
- [ ] Restrict SSH and expose only required public ports; keep service and data ports private.
- [ ] Define variables, outputs, tags, and example configuration without credentials.
- [ ] Secure Terraform state and locking before using CI for infrastructure.
- [ ] Review plans before applying changes and document safe cleanup.

**Acceptance:** Terraform reproducibly provisions the reviewed infrastructure. AWS resources can incur charges.

## Phase 7 — Configure EC2 with Ansible

**Status: ⬜ Not started**

- [ ] Build inventory from verified Terraform outputs.
- [ ] Install and configure Docker and Compose on a clean server.
- [ ] Deploy the Compose configuration and securely supply runtime settings.
- [ ] Pull exact image versions and verify health through the public entry point.
- [ ] Run the playbook twice to verify idempotence.

**Acceptance:** Ansible can configure a clean server into a working app host.

## Phase 8 — Automate deployment and rollback

**Status: ⬜ Not started**

- [ ] Deploy to staging only after CI passes.
- [ ] Define a deliberate production release process from `main`.
- [ ] Use GitHub Environments, least-privilege credentials, and AWS OIDC where appropriate.
- [ ] Prevent overlapping deployments to the same environment.
- [ ] Run post-deployment health and smoke checks.
- [ ] Record the previous image versions and test rollback.

**Acceptance:** staging and production releases are traceable, health-checked, and recoverable.

## Phase 9 — Run Kubernetes locally

**Status: ⬜ Not started**

- [ ] Use Minikube or another local cluster.
- [ ] Define frontend/backend Deployments and internal Services.
- [ ] Add configuration, securely supplied Secrets, health probes, and resource limits.
- [ ] Add persistent storage only after the application storage design supports it.
- [ ] Configure ingress and verify routing.
- [ ] Practice rollout, Pod recovery, and rollback.

**Acceptance:** the app runs locally in Kubernetes and recovers from workload restarts.

## Phase 10 — Optional Kubernetes on AWS

**Status: ◻ Optional**

Choose either K3s on EC2 (more cluster operations) or EKS (managed service, more cost and configuration) only after local Kubernetes is understood.

- [ ] Provision the selected cluster with Terraform.
- [ ] Restrict cluster API access and configure image access and persistent storage.
- [ ] Deploy through CI/CD and verify health and rollback.

**Acceptance:** the selected AWS cluster receives reproducible releases. A single-node lab is not highly available.

## Phase 11 — Monitoring, security, and recovery

**Status: ⬜ Not started**

- [ ] Collect application and deployment logs; monitor availability and host/container resources.
- [ ] Add useful alerts; Prometheus and Grafana are optional tools.
- [ ] Scan dependencies and images; scan committed content for secrets.
- [ ] Set a clear vulnerability policy for which findings block merges.
- [ ] Configure HTTPS when a hostname is available.
- [ ] Back up persistent data and verify a restore.
- [ ] Document incident triage and release rollback.

**Acceptance:** failures can be detected, diagnosed, and recovered from using documented procedures.

## Recommended next steps

1. Extend the existing frontend CI to run on all relevant PR targets and add required check protection.
2. Add backend tests for API validation and pricing, plus frontend behavior tests.
3. Implement persistent order storage and tests for retrieving data after restart.
4. Containerize the real frontend/backend structure and add container smoke tests through the production routing layer.
5. Add image publishing and deployment only after the previous checks pass.

## Secrets and safety

- Never commit `.env` files, private keys, credentials, or Terraform state.
- Commit only safe example configuration.
- Treat Terraform state and plans as potentially sensitive.
- Use GitHub Secrets/Environments or cloud identity federation for deployment credentials.
- Do not put credentials in Dockerfiles or container images.
- Keep cloud access and workflow permissions as limited as possible.

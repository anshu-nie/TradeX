# TradeX – GitHub Actions CI/CD Pipeline Guide

The CI/CD pipeline defined in `.github/workflows/ci-cd.yml` automates testing, image verification, container registry publishing, and cloud deployment.

---

## 1. Pipeline Stages Breakdown

### Stage 1 - 5: Test & Build (`test-and-build` Job)
Runs on **every push and pull request** targeting `main` or `develop`.
1. **Checkout**: Checks out git repository using `actions/checkout@v4`.
2. **Setup Node.js**: Configures Node 20 with npm package-lock caching.
3. **Automated Backend Tests**: Runs `npm test` inside `backend/` using Jest and in-memory MongoDB.
4. **Automated Frontend Tests**: Runs `npm test` inside `frontend/` using Vitest and React Testing Library.
5. **Frontend Build**: Verifies that `npm run build` succeeds without syntax or compilation errors.

### Stage 6: Docker Build & Compose Validation (`docker-validation` Job)
Executes after `test-and-build` passes.
1. Validates `docker-compose.yml` syntax via `docker compose config`.
2. Builds both frontend and backend Docker images using Docker Buildx to confirm Dockerfile syntax and layer caching.

### Stage 7: Image Publishing (`publish-images` Job)
Triggers **only on merge/push to `main`**.
1. Authenticates against **GitHub Container Registry (`ghcr.io`)** using the repository's built-in `GITHUB_TOKEN`.
2. Tags images with the short commit SHA and `latest`:
   - `ghcr.io/<owner>/tradex/backend:latest`
   - `ghcr.io/<owner>/tradex/frontend:latest`
3. Pushes images to GHCR without requiring paid third-party registries.

### Stage 8: Automated Cloud Deployment (`deploy` Job)
Runs after Docker images are successfully validated.
1. Checks if SSH deployment secrets (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`) exist in GitHub Secrets.
2. If configured, connects via SSH to the target server, pulls updated code and images, and restarts containers gracefully.

---

## 2. GitHub Secrets Configuration

To configure production cloud deployments:
1. Navigate to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following repository secrets:

| Secret Name | Description | Example |
|---|---|---|
| `DEPLOY_HOST` | Public IP or domain of your Linux VM | `203.0.113.10` |
| `DEPLOY_USER` | SSH username | `ubuntu` |
| `DEPLOY_SSH_KEY` | Private SSH key (PEM / OpenSSH format) | `-----BEGIN OPENSSH PRIVATE KEY...` |
| `DEPLOY_PORT` | SSH Port (Optional) | `22` |

*Note: If these secrets are not configured, the pipeline safely completes the test, build, and Docker stages without failing.*

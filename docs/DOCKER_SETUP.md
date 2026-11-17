# TradeX – Docker Containerization Guide

This guide details the containerization strategy and operational procedures for TradeX.

## 1. Container Architecture

TradeX is orchestrated using Docker Compose across 3 isolated, networked services:

```
+------------------------------------------------------------------------+
|                      docker-compose.yml                                |
|                                                                        |
|  [ frontend service ]   [ backend service ]    [ mongodb service ]     |
|   Image: Nginx Alpine    Image: Node.js Alpine  Image: Mongo 7.0       |
|   Port: 3000 -> 80       Port: 5000 -> 5000     Port: 27017 -> 27017   |
|   Dependencies:          Dependencies:          Volume: mongo-data     |
|    - backend:healthy      - mongodb:healthy     Healthcheck: mongosh   |
|                                                                        |
|  Network: tradex-network (Bridge Driver)                               |
+------------------------------------------------------------------------+
```

---

## 2. Multi-Stage Dockerfile Highlights

### Frontend (`frontend/Dockerfile`)
Uses a 2-stage build:
1. **Builder Stage (`node:20-alpine`)**:
   - Copies `package.json` and runs `npm ci`
   - Builds optimized static bundles with Vite into `/app/dist`
2. **Production Stage (`nginx:alpine`)**:
   - Copies only the compiled HTML/JS/CSS assets
   - Custom `nginx.conf` sets up SPA client-side routing fallback and proxies `/api/` to `backend:5000`
   - Keeps final image size extremely small (~25MB)

### Backend (`backend/Dockerfile`)
1. Uses official `node:20-alpine` base image.
2. Runs `npm ci --only=production` to avoid bundling test runners and dev tools.
3. Sets up a non-privileged `node` user for Linux container security compliance.
4. Implements an automatic `HEALTHCHECK` probing `GET /api/v1/health` every 30 seconds.

---

## 3. Operational Commands

### Start All Services (Production Mode)
```bash
docker compose up -d --build
```

### View Live Logs
```bash
# All services
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Frontend logs only
docker compose logs -f frontend
```

### Inspect Running Containers & Health Status
```bash
docker compose ps
```

Expected output:
```
NAME               IMAGE              COMMAND                  SERVICE    STATUS
tradex-backend     tradex-backend     "docker-entrypoint.s…"   backend    Up (healthy)
tradex-frontend    tradex-frontend    "/docker-entrypoint.…"   frontend   Up (healthy)
tradex-mongodb     mongo:7.0          "docker-entrypoint.s…"   mongodb    Up (healthy)
```

### Seed MongoDB inside the Docker Container
```bash
docker compose exec backend node seed.js
```

### Stop Containers & Networks
```bash
docker compose down
```

### Reset / Wipe Database Volume
```bash
docker compose down -v
```

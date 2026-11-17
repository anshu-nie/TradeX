# TradeX – Troubleshooting & FAQs

This document addresses common setup, execution, and deployment errors.

---

## 1. Local Environment Issues

### Issue: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause**: Local MongoDB daemon is not running on your computer.
- **Solution**:
  - On macOS with Homebrew:
    ```bash
    brew services start mongodb/brew/mongodb-community
    ```
  - Alternatively, use Docker to run MongoDB:
    ```bash
    docker run -d -p 27017:27017 --name local-mongo mongo:7.0
    ```
  - Or use a free cloud MongoDB Atlas URI in `backend/.env`.

### Issue: `Port 5000 or 5173 already in use`
- **Cause**: Another process or background server is bound to the port.
- **Solution**:
  - Identify and terminate the occupying process on macOS:
    ```bash
    lsof -i :5000
    kill -9 <PID>
    ```

---

## 2. Docker & Container Issues

### Issue: `Cannot connect to the Docker daemon`
- **Cause**: Docker Desktop is not started on macOS.
- **Solution**: Open the Docker Desktop application from Applications and wait until the whale icon shows "Engine running".

### Issue: `tradex-backend container exits with exit code 1`
- **Cause**: MongoDB container healthcheck hasn't completed or invalid `MONGO_URI`.
- **Solution**:
  - Check container logs:
    ```bash
    docker compose logs backend
    ```
  - Ensure `MONGO_URI` is set to `mongodb://mongodb:27017/tradex` in `docker-compose.yml`.

### Issue: `Browser shows 401 Unauthorized immediately after refresh`
- **Cause**: JWT token expired or localStorage was cleared.
- **Solution**: Re-login with your credentials or use the "One-Click Demo Account Login".

---

## 3. Testing Issues

### Issue: Jest tests hang or timeout
- **Cause**: Open database connections or background timers.
- **Solution**: The backend test script includes `--runInBand --detectOpenHandles --forceExit` in `backend/package.json` to safely teardown in-memory MongoDB connections.

### Issue: In-memory MongoDB download fails on first run
- **Cause**: Strict firewall blocking downloading the pre-compiled MongoDB binary from Fastly/AWS.
- **Solution**:
  - Ensure internet access is available during the initial `npm test` run.
  - In-memory binaries are cached in `~/.cache/mongodb-binaries` for subsequent fast runs.

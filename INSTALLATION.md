# VOID_RUNNER: System Deployment Guide (v3.0 - Singularity Overdrive & Real-World Expansion)

Follow these protocols to establish your node on the Global Net. This guide is optimized for deployment on a Hostinger VPS or any standard Linux server.

---

## 1. Tactical Requirements
Ensure your host machine has the following binaries initialized:
- **Docker** (Engine v26.0+)
- **Docker Compose** (v2.0+)
- **Git** (for source exfiltration)
- **Node.js** (optional, for TUI Mode)

---

## 2. Grid Connection (Step-by-Step)

### A. Clone the Repository
Connect to your VPS via SSH and pull the project source:
```bash
git clone <your-repository-url> void-runner
cd void-runner
```

### B. Initialize Environmental Shards
Create an empty `.env` file in the root directory. The **Config Wizard** will populate this later, but Docker needs the file to exist for volume mapping:
```bash
touch .env
```

### C. Launch the Neural Stack
Build and start the containers in detached mode:
```bash
docker-compose up -d --build
```
This command initializes three critical sectors:
1.  **`void_runner_frontend`**: Nginx server delivering the optimized production bundle (Port 80).
2.  **`void_runner_backend`**: Node.js/Express uplink with Socket.io and Prisma (Port 3000).
3.  **`void_runner_vector`**: ChromaDB instance for AI memory persistence (Port 8000).

---

## 3. The Neural Handshake (Final Configuration)

The grid enforces absolute identity verification via Google OAuth. To activate your workstation, you must supply these keys.

1.  **Access the Terminal:** Open your browser and navigate to your VPS IP address or domain.
2.  **System Initialization Wizard:**
    - The `app-config-wizard` will lock your interface.
    - Enter your production `JWT_SECRET` and `SESSION_SECRET`.
    - **CRITICAL:** Provide your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (generated from Google Cloud Console with the redirect URI `https://<your-domain>/api/auth/google/callback`).
    - Provide your `FRONTEND_URL` (e.g., `https://void.kluth.cloud`).
3. **Finalize Build:** Click **FINALIZE_SYSTEM_BUILD**. The server will:
    - Save keys to the persistent SQLite database (`dev.db`).
    - Sync keys directly to the host's `.env` file.
    - Reload the neural link.

---

## 4. Advanced Neural Fallbacks (Nexos AI)
If the primary Gemini CLI uplink is unstable, you can utilize **Nexos AI** credits from your Hostinger account.
1.  Navigate to your Hostinger **hPanel**.
2.  Go to **VPS Dashboard** > **Docker Manager** (or OpenClaw settings).
3.  Copy the **Nexos AI API key**.
4.  Add it to your `.env` file:
    ```env
    NEXOS_API_KEY=your_key_here
    NEXOS_MODEL=gpt-4o-mini  # (Optional, defaults to gpt-4o-mini)
    ```
5.  Restart the backend: `docker-compose restart backend`.

---

## 5. Maintenance & Diagnostics

| Operation | Command |
| :--- | :--- |
| **View Uplink Logs** | `docker-compose logs -f backend` |
| **Shut Down Stack** | `docker-compose down` |
| **System Update** | `git pull && docker compose run --rm backend npx prisma db push && docker-compose up -d --build` |
| **Purge Database** | `rm server/prisma/dev.db && docker-compose restart backend` |

---

**CAUTION:** Never expose your `.env` file or `dev.db` to the public grid. If your neural encryption is compromised, perform a total system wipe immediately.

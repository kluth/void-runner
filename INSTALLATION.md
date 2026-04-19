# VOID_RUNNER: System Deployment Guide (v2.0 - 100+ Feature Stack)

Follow these protocols to establish your node on the Global Net. This guide is optimized for deployment on a Hostinger VPS or any standard Linux server.

---

## 1. Tactical Requirements
Ensure your host machine has the following binaries initialized:
- **Docker** (Engine v24.0+)
- **Docker Compose** (v2.0+)
- **Git** (for source exfiltration)

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

Once the stack is online, the system enters **"Honey Pot" Mode**.

1.  **Access the Terminal:** Open your browser and navigate to your VPS IP address or domain.
2.  **Trigger Initialization:** Navigate to the **Black Market** (Hardware Shop) and attempt to purchase any module.
3.  **System Initialization Wizard:**
    - The `app-config-wizard` will lock your interface.
    - Enter your production `JWT_SECRET` and `SESSION_SECRET`.
    - (Optional) Enter your OAuth Provider keys for syndicate authentication.
4.  **Finalize Build:** Click **FINALIZE_SYSTEM_BUILD**. The server will:
    - Save keys to the persistent SQLite database (`dev.db`).
    - Sync keys directly to the host's `.env` file.
    - Reload the neural link.

---

## 4. Maintenance & Diagnostics

| Operation | Command |
| :--- | :--- |
| **View Uplink Logs** | `docker-compose logs -f backend` |
| **Shut Down Stack** | `docker-compose down` |
| **System Update** | `git pull && docker-compose up -d --build` |
| **Purge Database** | `rm server/prisma/dev.db && docker-compose restart backend` |

---

**CAUTION:** Never expose your `.env` file or `dev.db` to the public grid. If your neural encryption is compromised, perform a total system wipe immediately.

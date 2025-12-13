# Uhuru ERP Deployment Guide

This guide describes how to deploy the Uhuru ERP application to your VPS at `/clientes/UhurU/ERPCRM`.

## Prerequisites

- VPS with Docker and Docker Compose installed.
- Domain pointing to your VPS IP (optional, but recommended for production with HTTPS).

## Deployment Steps

## Deployment Steps

1.  **Prepare the Directory (On Your Computer)**
    Since we developed this in a scratch folder, copy the contents of `C:\Users\30080097\.gemini\antigravity\scratch\uhuru-erp` to your preferred location `R:\.shortcut-targets-by-id\17K9Dm3u6gZS6EnEiI8ire7ZrE6EqjCF8\Leroy-Personal\Antigravity\uhuru-erp`.

2.  **Prepare the Directory (On VPS)**
    Connect to your VPS via SSH and create the directory:
    ```bash
    mkdir -p /clientes/UhurU/ERPCRM
    cd /clientes/UhurU/ERPCRM
    ```

3.  **Upload Files**
    Upload the files from your R: drive location to the server directory.
    - `docker-compose.yml`
    - `Dockerfile`
    - `package.json`
    - `package-lock.json`
    - `.env.example` (rename to `.env` on server)
    - `next.config.mjs`
    - `prisma/` (directory)
    - `app/` (directory)
    - `lib/` (directory)
    - `public/` (directory)

4.  **Configure Environment**
    Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    nano .env
    ```
    **Critical:** Update the values in `.env`:
    - `POSTGRES_PASSWORD`: Set a strong password.
    - `NEXTAUTH_SECRET`: Generate a secure string (e.g., `openssl rand -base64 32`).
    - `NEXTAUTH_URL`: Set to your actual domain or IP (e.g., `https://crm.uhuru.trade` or `http://YOUR_VPS_IP:3000`).
    - `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: Add your Google OAuth credentials.

5.  **Start the Application**
    Run the application in detached mode:
    ```bash
    docker-compose up -d --build
    ```

6.  **Database Migration**
    Run the Prisma migrations to set up the database schema:
    ```bash
    docker-compose exec web npx prisma migrate deploy
    ```

7.  **Verify Deployment**
    Visit `http://YOUR_VPS_IP:3000` (or your configured domain) to see the application running.

## Maintenance

- **View Logs:** `docker-compose logs -f`
- **Stop App:** `docker-compose down`
- **Update App:**
    1.  Pull new code/upload files.
    2.  `docker-compose up -d --build`

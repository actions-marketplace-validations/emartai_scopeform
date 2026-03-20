# Self-Hosting

Run the full Scopeform stack on your own infrastructure.

## Prerequisites

- Docker and Docker Compose
- A machine with at least 1 GB RAM
- Ports 80/443 available (or adjust the compose file)

## Quick start

```bash
git clone https://github.com/emartai/scopeform.git
cd scopeform

# Copy and fill in environment variables
cp .env.example .env

# Start everything
docker compose up
```

This starts:
- **API** — FastAPI on port `8000`
- **Web** — Next.js on port `3000`
- **PostgreSQL** — on port `5432`
- **Redis** — on port `6379`

## Environment variables

Edit `.env` before starting. Required values:

### API

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://scopeform:password@db:5432/scopeform` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `JWT_SECRET` | 64-char hex string for signing JWTs | `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Fernet key for encrypting provider API keys | See below |
| `FRONTEND_URL` | URL of the web app (for CORS) | `http://localhost:3000` |

**Generating `JWT_SECRET`:**
```bash
openssl rand -hex 32
```

**Generating `ENCRYPTION_KEY`:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Web

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the API (used by the browser) |
| `RAILWAY_URL` (or `API_URL`) | Server-side URL of the API (used by proxy routes) |

## Database migrations

Migrations run automatically on API startup via `alembic upgrade head`. To run them manually:

```bash
docker compose run api alembic upgrade head
```

## Running in production

For a production deployment:

1. Put a reverse proxy (nginx or Caddy) in front of both services
2. Configure TLS
3. Set `FRONTEND_URL` in the API env to your actual domain
4. Set strong values for `JWT_SECRET` and `ENCRYPTION_KEY`
5. Use a managed PostgreSQL and Redis service for reliability

## Updating

```bash
git pull
docker compose build
docker compose up -d
```

Migrations run automatically on restart.

## Architecture

```
                    ┌─────────────────┐
Browser             │  Next.js (web)  │  :3000
    │               │  /api/proxy/*   │
    └──────────────►│  /api/auth/*    │
                    └────────┬────────┘
                             │ server-side
                             ▼
                    ┌─────────────────┐
                    │  FastAPI (api)  │  :8000
                    │  /api/v1/*      │
                    └────────┬────────┘
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼─────┐   ┌──────▼──────┐
              │ PostgreSQL │   │    Redis     │
              └───────────┘   └─────────────┘
```

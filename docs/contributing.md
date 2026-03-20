# Contributing

## Repository structure

```
scopeform/
├── api/              FastAPI backend (Python)
│   ├── core/         Config, database, deps, JWT, Redis
│   ├── models/       SQLAlchemy ORM models
│   ├── routers/      API route handlers
│   ├── schemas/      Pydantic request/response schemas
│   ├── migrations/   Alembic migration files
│   └── tests/        pytest test suite
│
├── web/              Next.js dashboard (TypeScript)
│   ├── app/          App Router pages and API routes
│   ├── components/   React components
│   └── lib/          API client, proxy helper, utilities
│
├── cli-py/           Python CLI (typer)
│   ├── scopeform/    CLI source
│   └── tests/        pytest test suite
│
├── cli-node/         Node.js CLI (commander)
│   ├── src/          CLI source
│   └── tests/        jest test suite
│
└── docs/             This documentation
```

## Development setup

### API (Python / FastAPI)

```bash
cd api
pip install -r requirements.txt
# Set up a local .env with DATABASE_URL, REDIS_URL, JWT_SECRET, ENCRYPTION_KEY
uvicorn api.main:app --reload
```

Run tests:
```bash
pytest
```

Run migrations:
```bash
alembic upgrade head
```

### Web (Next.js)

```bash
cd web
npm install
npm run dev
```

### Python CLI

```bash
cd cli-py
pip install -e ".[dev]"
pytest
```

### Node CLI

```bash
cd cli-node
npm install
npm test
npm run build
```

## Running everything locally

```bash
docker compose up
```

This starts PostgreSQL, Redis, the API, and the web app together.

## Adding a migration

After changing a SQLAlchemy model:

```bash
cd api
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

Name the revision file with the date prefix: `YYYYMMDD_NNNNNN_description.py`. Update the `revision` and `down_revision` IDs to match the `YYYYMMDD_NNNNNN` naming convention used in existing migrations.

## Adding a new provider to the proxy

1. Add the service name to `PROVIDER_BASE_URLS` in `api/routers/proxy.py`
2. Add action resolution logic to `_resolve_action()`
3. Add auth header logic to `_provider_headers()` if needed
4. Add the service to `SUPPORTED_SERVICES` in `api/routers/integrations.py`
5. Add the service card to `web/components/dashboard/IntegrationsPageClient.tsx`
6. Update `api/schemas/integration.py` if the service type union needs expanding
7. Document the new scopes in `docs/proxy.md` and `docs/introduction.md`

## Pull requests

- Open an issue first for large changes
- Keep PRs focused — one feature or fix per PR
- All tests must pass before merging
- Update the relevant docs file if the change affects user-facing behaviour

## Code style

- Python: no formatter enforced, follow PEP 8
- TypeScript: Prettier (configured in `web/`)
- Commit messages: plain English, imperative mood (`add`, `fix`, `update` — not `added`, `fixed`)

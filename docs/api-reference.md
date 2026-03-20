# API Reference

## Base URL

```
https://scopeform-production-f0b7.up.railway.app/api/v1
```

## Interactive docs

Swagger UI is available at:
```
https://scopeform-production-f0b7.up.railway.app/api/v1/docs
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

User tokens are obtained via `/auth/login`. Agent tokens are issued via `/tokens/issue` or `scopeform deploy`.

---

## Auth

### `POST /auth/register`

Create a new account and organisation.

**Request:**
```json
{
  "email": "you@example.com",
  "password": "your-password",
  "org_name": "Acme Inc"
}
```

**Response `201`:**
```json
{
  "token": "eyJ...",
  "email": "you@example.com"
}
```

### `POST /auth/login`

Sign in and receive a user JWT.

**Request:**
```json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

**Response `200`:**
```json
{
  "token": "eyJ...",
  "email": "you@example.com"
}
```

---

## Agents

### `GET /agents`

List all agents in your organisation.

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "support-agent",
      "owner_email": "you@example.com",
      "environment": "production",
      "status": "active",
      "scopes": [{ "service": "openai", "actions": ["chat.completions"] }],
      "created_at": "2026-03-20T12:00:00Z",
      "last_seen_at": "2026-03-20T14:30:00Z"
    }
  ],
  "total": 1
}
```

### `POST /agents`

Register a new agent.

**Request:**
```json
{
  "name": "support-agent",
  "owner_email": "you@example.com",
  "environment": "production",
  "scopes": [
    { "service": "openai", "actions": ["chat.completions"] }
  ]
}
```

**Response `201`:** Agent object. Returns `409` if an agent with that name already exists.

Free tier: maximum 5 agents per organisation.

### `GET /agents/{id}`

Get a single agent by ID.

### `PATCH /agents/{id}/status`

Update agent status.

**Request:**
```json
{ "status": "suspended" }
```

Status values: `active`, `suspended`, `decommissioned`.

---

## Tokens

### `POST /tokens/issue`

Issue a scoped runtime token for an agent.

**Request:**
```json
{
  "agent_id": "uuid",
  "ttl": "24h"
}
```

TTL format: `<number><s|m|h|d>` — e.g. `30m`, `24h`, `7d`.

**Response `201`:**
```json
{
  "token": "eyJ...",
  "jti": "uuid",
  "expires_at": "2026-03-21T12:00:00Z"
}
```

### `POST /tokens/revoke`

Revoke all active tokens for an agent.

**Request:**
```json
{ "agent_id": "uuid" }
```

**Response `200`:**
```json
{ "revoked": true, "count": 2 }
```

### `POST /tokens/validate`

Validate a runtime token for a specific service and action.

**Request:**
```json
{
  "token": "eyJ...",
  "service": "openai",
  "action": "chat.completions"
}
```

**Response `200`:**
```json
{ "allowed": true }
```

Returns `{ "allowed": false }` for expired, revoked, or out-of-scope tokens. Call is always logged.

---

## Integrations

### `GET /integrations`

List integration status for all supported services. Does not return the actual key values.

**Response `200`:**
```json
{
  "items": [
    { "service": "openai", "configured": true, "updated_at": "2026-03-20T10:00:00Z" },
    { "service": "anthropic", "configured": false, "updated_at": null },
    { "service": "github", "configured": false, "updated_at": null }
  ]
}
```

### `PUT /integrations/{service}`

Add or update the provider API key for a service. `service` must be `openai`, `anthropic`, or `github`.

**Request:**
```json
{ "api_key": "sk-..." }
```

**Response `200`:** Integration status object.

### `DELETE /integrations/{service}`

Remove the stored API key for a service. Status `204` on success.

---

## Proxy

### `{METHOD} /proxy/{service}/{path}`

Forward a request to a provider using the organisation's stored API key.

- `{service}`: `openai`, `anthropic`, or `github`
- `{path}`: the provider-native path (e.g. `v1/chat/completions`)
- Method: any of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

**Authentication:** Pass the agent's `SCOPEFORM_TOKEN` as Bearer token.

Scopeform validates the token, checks scopes, logs the call, then forwards the request. The response is streamed back.

**Error responses:**

| Status | Meaning |
|---|---|
| `401` | Missing or invalid token |
| `403` | Scope not permitted |
| `422` | No provider key configured for this service |

See [Proxy guide](./proxy.md) for full examples.

---

## Logs

### `GET /logs`

List call logs across all agents in your organisation.

Query parameters:

| Parameter | Description |
|---|---|
| `limit` | Maximum rows (default: 20) |
| `offset` | Pagination offset |
| `service` | Filter by service |
| `allowed` | `true` or `false` |

### `GET /agents/{id}/logs`

Same as `/logs` but scoped to a single agent.

---

## Health

### `GET /health`

```json
{ "status": "ok", "db": true, "redis": true }
```

Returns `200` if all systems are healthy.

---

## Rate limits

| Endpoint group | Limit |
|---|---|
| Token issuance | 30 requests/minute per organisation |
| Token validation | 300 requests/minute per organisation |

Exceeding a limit returns `429 Too Many Requests`.

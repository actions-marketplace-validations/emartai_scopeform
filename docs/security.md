# Security

## Token model

Scopeform issues short-lived, scoped JWTs for agents. Each token:

- is signed with HS256 using a secret key held only by the Scopeform API
- carries the agent ID, org ID, and scope list in the payload
- expires after the TTL declared in `scopeform.yml`
- can be revoked before expiry — revocation is checked in Redis on every proxy call

Agents use `SCOPEFORM_TOKEN` instead of raw provider keys. Even if an agent token is stolen, the attacker can only call the specific services and actions the agent was declared to need.

## Provider key storage

When you add an OpenAI, Anthropic, or GitHub key in the Integrations dashboard:

- The key is encrypted client-to-server over TLS
- It is encrypted at rest using AES-256 (Fernet symmetric encryption)
- The encryption key is stored as an environment variable in the Railway deployment — separate from the database
- The plaintext key is only decrypted in memory at request time by the proxy
- The plaintext key is never returned by any API endpoint, never logged, and never written to disk

## What Scopeform can see

Scopeform logs:

- Agent identity and token metadata (issuance, revocation events)
- Service name (`openai`, `anthropic`, `github`)
- Action name (`chat.completions`, `messages`, etc.)
- Whether the call was allowed or blocked
- Timestamp

Scopeform does **not** log:

- The content of model prompts or responses
- Repository file contents
- Issue or PR body text
- Any request or response payload data

## Org isolation

All agents, tokens, integrations, and logs are scoped to an organisation. A user in one organisation cannot access data from another.

## Revocation

Tokens can be revoked instantly from the dashboard or CLI:

```bash
scopeform revoke <agent-name>
```

Revoked JTIs are stored in Redis with a TTL matching the original token expiry. Redis is checked on every proxy call — a revoked token is blocked even if it has not expired yet.

## Operational protections

- Short-lived tokens (default 24h, minimum configurable per agent)
- Org-scoped access boundaries on all API routes
- Rate limiting on token issuance (30 req/min) and validation (300 req/min) per organisation
- Security headers on all responses (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`)
- HTTPS enforced in production (Railway, Vercel)

## Free tier limits

The free tier allows up to 5 agents per organisation. This limit is enforced at agent registration time.

## Reporting a security issue

If you discover a security vulnerability, please open a private issue on GitHub or email the maintainer directly. Do not post vulnerability details in public issues.

Include:
- A clear description of the issue
- Steps to reproduce
- Affected components
- Any mitigation you have already identified

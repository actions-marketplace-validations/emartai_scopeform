# Introduction

## What is Scopeform?

Scopeform is identity and access management for AI agents — like Okta, but for the agents running in your infrastructure.

Today, most AI agents run with long-lived provider API keys hardcoded in `.env` files. When one agent is compromised, the only way to stop it is to rotate the key for every service that uses it. There is no audit trail, no revocation, and no way to tell which agent made which API call.

Scopeform fixes this by giving every agent its own **scoped, short-lived token** tied to exactly the services and actions it needs. If an agent is compromised, you revoke its token in one click — without touching anything else.

## Key concepts

### Agent

An agent is a registered AI workload in your Scopeform organisation. Each agent has:

- a unique name
- a declared set of scopes (which services and actions it is allowed to call)
- a token TTL (how long issued tokens are valid)
- an environment (`production`, `staging`, or `development`)

Agents are registered by running `scopeform deploy` in a project that contains a `scopeform.yml` file.

### Token

When you deploy an agent, Scopeform issues a short-lived JWT scoped to that agent's declared permissions. This token is written to `.env` as `SCOPEFORM_TOKEN`.

Your agent uses `SCOPEFORM_TOKEN` instead of a raw provider API key. The token:

- expires automatically (default: 24 hours)
- can be revoked instantly from the dashboard or CLI
- carries the agent's scope list inside the JWT payload
- is validated by the Scopeform proxy on every API call

### Scope

A scope is a `service:action` pair that an agent is allowed to call. Examples:

| Service | Action | Meaning |
|---|---|---|
| `openai` | `chat.completions` | Call OpenAI chat completions |
| `openai` | `embeddings` | Call OpenAI embeddings |
| `anthropic` | `messages` | Call Anthropic messages |
| `github` | `repos.read` | Read GitHub repository data |
| `github` | `issues.write` | Create or update GitHub issues |

An agent can only call services and actions listed in its `scopeform.yml`. Any other call is blocked and logged.

### Proxy

The Scopeform proxy sits between your agent and the provider. When your agent makes an API call:

1. The proxy validates the `SCOPEFORM_TOKEN`
2. Checks the scope is permitted
3. Logs the call (allowed or blocked)
4. If allowed: forwards the request to the provider using your organisation's stored API key
5. Returns the provider response

Your agents never hold the real provider API keys — only Scopeform does.

### Organisation

An organisation is a tenant in Scopeform. All agents, integrations (provider API keys), and logs belong to an organisation. Every user account belongs to exactly one organisation.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Your agent (Python / Node.js)                      │
│                                                     │
│  openai.api_key  = SCOPEFORM_TOKEN                  │
│  openai.base_url = https://<scopeform>/proxy/openai │
└──────────────────────────┬──────────────────────────┘
                           │ Bearer SCOPEFORM_TOKEN
                           ▼
             ┌─────────────────────────┐
             │  Scopeform API          │  ← FastAPI on Railway
             │  1. Validate token      │
             │  2. Check scope         │
             │  3. Log call            │
             │  4. Forward with        │
             │     real provider key   │
             └────────────┬────────────┘
                          │ Bearer <real-provider-key>
                          ▼
             ┌─────────────────────────┐
             │  Provider               │
             │  (OpenAI / Anthropic /  │
             │   GitHub)               │
             └─────────────────────────┘
```

## What Scopeform is not

- **Not a model router** — Scopeform does not choose which model to call
- **Not an observability platform** — logs show what was called, not the content of prompts or responses
- **Not a secrets manager** — provider keys are stored per-organisation, not per-agent

## Next steps

- [Quickstart](./quickstart.md) — register your first agent in under 5 minutes
- [Proxy guide](./proxy.md) — point your SDK at the Scopeform proxy
- [CLI reference](./cli-reference.md) — all commands and flags
- [scopeform.yml reference](./scopeform-yml.md) — full config schema

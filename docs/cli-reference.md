# CLI Reference

## Installation

**Python:**
```bash
pip install scopeform
```

**Node.js:**
```bash
npm install -g scopeform
```

## Global flags

| Flag | Default | Description |
|---|---|---|
| `--api-url TEXT` | `SCOPEFORM_API_URL` env var, or the Scopeform production API | Override the API base URL |
| `--version` | — | Print the installed version and exit |

## CI/CD — `SCOPEFORM_TOKEN` env var

In CI environments, set `SCOPEFORM_TOKEN` before running any CLI command. The CLI reads this env var first and skips the config file — no `scopeform login` step needed.

```yaml
- name: Deploy agent
  run: scopeform deploy
  env:
    SCOPEFORM_TOKEN: ${{ secrets.SCOPEFORM_TOKEN }}
```

---

## `scopeform login`

Sign in with your email and password.

```bash
scopeform login
```

Prompt:
```
Email: you@example.com
Password: ••••••••
✓ Logged in as you@example.com
```

Your session is saved to `~/.scopeform/config.json`. The token is valid for 24 hours.

---

## `scopeform init`

Create `scopeform.yml` interactively in the current directory.

```bash
scopeform init
```

Prompts: agent name, owner email, environment, services and actions, token TTL, CI integration.

Output:
```
✓ scopeform.yml created successfully.
Run `scopeform deploy` to register your agent and issue a scoped token.
```

See [scopeform.yml reference](./scopeform-yml.md) for the full schema.

---

## `scopeform deploy`

Register the current agent and issue a scoped token.

```bash
scopeform deploy
```

Requires `scopeform.yml` in the current directory and an active session (or `SCOPEFORM_TOKEN` env var).

Behaviour:
1. Reads `scopeform.yml`
2. Registers the agent (or finds it if already registered)
3. Issues a short-lived JWT scoped to the agent's declared permissions
4. Writes `SCOPEFORM_TOKEN=<token>` to `.env`
5. Adds `.env` to `.gitignore` if not already present

Output:
```
✓ Deploy successful.

┌─────────────────┬──────────────────────────────┐
│ Agent           │ support-agent                │
│ Environment     │ production                   │
│ Token expires   │ 2026-03-22 12:00 UTC         │
│ Token written   │ .env                         │
└─────────────────┴──────────────────────────────┘
```

---

## `scopeform revoke <agent-name>`

Revoke all active tokens for the named agent.

```bash
scopeform revoke support-agent
```

You will be asked to confirm. Once revoked, the agent cannot proxy calls until `scopeform deploy` issues a new token.

---

## `scopeform logs <agent-name>`

Show recent call history for the named agent.

```bash
scopeform logs support-agent
```

Flags:

| Flag | Default | Description |
|---|---|---|
| `--limit INTEGER` | `20` | Maximum number of rows to return |
| `--service TEXT` | — | Filter by service name |
| `--blocked-only` | `false` | Show only blocked calls |

Examples:
```bash
scopeform logs support-agent --limit 50
scopeform logs support-agent --service openai
scopeform logs support-agent --blocked-only
```

---

## Config file

`~/.scopeform/config.json` stores the session after login. It is created with permissions `0600` and cleared automatically when the token expires.

To log out manually:
```bash
rm ~/.scopefile/config.json
```

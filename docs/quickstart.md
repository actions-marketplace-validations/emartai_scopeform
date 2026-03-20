# Quickstart

Register your first agent and proxy your first API call in under 5 minutes.

## Prerequisites

- Python `3.8+` or Node `18+`
- A Scopeform account — sign up at [scopeform-web.vercel.app/sign-up](https://scopeform-web.vercel.app/sign-up)

## Step 1 — Install the CLI

**Python:**
```bash
pip install scopeform
```

**Node.js:**
```bash
npm install -g scopeform
```

Verify:
```bash
scopeform --version
```

## Step 2 — Log in

```bash
scopeform login
```

You will be prompted for your email and password. Your session is saved to `~/.scopeform/config.json`.

## Step 3 — Add a provider API key

Before deploying an agent, add the API key for the service you want to proxy.

1. Open [scopeform-web.vercel.app/dashboard/integrations](https://scopeform-web.vercel.app/dashboard/integrations)
2. Find the service (e.g. OpenAI)
3. Paste your API key and click **Save**

Scopeform encrypts the key at rest. Your agents never see it.

## Step 4 — Initialise your project

```bash
cd your-agent/
scopeform init
```

Answer the prompts. This creates `scopeform.yml`:

```yaml
identity:
  name: support-agent
  owner: you@example.com
  environment: production

ttl: 24h

scopes:
  - service: openai
    actions:
      - chat.completions

integrations:
  ci: none
```

## Step 5 — Deploy

```bash
scopeform deploy
```

Output:
```
✓ Registering agent...
✓ Issuing scoped token...
✓ Deploy successful.

┌─────────────────┬──────────────────────────────┐
│ Agent           │ support-agent                │
│ Environment     │ production                   │
│ Token expires   │ 2026-03-22 12:00 UTC         │
│ Token written   │ .env                         │
└─────────────────┴──────────────────────────────┘
```

## Step 6 — Use the proxy

Point your SDK at the Scopeform proxy instead of the provider directly.

**Python (OpenAI):**
```python
import os, openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key  = os.environ["SCOPEFORM_TOKEN"]
openai.base_url = "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/openai/v1"

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

**Node.js (OpenAI):**
```js
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.SCOPEFORM_TOKEN,
  baseURL: "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/openai/v1",
});

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(res.choices[0].message.content);
```

## Step 7 — View the call in the dashboard

Open [dashboard/logs](https://scopeform-web.vercel.app/dashboard/logs) to see every call logged with agent name, service, action, allowed/blocked status, and timestamp.

## Next steps

- [Proxy guide](./proxy.md) — Anthropic and GitHub examples
- [GitHub Actions](./github-actions.md) — CI/CD token automation
- [CLI reference](./cli-reference.md) — all commands and flags

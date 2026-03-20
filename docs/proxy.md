# Proxy Guide

The Scopeform proxy sits between your agent and the AI provider. It validates the `SCOPEFORM_TOKEN`, enforces declared scopes, logs every call, and forwards the request using your organisation's stored provider key.

## How it works

```
Your agent (SCOPEFORM_TOKEN)
         │
         ▼
Scopeform proxy  ──validates──►  allowed?  ──no──►  403 + log(blocked)
         │
         yes
         │
         ▼
  log(allowed)
         │
         ▼
  Provider API (real key injected by Scopeform)
         │
         ▼
  Response streamed back to your agent
```

Your agent never holds the real provider key — Scopeform injects it server-side.

## Proxy base URL

```
https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/{service}/
```

Replace `{service}` with `openai`, `anthropic`, or `github`.

---

## OpenAI

### Supported actions

| Scope action | Provider path |
|---|---|
| `chat.completions` | `POST /v1/chat/completions` |
| `embeddings` | `POST /v1/embeddings` |
| `images.generations` | `POST /v1/images/generations` |

### `scopeform.yml`

```yaml
scopes:
  - service: openai
    actions:
      - chat.completions
      - embeddings
```

### Python

```python
import os, openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key  = os.environ["SCOPEFORM_TOKEN"]
openai.base_url = "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/openai/v1"

# Chat
response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Summarise this ticket."}]
)
print(response.choices[0].message.content)

# Embeddings
embedding = openai.embeddings.create(
    model="text-embedding-3-small",
    input="Hello world"
)
print(embedding.data[0].embedding[:5])
```

### Node.js

```js
import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.SCOPEFORM_TOKEN,
  baseURL: "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/openai/v1",
});

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Summarise this ticket." }],
});
console.log(response.choices[0].message.content);
```

### Streaming

Streaming works transparently — set `stream: true` as usual:

```python
stream = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Tell me a story."}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
```

---

## Anthropic

### Supported actions

| Scope action | Provider path |
|---|---|
| `messages` | `POST /v1/messages` |

### `scopeform.yml`

```yaml
scopes:
  - service: anthropic
    actions:
      - messages
```

### Python

```python
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.environ["SCOPEFORM_TOKEN"],
    base_url="https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/anthropic",
)

message = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=256,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Node.js

```js
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic({
  apiKey: process.env.SCOPEFORM_TOKEN,
  baseURL: "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/anthropic",
});

const message = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 256,
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(message.content[0].text);
```

---

## GitHub

### Supported actions

| Scope action | Meaning |
|---|---|
| `repos.read` | GET requests to `/repos/**` |
| `repos.write` | POST/PATCH/PUT/DELETE to `/repos/**` |
| `issues.read` | GET requests to paths containing `issues` |
| `issues.write` | POST/PATCH/PUT/DELETE to paths containing `issues` |
| `pulls.read` | GET requests to paths containing `pulls` |

### `scopeform.yml`

```yaml
scopes:
  - service: github
    actions:
      - repos.read
      - issues.write
```

### Python (using httpx directly)

```python
import os, httpx
from dotenv import load_dotenv

load_dotenv()

PROXY = "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/github"

headers = {"Authorization": f"Bearer {os.environ['SCOPEFORM_TOKEN']}"}

# List repos (repos.read)
r = httpx.get(f"{PROXY}/user/repos", headers=headers)
repos = r.json()
print([repo["full_name"] for repo in repos[:5]])

# Create an issue (issues.write)
r = httpx.post(
    f"{PROXY}/repos/myorg/myrepo/issues",
    headers=headers,
    json={"title": "Bug found by agent", "body": "Details here."},
)
print(r.json()["html_url"])
```

---

## Error responses

| Status | Meaning |
|---|---|
| `401 Unauthorized` | Missing or invalid `SCOPEFORM_TOKEN` |
| `403 Forbidden` | Token valid but scope not permitted |
| `422 Unprocessable Entity` | No provider API key configured for this service — add it in [Integrations](https://scopeform-web.vercel.app/dashboard/integrations) |
| `429 Too Many Requests` | Rate limit exceeded |

---

## Adding provider keys

Provider API keys are stored per organisation in the Scopeform dashboard.

1. Open [dashboard/integrations](https://scopeform-web.vercel.app/dashboard/integrations)
2. Paste your key for each service you want to use
3. Click **Save**

Keys are encrypted at rest with AES-256 (Fernet). They are never returned by the API or logged.

See [Integrations guide](./integrations.md) for more detail.

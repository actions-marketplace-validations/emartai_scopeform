# Integrations

Integrations are the provider API keys your organisation stores in Scopeform. The proxy uses them to forward requests on behalf of your agents — your agents never hold the real keys.

## Supported providers

| Service | Used for |
|---|---|
| **OpenAI** | `chat.completions`, `embeddings`, `images.generations` |
| **Anthropic** | `messages` |
| **GitHub** | `repos.read`, `repos.write`, `issues.read`, `issues.write`, `pulls.read` |

## Adding a key

1. Open [scopeform-web.vercel.app/dashboard/integrations](https://scopeform-web.vercel.app/dashboard/integrations)
2. Find the service card
3. Paste your API key into the input field
4. Click **Save**

The card will show a green **Configured** badge once saved.

## Updating a key

Paste a new key into the input field on an already-configured service and click **Update**. The old key is immediately replaced.

## Removing a key

Click the trash icon on the service card. Any agent trying to proxy through that service will receive a `422` error until a new key is added.

## Key storage

Keys are encrypted at rest using AES-256 (Fernet symmetric encryption). The encrypted value is stored in the database. The plaintext key:

- is only decrypted in memory at request time
- is never returned by any API endpoint
- is never written to logs

## Where to find your provider keys

### OpenAI

1. Open [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the value — it starts with `sk-`

### Anthropic

1. Open [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **Create Key**
3. Copy the value — it starts with `sk-ant-`

### GitHub

1. Open [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)** or create a fine-grained token
3. Select the scopes your agents need (e.g. `repo`, `issues`)
4. Copy the value — it starts with `ghp_` or `github_pat_`

## One key per organisation

Keys are stored at the organisation level, not per-agent. Every agent in your organisation that proxies through OpenAI, for example, uses the same stored OpenAI key. Access control is enforced at the scope level — agents can only call the actions declared in their `scopeform.yml`.

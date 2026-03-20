# GitHub Actions

Automate token issuance in CI/CD so your workflow never stores a long-lived provider key.

## How it works

1. You store your Scopeform user token as a GitHub Actions secret (`SCOPEFORM_TOKEN`)
2. `scopeform deploy` runs in CI, reads `SCOPEFORM_TOKEN` from the environment (no login needed)
3. A new short-lived agent token is issued and written to `.env`
4. Your agent runs using the freshly issued token

## Setup

### 1. Get your Scopeform token

After `scopeform login`, your token is stored in `~/.scopeform/config.json`:

```bash
cat ~/.scopeform/config.json
```

Copy the `token` value.

### 2. Add it as a GitHub secret

1. Open your GitHub repository
2. Go to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `SCOPEFORM_TOKEN`
5. Value: the token you copied

### 3. Add a `scopeform.yml` to your repo

```yaml
identity:
  name: my-ci-agent
  owner: you@example.com
  environment: production

ttl: 1h

scopes:
  - service: openai
    actions:
      - chat.completions

integrations:
  ci: github-actions
```

### 4. Use the example workflow

Copy [`.github/workflows/scopeform-example.yml`](../.github/workflows/scopeform-example.yml) into your own repository:

```yaml
name: Deploy agent with Scopeform

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install Scopeform CLI
        run: pip install scopeform

      - name: Deploy agent and issue scoped token
        run: scopeform deploy
        env:
          SCOPEFORM_TOKEN: ${{ secrets.SCOPEFORM_TOKEN }}

      - name: Load issued token into environment
        run: echo "AGENT_TOKEN=$(grep '^SCOPEFORM_TOKEN=' .env | cut -d= -f2-)" >> "$GITHUB_ENV"

      - name: Run agent
        run: python agent.py
        env:
          SCOPEFORM_TOKEN: ${{ env.AGENT_TOKEN }}
```

## Token lifecycle in CI

| Step | Token used |
|---|---|
| `scopeform deploy` | Your long-lived user token (from `SCOPEFORM_TOKEN` secret) |
| `agent.py` runs | The freshly issued short-lived agent token (from `.env`) |

The two tokens are different. The user token authenticates the deploy. The agent token is what your code uses to proxy API calls — it expires after the TTL in `scopeform.yml`.

## Security notes

- The `SCOPEFORM_TOKEN` secret is your user token — treat it like a password
- Agent tokens are short-lived (`ttl: 1h` in `scopeform.yml` above) and scoped to declared services only
- `.env` files are never committed — the deploy step writes the token to the runner filesystem only
- If the secret is compromised, rotate it: `scopeform login` → copy new token from `~/.scopeform/config.json` → update the GitHub secret

## Node.js agents

Replace the setup steps:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "20"

- name: Install Scopeform CLI
  run: npm install -g scopeform
```

Everything else in the workflow is the same.

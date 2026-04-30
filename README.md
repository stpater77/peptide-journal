# Peptide Journal

Peptide Journal is a two-app workspace for Sean and Vanessa's weekly peptide
schedule. The scaffold now separates the user interface, domain constants,
validation, persistence, and automation integration so the next pass can focus
on protocol-specific customization.

- `apps/api`: Fastify API with Postgres persistence and optional n8n webhook sync
- `apps/web`: Next.js dashboard with weekly schedule entry capture

## Current Structure

```text
apps/
  api/
    src/config/env.ts
    src/db/pool.ts
    src/domain/schedule.ts
    src/integrations/n8n.ts
    src/repositories/weeklyPeptideSchedule.ts
    src/routes/entries.ts
    src/server.ts
  web/
    src/app/
    src/components/
    src/lib/peptide-journal.ts
```

## API

```bash
cd apps/api
npm install
npm run dev
```

Environment variables:

```bash
DATABASE_URL=replace_me
N8N_WEBHOOK_URL=replace_me
N8N_WEBHOOK_SECRET=replace_me
PORT=3001
```

Apply the database schema in `apps/api/sql/schema.sql` before posting entries.
Postgres is the source of truth for schedule entries.

Endpoints:

- `GET /health`
- `POST /entries`
- `POST /entries/form`

## Web

```bash
cd apps/web
npm install
npm run dev
```

Environment variable:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001/entries/form
```

## Deploy

The included `nixpacks.toml` starts the API from `apps/api`. Deploy the web
app separately or configure a second Railway service using `apps/web`.


## Railway Services

Recommended services for this isolated monorepo:

- `API-peptidejournal-ai`
  - GitHub repo: `stpater77/peptide-journal`
  - Nixpacks config: `nixpacks.api.toml`
  - Variables:
    - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
    - `N8N_WEBHOOK_URL=replace_me`
    - `N8N_WEBHOOK_SECRET=replace_me`
- `openweb-ui`
  - GitHub repo: `stpater77/peptide-journal`
  - Nixpacks config: `nixpacks.web.toml`
  - Variables:
    - `NEXT_PUBLIC_API_URL=https://<api-domain>/entries/form`

Generate a public domain for `API-peptidejournal-ai` first, then set the
web service `NEXT_PUBLIC_API_URL` to that API domain plus `/entries/form`.

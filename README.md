# Peptide Journal

Peptide Journal is a small two-app project modeled after `stpater77/bobsplumbing-ai`.

- `apps/api`: Fastify API with Postgres persistence and optional n8n webhook sync
- `apps/web`: Next.js journal entry form

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
PORT=3000
```

Apply the database schema in `apps/api/sql/schema.sql` before posting entries.

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
NEXT_PUBLIC_API_URL=https://peptide-journal-production.up.railway.app/entries/form
```

## Deploy

The included `nixpacks.toml` matches the reference repo and starts the API from
`apps/api`. Deploy the web app separately or configure a second Railway service
using `apps/web`.

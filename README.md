# Peptide Journal

Peptide Journal is a small two-app project modeled after `stpater77/bobsplumbing-ai`.
The first workflow is Sean and Vanessa's weekly peptide schedule.

- `apps/api`: Fastify API with Postgres persistence and optional n8n webhook sync
- `apps/web`: Next.js weekly schedule form

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

The included `nixpacks.toml` matches the reference repo and starts the API from
`apps/api`. Deploy the web app separately or configure a second Railway service
using `apps/web`.

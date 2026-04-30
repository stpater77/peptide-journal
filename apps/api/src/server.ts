import Fastify from "fastify";
import cors from "@fastify/cors";
import { env, hasN8nWebhook } from "./config/env";
import { pool } from "./db/pool";
import { registerEntryRoutes } from "./routes/entries";

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  app.log.info(
    {
      hasDatabaseUrl: !!env.databaseUrl,
      hasN8nWebhook,
    },
    "Startup configuration"
  );

  app.get("/health", async (_request, reply) => {
    if (!env.databaseUrl) {
      return reply.status(503).send({
        ok: false,
        db: false,
        message:
          "DATABASE_URL is not configured. Add apps/api/.env before saving entries.",
      });
    }

    const db = await pool.query("SELECT now() AS now");
    return {
      ok: true,
      db: true,
      time: db.rows[0].now,
    };
  });

  app.setErrorHandler((err, _request, reply) => {
    app.log.error(err);
    const message =
      err instanceof Error ? err.message : "Unexpected API error.";
    return reply.status(500).send({
      ok: false,
      message,
    });
  });

  await registerEntryRoutes(app);

  await app.listen({
    port: env.port,
    host: "0.0.0.0",
  });

  app.log.info("peptide-journal API running");
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

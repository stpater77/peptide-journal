import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { peptideLogSchema } from "../domain/peptideLog";
import { createPeptideLogEntry } from "../repositories/peptideLogEntries";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function registerPeptideLogRoutes(app: FastifyInstance) {
  app.post("/peptide-logs/form", async (request, reply) => {
    app.log.info("POST /peptide-logs/form received");

    if (!env.databaseUrl) {
      return reply.status(503).send({
        ok: false,
        message:
          "DATABASE_URL is not configured. Add apps/api/.env before saving entries.",
      });
    }

    const parsed = peptideLogSchema.safeParse(
      isRecord(request.body) ? request.body : {}
    );

    if (!parsed.success) {
      app.log.warn(
        { error: parsed.error.flatten() },
        "Validation failed for /peptide-logs/form"
      );
      return reply.status(400).send({
        ok: false,
        statusCode: 400,
        error: parsed.error.flatten(),
      });
    }

    const entry = await createPeptideLogEntry(parsed.data);

    app.log.info(
      {
        id: entry.id,
        log_id: entry.log_id,
        peptide_name: entry.peptide_name,
      },
      "Peptide log entry created"
    );

    return {
      ok: true,
      statusCode: 200,
      entry,
    };
  });
}

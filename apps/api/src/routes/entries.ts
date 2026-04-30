import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import {
  scheduleEntrySchema,
  type ScheduleEntryInput,
} from "../domain/schedule";
import { sendEntryToN8n } from "../integrations/n8n";
import { createScheduleEntry } from "../repositories/weeklyPeptideSchedule";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function handleScheduleEntry(
  app: FastifyInstance,
  payload: unknown,
  overrides: Partial<ScheduleEntryInput>
) {
  if (!env.databaseUrl) {
    return {
      ok: false as const,
      statusCode: 503,
      message:
        "DATABASE_URL is not configured. Add apps/api/.env before saving entries.",
      error: null,
    };
  }

  const parsed = scheduleEntrySchema.safeParse({
    ...(isRecord(payload) ? payload : {}),
    ...overrides,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      statusCode: 400,
      error: parsed.error.flatten(),
    };
  }

  app.log.info(
    {
      person_name: parsed.data.person_name,
      day_of_week: parsed.data.day_of_week,
      time_of_day: parsed.data.time_of_day,
      peptide_name: parsed.data.peptide_name,
    },
    "Creating weekly schedule entry"
  );

  const entry = await createScheduleEntry(parsed.data);

  app.log.info(
    {
      id: entry.id,
      entry_id: entry.entry_id,
      person_name: entry.person_name,
      peptide_name: entry.peptide_name,
    },
    "Weekly schedule entry created"
  );

  try {
    await sendEntryToN8n(entry, app.log);
  } catch (err: unknown) {
    app.log.error(
      {
        message: err instanceof Error ? err.message : "Unknown error",
        entry_id: entry.entry_id,
      },
      "N8N sync failed after weekly schedule entry creation"
    );
  }

  return {
    ok: true as const,
    statusCode: 200,
    entry,
  };
}

export async function registerEntryRoutes(app: FastifyInstance) {
  app.post("/entries", async (request, reply) => {
    app.log.info("POST /entries received");

    const result = await handleScheduleEntry(app, request.body, {});

    if (!result.ok) {
      app.log.warn({ error: result.error }, "Validation failed for /entries");
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });

  app.post("/entries/form", async (request, reply) => {
    app.log.info("POST /entries/form received");

    const result = await handleScheduleEntry(app, request.body, {
      source: "web_form",
    });

    if (!result.ok) {
      app.log.warn(
        { error: result.error },
        "Validation failed for /entries/form"
      );
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });
}

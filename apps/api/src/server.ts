import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import { z } from "zod";

dotenv.config();

const app = Fastify({ logger: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

const hasN8nWebhook =
  !!process.env.N8N_WEBHOOK_URL &&
  process.env.N8N_WEBHOOK_URL !== "replace_me";

const doseAmount = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().positive("dose_amount must be greater than zero"));

const scheduleEntrySchema = z.object({
  person_name: z.enum(["Sean", "Vanessa"]),
  day_of_week: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  time_of_day: z.enum(["AM", "PM"]),
  schedule_date: z.string().min(1, "schedule_date is required"),
  peptide_name: z.enum([
    "Tirzepatide",
    "NAD+",
    "GLOW",
    "Sermorelin",
    "Glutathione",
    "Testosterone",
    "BPC-157",
  ]),
  dose_amount: doseAmount,
  dose_unit: z.enum(["mg", "mcg"]),
  notes: z.string().optional().default(""),
  source: z.string().optional().default("web_form"),
  raw_payload: z.any().optional().default({}),
});

type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;

type ScheduleEntryRow = {
  id: number;
  entry_id: string;
  person_name: "Sean" | "Vanessa";
  day_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  time_of_day: "AM" | "PM";
  schedule_date: string;
  peptide_name:
    | "Tirzepatide"
    | "NAD+"
    | "GLOW"
    | "Sermorelin"
    | "Glutathione"
    | "Testosterone"
    | "BPC-157";
  dose_amount: string;
  dose_unit: "mg" | "mcg";
  notes: string;
  source: string;
  raw_payload: unknown;
  created_at: string;
};

type N8nSchedulePayload = {
  event_type: "weekly_schedule_entry.created";
  entry: ScheduleEntryRow;
};

function buildN8nPayload(entry: ScheduleEntryRow): N8nSchedulePayload {
  return {
    event_type: "weekly_schedule_entry.created",
    entry,
  };
}

async function sendEntryToN8n(entry: ScheduleEntryRow) {
  if (!hasN8nWebhook) {
    app.log.info("N8N webhook not configured; skipping weekly schedule sync");
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.N8N_WEBHOOK_SECRET) {
    headers["x-peptide-journal-secret"] = process.env.N8N_WEBHOOK_SECRET;
  }

  const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: "POST",
    headers,
    body: JSON.stringify(buildN8nPayload(entry)),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `N8N webhook failed with status ${response.status}${text ? `: ${text}` : ""}`
    );
  }

  app.log.info(
    {
      entry_id: entry.entry_id,
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
    },
    "Weekly schedule entry successfully sent to n8n"
  );
}

async function createScheduleEntry(
  data: ScheduleEntryInput
): Promise<ScheduleEntryRow> {
  app.log.info(
    {
      person_name: data.person_name,
      day_of_week: data.day_of_week,
      time_of_day: data.time_of_day,
      peptide_name: data.peptide_name,
    },
    "Creating weekly schedule entry"
  );

  const result = await pool.query<ScheduleEntryRow>(
    `
    WITH next_entry_id AS (
      SELECT nextval(pg_get_serial_sequence('weekly_peptide_schedule', 'id')) AS id
    )
    INSERT INTO weekly_peptide_schedule
    (
      id,
      entry_id,
      person_name,
      day_of_week,
      time_of_day,
      schedule_date,
      peptide_name,
      dose_amount,
      dose_unit,
      notes,
      source,
      raw_payload
    )
    SELECT
      next_entry_id.id,
      'PJ-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(next_entry_id.id::text, 4, '0'),
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb
    FROM next_entry_id
    RETURNING
      id,
      entry_id,
      person_name,
      day_of_week,
      time_of_day,
      schedule_date,
      peptide_name,
      dose_amount::text AS dose_amount,
      dose_unit,
      notes,
      source,
      raw_payload,
      created_at::text AS created_at
    `,
    [
      data.person_name,
      data.day_of_week,
      data.time_of_day,
      data.schedule_date,
      data.peptide_name,
      data.dose_amount,
      data.dose_unit,
      data.notes,
      data.source,
      JSON.stringify(data.raw_payload ?? {}),
    ]
  );

  const entry = result.rows[0];

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
    await sendEntryToN8n(entry);
  } catch (err: any) {
    app.log.error(
      {
        message: err?.message,
        entry_id: entry.entry_id,
      },
      "N8N sync failed after weekly schedule entry creation"
    );
  }

  return entry;
}

async function handleScheduleEntry(
  payload: unknown,
  overrides: Partial<ScheduleEntryInput>
) {
  const parsed = scheduleEntrySchema.safeParse({
    ...(payload as object),
    ...overrides,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      statusCode: 400,
      error: parsed.error.flatten(),
    };
  }

  const entry = await createScheduleEntry(parsed.data);

  return {
    ok: true as const,
    statusCode: 200,
    entry,
  };
}

async function start() {
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  app.log.info(
    {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasN8nWebhook,
    },
    "Startup configuration"
  );

  app.get("/health", async () => {
    const db = await pool.query("SELECT now() AS now");
    return {
      ok: true,
      db: true,
      time: db.rows[0].now,
    };
  });

  app.post("/entries", async (request, reply) => {
    app.log.info("POST /entries received");

    const result = await handleScheduleEntry(request.body, {});

    if (!result.ok) {
      app.log.warn({ error: result.error }, "Validation failed for /entries");
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });

  app.post("/entries/form", async (request, reply) => {
    app.log.info("POST /entries/form received");

    const result = await handleScheduleEntry(request.body, {
      source: "web_form",
    });

    if (!result.ok) {
      app.log.warn({ error: result.error }, "Validation failed for /entries/form");
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });

  await app.listen({
    port: Number(process.env.PORT || 3001),
    host: "0.0.0.0",
  });

  app.log.info("peptide-journal API running");
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

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

const requiredPositiveNumber = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().positive("dose_amount must be greater than zero"));

const optionalNonnegativeNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().nonnegative("weight_lbs must be zero or greater").nullable());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value === undefined) return null;
  return value;
}, z.union([z.string().min(1), z.null()]));

const journalEntrySchema = z.object({
  entry_date: z.string().min(1, "entry_date is required"),
  peptide_name: z.string().min(1, "peptide_name is required"),
  protocol_phase: z
    .enum(["planning", "active", "paused", "completed"])
    .default("active"),
  dose_amount: requiredPositiveNumber,
  dose_unit: z.enum(["mcg", "mg", "iu", "units", "other"]).default("mcg"),
  administration_route: z
    .enum(["subcutaneous", "intramuscular", "oral", "nasal", "topical", "other"])
    .default("subcutaneous"),
  injection_site: z.string().optional().default(""),
  lot_number: z.string().optional().default(""),
  source: z.string().optional().default("web_form"),
  mood: z
    .enum(["low", "steady", "good", "elevated", "not_recorded"])
    .optional()
    .default("not_recorded"),
  energy: z
    .enum(["low", "normal", "high", "not_recorded"])
    .optional()
    .default("not_recorded"),
  sleep_quality: z
    .enum(["poor", "fair", "good", "great", "not_recorded"])
    .optional()
    .default("not_recorded"),
  appetite: z
    .enum(["lower", "normal", "higher", "not_recorded"])
    .optional()
    .default("not_recorded"),
  weight_lbs: optionalNonnegativeNumber,
  observed_effects: z.string().optional().default(""),
  side_effects: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  reminder_requested: z.boolean().optional().default(false),
  follow_up_date: optionalDate,
  terms_accepted: z.boolean().optional().default(false),
  terms_accepted_at: optionalDate,
  terms_accepted_source: z.string().optional().default(""),
  raw_payload: z.any().optional().default({}),
});

type JournalEntryInput = z.infer<typeof journalEntrySchema>;

type JournalEntryRow = {
  id: number;
  entry_id: string;
  entry_date: string;
  peptide_name: string;
  protocol_phase: "planning" | "active" | "paused" | "completed";
  dose_amount: string;
  dose_unit: "mcg" | "mg" | "iu" | "units" | "other";
  administration_route:
    | "subcutaneous"
    | "intramuscular"
    | "oral"
    | "nasal"
    | "topical"
    | "other";
  injection_site: string;
  lot_number: string;
  source: string;
  mood: "low" | "steady" | "good" | "elevated" | "not_recorded";
  energy: "low" | "normal" | "high" | "not_recorded";
  sleep_quality: "poor" | "fair" | "good" | "great" | "not_recorded";
  appetite: "lower" | "normal" | "higher" | "not_recorded";
  weight_lbs: string | null;
  observed_effects: string;
  side_effects: string;
  notes: string;
  reminder_requested: boolean;
  follow_up_date: string | null;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_accepted_source: string;
  raw_payload: unknown;
  created_at: string;
};

type N8nJournalPayload = {
  event_type: "journal_entry.created";
  entry: JournalEntryRow;
};

function buildN8nPayload(entry: JournalEntryRow): N8nJournalPayload {
  return {
    event_type: "journal_entry.created",
    entry,
  };
}

async function sendEntryToN8n(entry: JournalEntryRow) {
  if (!hasN8nWebhook) {
    app.log.info("N8N webhook not configured; skipping journal sync");
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
    "Journal entry successfully sent to n8n"
  );
}

async function createJournalEntry(data: JournalEntryInput): Promise<JournalEntryRow> {
  app.log.info(
    {
      entry_date: data.entry_date,
      peptide_name: data.peptide_name,
      protocol_phase: data.protocol_phase,
      source: data.source,
    },
    "Creating journal entry"
  );

  const result = await pool.query<JournalEntryRow>(
    `
    WITH next_entry_id AS (
      SELECT nextval(pg_get_serial_sequence('journal_entries', 'id')) AS id
    )
    INSERT INTO journal_entries
    (
      id,
      entry_id,
      entry_date,
      peptide_name,
      protocol_phase,
      dose_amount,
      dose_unit,
      administration_route,
      injection_site,
      lot_number,
      source,
      mood,
      energy,
      sleep_quality,
      appetite,
      weight_lbs,
      observed_effects,
      side_effects,
      notes,
      reminder_requested,
      follow_up_date,
      terms_accepted,
      terms_accepted_at,
      terms_accepted_source,
      raw_payload
    )
    SELECT
      next_entry_id.id,
      'PJ-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(next_entry_id.id::text, 4, '0'),
      $1::date,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::date,$20,$21::timestamptz,$22,$23::jsonb
    FROM next_entry_id
    RETURNING
      id,
      entry_id,
      entry_date::text AS entry_date,
      peptide_name,
      protocol_phase,
      dose_amount::text AS dose_amount,
      dose_unit,
      administration_route,
      injection_site,
      lot_number,
      source,
      mood,
      energy,
      sleep_quality,
      appetite,
      weight_lbs::text AS weight_lbs,
      observed_effects,
      side_effects,
      notes,
      reminder_requested,
      follow_up_date::text AS follow_up_date,
      terms_accepted,
      terms_accepted_at::text AS terms_accepted_at,
      terms_accepted_source,
      raw_payload,
      created_at::text AS created_at
    `,
    [
      data.entry_date,
      data.peptide_name,
      data.protocol_phase,
      data.dose_amount,
      data.dose_unit,
      data.administration_route,
      data.injection_site,
      data.lot_number,
      data.source,
      data.mood,
      data.energy,
      data.sleep_quality,
      data.appetite,
      data.weight_lbs,
      data.observed_effects,
      data.side_effects,
      data.notes,
      data.reminder_requested,
      data.follow_up_date,
      data.terms_accepted,
      data.terms_accepted_at,
      data.terms_accepted_source,
      JSON.stringify(data.raw_payload ?? {}),
    ]
  );

  const entry = result.rows[0];

  app.log.info(
    {
      id: entry.id,
      entry_id: entry.entry_id,
      peptide_name: entry.peptide_name,
      createdAt: entry.created_at,
    },
    "Journal entry created"
  );

  try {
    await sendEntryToN8n(entry);
  } catch (err: any) {
    app.log.error(
      {
        message: err?.message,
        entry_id: entry.entry_id,
      },
      "N8N sync failed after journal entry creation"
    );
  }

  return entry;
}

async function handleJournalEntry(
  payload: unknown,
  overrides: Partial<JournalEntryInput>
) {
  const parsed = journalEntrySchema.safeParse({
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

  const entry = await createJournalEntry(parsed.data);

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

    const result = await handleJournalEntry(request.body, {});

    if (!result.ok) {
      app.log.warn({ error: result.error }, "Validation failed for /entries");
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });

  app.post("/entries/form", async (request, reply) => {
    app.log.info("POST /entries/form received");

    const result = await handleJournalEntry(request.body, {
      source: "web_form",
    });

    if (!result.ok) {
      app.log.warn({ error: result.error }, "Validation failed for /entries/form");
      return reply.status(result.statusCode).send(result);
    }

    return result;
  });

  await app.listen({
    port: Number(process.env.PORT || 3000),
    host: "0.0.0.0",
  });

  app.log.info("peptide-journal API running");
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

import type { FastifyBaseLogger } from "fastify";
import { env, hasN8nWebhook } from "../config/env";
import { buildN8nPayload, type ScheduleEntryRow } from "../domain/schedule";

export async function sendEntryToN8n(
  entry: ScheduleEntryRow,
  log: FastifyBaseLogger
) {
  if (!hasN8nWebhook) {
    log.info("N8N webhook not configured; skipping weekly schedule sync");
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.n8nWebhookSecret) {
    headers["x-peptide-journal-secret"] = env.n8nWebhookSecret;
  }

  const response = await fetch(env.n8nWebhookUrl!, {
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

  log.info(
    {
      entry_id: entry.entry_id,
      n8nWebhookUrl: env.n8nWebhookUrl,
    },
    "Weekly schedule entry successfully sent to n8n"
  );
}

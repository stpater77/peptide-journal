import dotenv from "dotenv";

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET,
  port: Number(process.env.PORT || 3001),
};

export const hasN8nWebhook =
  !!env.n8nWebhookUrl && env.n8nWebhookUrl !== "replace_me";

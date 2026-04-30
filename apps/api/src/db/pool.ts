import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl?.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

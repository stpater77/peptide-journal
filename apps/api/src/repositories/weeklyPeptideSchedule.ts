import { pool } from "../db/pool";
import type {
  ScheduleEntryInput,
  ScheduleEntryRow,
} from "../domain/schedule";

export async function createScheduleEntry(
  data: ScheduleEntryInput
): Promise<ScheduleEntryRow> {
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
      customer_name,
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
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb
    FROM next_entry_id
    RETURNING
      id,
      entry_id,
      person_name,
      customer_name,
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
      data.customer_name,
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

  return result.rows[0];
}

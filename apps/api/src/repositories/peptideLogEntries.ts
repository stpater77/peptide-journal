import { pool } from "../db/pool";
import type { PeptideLogInput, PeptideLogRow } from "../domain/peptideLog";

export async function createPeptideLogEntry(
  data: PeptideLogInput
): Promise<PeptideLogRow> {
  const result = await pool.query<PeptideLogRow>(
    `
    WITH next_log_id AS (
      SELECT nextval(pg_get_serial_sequence('peptide_log_entries', 'id')) AS id
    )
    INSERT INTO peptide_log_entries
    (
      id,
      log_id,
      client_name,
      peptide_name,
      peptide_name_other,
      sequence,
      batch_lot,
      vendor_source,
      vendor_source_other,
      administration_date,
      dosage_amount,
      dosage_unit,
      route,
      route_other,
      cycle_phase,
      side_effects,
      notes_observations,
      rating,
      attachment_name,
      attachment_type,
      attachment_size,
      draft,
      processed,
      raw_payload
    )
    SELECT
      next_log_id.id,
      'PL-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(next_log_id.id::text, 4, '0'),
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb
    FROM next_log_id
    RETURNING
      id,
      log_id,
      client_name,
      peptide_name,
      peptide_name_other,
      sequence,
      batch_lot,
      vendor_source,
      vendor_source_other,
      administration_date::text AS administration_date,
      dosage_amount::text AS dosage_amount,
      dosage_unit,
      route,
      route_other,
      cycle_phase,
      side_effects,
      notes_observations,
      rating,
      attachment_name,
      attachment_type,
      attachment_size,
      draft,
      processed,
      raw_payload,
      created_at::text AS created_at,
      updated_at::text AS updated_at
    `,
    [
      data.client_name,
      data.peptide_name,
      data.peptide_name_other,
      data.sequence,
      data.batch_lot,
      data.vendor_source ?? "",
      data.vendor_source_other,
      data.administration_date,
      data.dosage_amount,
      data.dosage_unit,
      data.route ?? "",
      data.route_other,
      data.cycle_phase ?? "",
      data.side_effects,
      data.notes_observations,
      data.rating,
      data.attachment_name,
      data.attachment_type,
      data.attachment_size ?? null,
      data.draft,
      false,
      JSON.stringify(data.raw_payload ?? {}),
    ]
  );

  return result.rows[0];
}

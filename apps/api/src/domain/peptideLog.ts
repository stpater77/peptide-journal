import { z } from "zod";

export const LOG_PEPTIDES = [
  "Tirzepatide",
  "NAD+",
  "GLOW",
  "Sermorelin",
  "Glutathione",
  "Testosterone",
  "BPC-157",
  "Other",
] as const;

export const LOG_VENDORS = [
  "ReviveRx",
  "Hallandale",
  "Empower",
  "Precision",
  "Other",
] as const;

export const LOG_ROUTES = ["Sub-Q", "IM", "SC", "IV", "Oral", "Other"] as const;
export const CYCLE_PHASES = ["Start", "Mid", "End", "Off-cycle"] as const;
export const DOSE_UNITS = ["mcg", "mg"] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");

const doseAmount = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().positive("dosage_amount must be greater than zero"));

const rating = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().int().min(0).max(10).optional());

const today = new Date();
today.setHours(23, 59, 59, 999);

export const peptideLogSchema = z
  .object({
    peptide_name: z.enum(LOG_PEPTIDES),
    peptide_name_other: optionalText(50),
    sequence: z
      .string()
      .trim()
      .min(1, "sequence is required")
      .max(2000)
      .regex(/^[A-Z]+$/, "sequence must contain uppercase letters only"),
    batch_lot: optionalText(80).refine(
      (value) => !value || /^[A-Za-z0-9._ -]+$/.test(value),
      "batch_lot must be alphanumeric"
    ),
    vendor_source: z.enum(LOG_VENDORS).optional(),
    vendor_source_other: optionalText(80),
    administration_date: z
      .string()
      .min(1, "administration_date is required")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date <= today;
      }, "administration_date cannot be in the future"),
    dosage_amount: doseAmount,
    dosage_unit: z.enum(DOSE_UNITS),
    route: z.enum(LOG_ROUTES).optional(),
    route_other: optionalText(40),
    cycle_phase: z.enum(CYCLE_PHASES).optional(),
    side_effects: optionalText(500),
    notes_observations: optionalText(2000),
    rating: rating.default(0),
    attachment_name: optionalText(255),
    attachment_type: optionalText(120),
    attachment_size: z.number().int().nonnegative().max(5 * 1024 * 1024).optional(),
    draft: z.boolean().optional().default(false),
    raw_payload: z.any().optional().default({}),
  })
  .superRefine((data, ctx) => {
    if (data.peptide_name === "Other" && !data.peptide_name_other) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["peptide_name_other"],
        message: "Enter the peptide name when Other is selected.",
      });
    }

    if (data.vendor_source === "Other" && !data.vendor_source_other) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vendor_source_other"],
        message: "Enter the vendor when Other is selected.",
      });
    }

    if (data.route === "Other" && !data.route_other) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["route_other"],
        message: "Enter the route when Other is selected.",
      });
    }
  });

export type PeptideLogInput = z.infer<typeof peptideLogSchema>;

export type PeptideLogRow = {
  id: number;
  log_id: string;
  peptide_name: string;
  peptide_name_other: string;
  sequence: string;
  batch_lot: string;
  vendor_source: string;
  vendor_source_other: string;
  administration_date: string;
  dosage_amount: string;
  dosage_unit: string;
  route: string;
  route_other: string;
  cycle_phase: string;
  side_effects: string;
  notes_observations: string;
  rating: number;
  attachment_name: string;
  attachment_type: string;
  attachment_size: number | null;
  draft: boolean;
  processed: boolean;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
};

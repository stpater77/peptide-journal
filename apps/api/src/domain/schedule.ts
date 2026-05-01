import { z } from "zod";

export const PEOPLE = ["Sean", "Vanessa"] as const;
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export const TIME_WINDOWS = ["AM", "PM"] as const;
export const PEPTIDES = [
  "Tirzepatide",
  "NAD+",
  "GLOW",
  "Sermorelin",
  "Glutathione",
  "Testosterone",
  "BPC-157",
] as const;
export const DOSE_UNITS = ["mg", "mcg"] as const;

const doseAmount = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}, z.number().positive("dose_amount must be greater than zero"));

export const scheduleEntrySchema = z.object({
  person_name: z.enum(PEOPLE),
  customer_name: z.string().trim().max(120).optional().default(""),
  day_of_week: z.enum(DAYS_OF_WEEK),
  time_of_day: z.enum(TIME_WINDOWS),
  schedule_date: z.string().min(1, "schedule_date is required"),
  peptide_name: z.enum(PEPTIDES),
  dose_amount: doseAmount,
  dose_unit: z.enum(DOSE_UNITS),
  notes: z.string().optional().default(""),
  source: z.string().optional().default("web_form"),
  raw_payload: z.any().optional().default({}),
});

export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;

export type ScheduleEntryRow = {
  id: number;
  entry_id: string;
  person_name: (typeof PEOPLE)[number];
  customer_name: string;
  day_of_week: (typeof DAYS_OF_WEEK)[number];
  time_of_day: (typeof TIME_WINDOWS)[number];
  schedule_date: string;
  peptide_name: (typeof PEPTIDES)[number];
  dose_amount: string;
  dose_unit: (typeof DOSE_UNITS)[number];
  notes: string;
  source: string;
  raw_payload: unknown;
  created_at: string;
};

export type N8nSchedulePayload = {
  event_type: "weekly_schedule_entry.created";
  entry: ScheduleEntryRow;
};

export function buildN8nPayload(
  entry: ScheduleEntryRow
): N8nSchedulePayload {
  return {
    event_type: "weekly_schedule_entry.created",
    entry,
  };
}

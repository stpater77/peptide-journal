export const CLIENT_NAMES = ["Sean", "Vanessa"] as const;

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
  "HSSRxpartners",
  "Olympia",
  "Old Cutler Pharmacy",
  "Other",
] as const;

export const LOG_ROUTES = ["Sub-Q", "IM", "SC", "IV", "Oral", "Other"] as const;
export const CYCLE_PHASES = ["No-Cycle", "Start", "Mid", "End", "Off-cycle"] as const;
export const DOSE_UNITS = ["mcg", "mg"] as const;

export type ClientName = (typeof CLIENT_NAMES)[number];
export type LogPeptide = (typeof LOG_PEPTIDES)[number];
export type LogVendor = (typeof LOG_VENDORS)[number];
export type LogRoute = (typeof LOG_ROUTES)[number];
export type CyclePhase = (typeof CYCLE_PHASES)[number];
export type DoseUnit = (typeof DOSE_UNITS)[number];


export type PeptideLogFormState = {
  client_name: ClientName;
  peptide_name: LogPeptide;
  peptide_name_other: string;
  batch_lot: string;
  vendor_source: LogVendor | "";
  vendor_source_other: string;
  administration_date: string;
  dosage_amount: string;
  dosage_unit: DoseUnit;
  route: LogRoute | "";
  route_other: string;
  cycle_phase: CyclePhase | "";
  side_effects: string;
  notes_observations: string;
  rating: string;
  attachment_name: string;
  attachment_type: string;
  attachment_size?: number;
};

export const PEPTIDE_LOG_API_URL =
  process.env.NEXT_PUBLIC_PEPTIDE_LOG_API_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/entries/form", "/peptide-logs/form") ||
  "http://127.0.0.1:3001/peptide-logs/form";

export const initialPeptideLogEntry: PeptideLogFormState = {
  client_name: "Sean",
  peptide_name: "Tirzepatide",
  peptide_name_other: "",
  batch_lot: "",
  vendor_source: "",
  vendor_source_other: "",
  administration_date: "",
  dosage_amount: "",
  dosage_unit: "mg",
  route: "",
  route_other: "",
  cycle_phase: "",
  side_effects: "",
  notes_observations: "",
  rating: "",
  attachment_name: "",
  attachment_type: "",
  attachment_size: undefined,
};

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

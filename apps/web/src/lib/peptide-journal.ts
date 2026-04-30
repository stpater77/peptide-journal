export const PEOPLE = ["Sean", "Vanessa"] as const;

export const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

export const TIME_WINDOWS = ["AM", "PM"] as const;

export const DOSE_UNITS = ["mg", "mcg"] as const;

export const PEPTIDE_OPTIONS = [
  {
    value: "Tirzepatide",
    label: "Tirzepatide",
    group: "Metabolic",
    defaultUnit: "mg",
  },
  {
    value: "NAD+",
    label: "NAD+",
    group: "Cellular Support",
    defaultUnit: "mg",
  },
  {
    value: "GLOW",
    label: "GLOW",
    group: "Skin / Recovery",
    defaultUnit: "mg",
  },
  {
    value: "Sermorelin",
    label: "Sermorelin",
    group: "Sleep / Recovery",
    defaultUnit: "mcg",
  },
  {
    value: "Glutathione",
    label: "Glutathione",
    group: "Cellular Support",
    defaultUnit: "mg",
  },
  {
    value: "Testosterone",
    label: "Testosterone",
    group: "Hormone",
    defaultUnit: "mg",
  },
  {
    value: "BPC-157",
    label: "BPC-157",
    group: "Recovery",
    defaultUnit: "mcg",
  },
] as const;

export type PersonName = (typeof PEOPLE)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]["value"];
export type TimeOfDay = (typeof TIME_WINDOWS)[number];
export type PeptideName = (typeof PEPTIDE_OPTIONS)[number]["value"];
export type DoseUnit = (typeof DOSE_UNITS)[number];

export type ScheduleEntryFormState = {
  person_name: PersonName;
  day_of_week: DayOfWeek;
  time_of_day: TimeOfDay;
  schedule_date: string;
  peptide_name: PeptideName;
  dose_amount: string;
  dose_unit: DoseUnit;
  notes: string;
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/entries/form";

export const initialScheduleEntry: ScheduleEntryFormState = {
  person_name: "Sean",
  day_of_week: "monday",
  time_of_day: "AM",
  schedule_date: "",
  peptide_name: "Tirzepatide",
  dose_amount: "",
  dose_unit: "mg",
  notes: "",
};

export const DASHBOARD_STATS = [
  {
    label: "People",
    value: "2",
    detail: "Sean / Vanessa",
    accentClass: "border-l-[#0f766e]",
  },
  {
    label: "Schedule Windows",
    value: "14",
    detail: "AM and PM across the week",
    accentClass: "border-l-[#b45309]",
  },
  {
    label: "Tracked Peptides",
    value: String(PEPTIDE_OPTIONS.length),
    detail: "Ready for protocol tuning",
    accentClass: "border-l-[#7c3aed]",
  },
] as const;

export const PROTOCOL_GROUPS = [
  {
    title: "Metabolic",
    items: ["Tirzepatide"],
  },
  {
    title: "Recovery",
    items: ["BPC-157", "Sermorelin", "GLOW"],
  },
  {
    title: "Support",
    items: ["NAD+", "Glutathione", "Testosterone"],
  },
] as const;

export const BUILD_QUEUE = [
  {
    title: "Entry Capture",
    detail: "Person, date, window, peptide, dose, and notes",
  },
  {
    title: "Automation Payload",
    detail: "Postgres record plus n8n webhook event",
  },
  {
    title: "Customization Layer",
    detail: "Protocol defaults, reminders, and recent-entry views",
  },
] as const;

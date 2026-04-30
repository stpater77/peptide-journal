"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  API_URL,
  DAYS_OF_WEEK,
  DOSE_UNITS,
  PEPTIDE_OPTIONS,
  PEOPLE,
  TIME_WINDOWS,
  initialScheduleEntry,
  type DayOfWeek,
  type DoseUnit,
  type PeptideName,
  type PersonName,
  type ScheduleEntryFormState,
  type TimeOfDay,
} from "@/lib/peptide-journal";

const controlClass =
  "mt-2 h-11 w-full rounded-lg border border-[#fdba74] bg-[#fffdf8] px-3 text-[#17211c] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20";
const labelClass = "block text-sm font-medium text-[#284134]";

function defaultDoseUnitFor(peptideName: PeptideName): DoseUnit {
  return (
    PEPTIDE_OPTIONS.find((peptide) => peptide.value === peptideName)
      ?.defaultUnit ?? "mg"
  );
}

export function ScheduleEntryForm() {
  const [form, setForm] =
    useState<ScheduleEntryFormState>(initialScheduleEntry);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof ScheduleEntryFormState>(
    key: K,
    value: ScheduleEntryFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePeptide(peptideName: PeptideName) {
    setForm((prev) => ({
      ...prev,
      peptide_name: peptideName,
      dose_unit: defaultDoseUnitFor(peptideName),
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult("");
    setError("");

    const doseAmount = Number(form.dose_amount);

    if (!form.schedule_date.trim()) {
      setSubmitting(false);
      setError("Date is required.");
      return;
    }

    if (!Number.isFinite(doseAmount) || doseAmount <= 0) {
      setSubmitting(false);
      setError("Dose must be a number greater than zero.");
      return;
    }

    try {
      const payload = {
        ...form,
        schedule_date: form.schedule_date.trim(),
        dose_amount: doseAmount,
        notes: form.notes.trim(),
        raw_payload: {
          submitted_from: "peptide-journal-weekly-schedule",
        },
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Submission failed. Please review the entry."
        );
      }

      setResult(
        `Schedule entry saved. Entry ID: ${data?.entry?.entry_id ?? "N/A"}`
      );
      setForm(initialScheduleEntry);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#fdba74] bg-white shadow-sm">
      <div className="border-b border-[#fed7aa] bg-[#fff1dc] px-5 py-4">
        <p className="text-sm font-medium text-[#f97316]">Weekly Schedule</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#17211c]">
          New Schedule Entry
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Name
            <select
              className={controlClass}
              value={form.person_name}
              onChange={(e) =>
                update("person_name", e.target.value as PersonName)
              }
            >
              {PEOPLE.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Day of Week
            <select
              className={controlClass}
              value={form.day_of_week}
              onChange={(e) =>
                update("day_of_week", e.target.value as DayOfWeek)
              }
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            AM / PM
            <select
              className={controlClass}
              value={form.time_of_day}
              onChange={(e) =>
                update("time_of_day", e.target.value as TimeOfDay)
              }
            >
              {TIME_WINDOWS.map((window) => (
                <option key={window} value={window}>
                  {window}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Date
            <input
              className={controlClass}
              type="date"
              value={form.schedule_date}
              onChange={(e) => update("schedule_date", e.target.value)}
              required
            />
          </label>

          <label className={labelClass}>
            Peptide
            <select
              className={controlClass}
              value={form.peptide_name}
              onChange={(e) => updatePeptide(e.target.value as PeptideName)}
            >
              {PEPTIDE_OPTIONS.map((peptide) => (
                <option key={peptide.value} value={peptide.value}>
                  {peptide.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <label className={labelClass}>
              Dose
              <input
                type="number"
                min="0"
                step="0.0001"
                className={controlClass}
                value={form.dose_amount}
                onChange={(e) => update("dose_amount", e.target.value)}
                required
              />
            </label>

            <label className={labelClass}>
              Unit
              <select
                className={controlClass}
                value={form.dose_unit}
                onChange={(e) =>
                  update("dose_unit", e.target.value as DoseUnit)
                }
              >
                {DOSE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className={`${labelClass} mt-5`}>
          Notes
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[#fdba74] bg-[#fffdf8] px-3 py-2.5 text-[#17211c] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Optional notes for this scheduled dose."
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-[#0f766e] px-5 font-medium text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Entry"}
          </button>

          {result && (
            <div className="rounded-lg border border-[#7aa66f] bg-[#edf8ea] px-4 py-2 text-sm text-[#245323]">
              {result}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-[#d08a8a] bg-[#fff0f0] px-4 py-2 text-sm text-[#8a1f1f]">
              {error}
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type PersonName = "Sean" | "Vanessa";
type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type TimeOfDay = "AM" | "PM";
type PeptideName =
  | "Tirzepatide"
  | "NAD+"
  | "GLOW"
  | "Sermorelin"
  | "Glutathione"
  | "Testosterone"
  | "BPC-157";
type DoseUnit = "mg" | "mcg";

type FormState = {
  person_name: PersonName;
  day_of_week: DayOfWeek;
  time_of_day: TimeOfDay;
  schedule_date: string;
  peptide_name: PeptideName;
  dose_amount: string;
  dose_unit: DoseUnit;
  notes: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/entries/form";

const initialState: FormState = {
  person_name: "Sean",
  day_of_week: "monday",
  time_of_day: "AM",
  schedule_date: "",
  peptide_name: "Tirzepatide",
  dose_amount: "",
  dose_unit: "mg",
  notes: "",
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#cfd8d3] bg-white px-3 py-2.5 text-[#17211c] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20";
const labelClass = "block text-sm font-medium text-[#24342c]";

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        throw new Error(data?.message || "Submission failed. Please review the entry.");
      }

      setResult(`Schedule entry saved. Entry ID: ${data?.entry?.entry_id ?? "N/A"}`);
      setForm(initialState);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#17211c]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-[#d9e0dc] pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-[#17211c]">
                Peptide Journal - Sean and Vanessa&apos;s Weekly Peptide Schedule
              </h1>
              <p className="mt-2 text-sm text-[#617168]">
                Structured schedule entry for Postgres, n8n, and Monday.com.
              </p>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-[#0f766e] underline-offset-4 hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[#0f766e] underline-offset-4 hover:underline"
              >
                Terms
              </Link>
            </nav>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d9e0dc] bg-white p-5 shadow-sm"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Name
              <select
                className={fieldClass}
                value={form.person_name}
                onChange={(e) =>
                  update("person_name", e.target.value as PersonName)
                }
              >
                <option value="Sean">Sean</option>
                <option value="Vanessa">Vanessa</option>
              </select>
            </label>

            <label className={labelClass}>
              Day of Week
              <select
                className={fieldClass}
                value={form.day_of_week}
                onChange={(e) =>
                  update("day_of_week", e.target.value as DayOfWeek)
                }
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </label>

            <label className={labelClass}>
              AM/PM
              <select
                className={fieldClass}
                value={form.time_of_day}
                onChange={(e) =>
                  update("time_of_day", e.target.value as TimeOfDay)
                }
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </label>

            <label className={labelClass}>
              Date
              <input
                className={fieldClass}
                value={form.schedule_date}
                onChange={(e) => update("schedule_date", e.target.value)}
                placeholder="MM/DD/YYYY"
                required
              />
            </label>

            <label className={labelClass}>
              Peptide
              <select
                className={fieldClass}
                value={form.peptide_name}
                onChange={(e) =>
                  update("peptide_name", e.target.value as PeptideName)
                }
              >
                <option value="Tirzepatide">Tirzepatide</option>
                <option value="NAD+">NAD+</option>
                <option value="GLOW">GLOW</option>
                <option value="Sermorelin">Sermorelin</option>
                <option value="Glutathione">Glutathione</option>
                <option value="Testosterone">Testosterone</option>
                <option value="BPC-157">BPC-157</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className={labelClass}>
                Dose
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  className={fieldClass}
                  value={form.dose_amount}
                  onChange={(e) => update("dose_amount", e.target.value)}
                  required
                />
              </label>

              <label className={labelClass}>
                Unit
                <select
                  className={fieldClass}
                  value={form.dose_unit}
                  onChange={(e) =>
                    update("dose_unit", e.target.value as DoseUnit)
                  }
                >
                  <option value="mg">mg</option>
                  <option value="mcg">mcg</option>
                </select>
              </label>
            </div>
          </div>

          <label className={`${labelClass} mt-5`}>
            Notes
            <textarea
              className={`${fieldClass} min-h-28 resize-y`}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Optional notes for this scheduled dose."
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#0f766e] px-5 py-2.5 font-medium text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Schedule Entry"}
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
      </div>
    </main>
  );
}

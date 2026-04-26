"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

type FormState = {
  entry_date: string;
  peptide_name: string;
  protocol_phase: "planning" | "active" | "paused" | "completed";
  dose_amount: string;
  dose_unit: "mcg" | "mg" | "iu" | "units" | "other";
  administration_route:
    | "subcutaneous"
    | "intramuscular"
    | "oral"
    | "nasal"
    | "topical"
    | "other";
  injection_site: string;
  lot_number: string;
  mood: "low" | "steady" | "good" | "elevated" | "not_recorded";
  energy: "low" | "normal" | "high" | "not_recorded";
  sleep_quality: "poor" | "fair" | "good" | "great" | "not_recorded";
  appetite: "lower" | "normal" | "higher" | "not_recorded";
  weight_lbs: string;
  observed_effects: string;
  side_effects: string;
  notes: string;
  reminder_requested: boolean;
  follow_up_date: string;
  terms_accepted: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://peptide-journal-production.up.railway.app/entries/form";

const initialState: FormState = {
  entry_date: "",
  peptide_name: "",
  protocol_phase: "active",
  dose_amount: "",
  dose_unit: "mcg",
  administration_route: "subcutaneous",
  injection_site: "",
  lot_number: "",
  mood: "not_recorded",
  energy: "not_recorded",
  sleep_quality: "not_recorded",
  appetite: "not_recorded",
  weight_lbs: "",
  observed_effects: "",
  side_effects: "",
  notes: "",
  reminder_requested: false,
  follow_up_date: "",
  terms_accepted: false,
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#ccd6c5] bg-white px-3 py-2 text-[#18211b] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20";
const labelClass = "block text-sm font-medium text-[#28362d]";

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
    const weightLbs = form.weight_lbs.trim() ? Number(form.weight_lbs) : null;

    if (!form.terms_accepted) {
      setSubmitting(false);
      setError("Please accept the Privacy Policy and Terms before saving this entry.");
      return;
    }

    if (!Number.isFinite(doseAmount) || doseAmount <= 0) {
      setSubmitting(false);
      setError("Dose amount must be greater than zero.");
      return;
    }

    if (weightLbs !== null && (!Number.isFinite(weightLbs) || weightLbs < 0)) {
      setSubmitting(false);
      setError("Weight must be a positive number when provided.");
      return;
    }

    if (form.reminder_requested && !form.follow_up_date) {
      setSubmitting(false);
      setError("Choose a follow-up date or turn off the reminder flag.");
      return;
    }

    try {
      const payload = {
        ...form,
        dose_amount: doseAmount,
        weight_lbs: weightLbs,
        follow_up_date: form.follow_up_date || null,
        terms_accepted_at: new Date().toISOString(),
        terms_accepted_source: "web_form",
        raw_payload: {
          submitted_from: "peptide-journal-web",
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

      setResult(`Entry saved. Entry ID: ${data?.entry?.entry_id ?? "N/A"}`);
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
    <main className="min-h-screen bg-[#f7f8f3] text-[#18211b]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-3 border-b border-[#d8ded0] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-[#18211b]">
              Peptide Journal
            </h1>
            <p className="mt-1 text-sm text-[#5f6f64]">
              Daily protocol entry
            </p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-[#0f766e] underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#0f766e] underline-offset-4 hover:underline">
              Terms
            </Link>
          </nav>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-[#d8ded0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#18211b]">Protocol</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Entry Date
                <input
                  type="date"
                  className={fieldClass}
                  value={form.entry_date}
                  onChange={(e) => update("entry_date", e.target.value)}
                  required
                />
              </label>

              <label className={labelClass}>
                Protocol Phase
                <select
                  className={fieldClass}
                  value={form.protocol_phase}
                  onChange={(e) =>
                    update(
                      "protocol_phase",
                      e.target.value as FormState["protocol_phase"]
                    )
                  }
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
            </div>

            <label className={`${labelClass} mt-4`}>
              Peptide Name
              <input
                className={fieldClass}
                value={form.peptide_name}
                onChange={(e) => update("peptide_name", e.target.value)}
                placeholder="e.g. BPC-157"
                required
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_150px]">
              <label className={labelClass}>
                Dose Amount
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
                    update("dose_unit", e.target.value as FormState["dose_unit"])
                  }
                >
                  <option value="mcg">mcg</option>
                  <option value="mg">mg</option>
                  <option value="iu">IU</option>
                  <option value="units">units</option>
                  <option value="other">other</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Route
                <select
                  className={fieldClass}
                  value={form.administration_route}
                  onChange={(e) =>
                    update(
                      "administration_route",
                      e.target.value as FormState["administration_route"]
                    )
                  }
                >
                  <option value="subcutaneous">Subcutaneous</option>
                  <option value="intramuscular">Intramuscular</option>
                  <option value="oral">Oral</option>
                  <option value="nasal">Nasal</option>
                  <option value="topical">Topical</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className={labelClass}>
                Site
                <input
                  className={fieldClass}
                  value={form.injection_site}
                  onChange={(e) => update("injection_site", e.target.value)}
                  placeholder="e.g. abdomen left"
                />
              </label>
            </div>

            <label className={`${labelClass} mt-4`}>
              Lot or Batch
              <input
                className={fieldClass}
                value={form.lot_number}
                onChange={(e) => update("lot_number", e.target.value)}
              />
            </label>
          </section>

          <section className="rounded-lg border border-[#d8ded0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#18211b]">Check-In</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Mood
                <select
                  className={fieldClass}
                  value={form.mood}
                  onChange={(e) => update("mood", e.target.value as FormState["mood"])}
                >
                  <option value="not_recorded">Not recorded</option>
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="good">Good</option>
                  <option value="elevated">Elevated</option>
                </select>
              </label>

              <label className={labelClass}>
                Energy
                <select
                  className={fieldClass}
                  value={form.energy}
                  onChange={(e) =>
                    update("energy", e.target.value as FormState["energy"])
                  }
                >
                  <option value="not_recorded">Not recorded</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label className={labelClass}>
                Sleep
                <select
                  className={fieldClass}
                  value={form.sleep_quality}
                  onChange={(e) =>
                    update(
                      "sleep_quality",
                      e.target.value as FormState["sleep_quality"]
                    )
                  }
                >
                  <option value="not_recorded">Not recorded</option>
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="great">Great</option>
                </select>
              </label>

              <label className={labelClass}>
                Appetite
                <select
                  className={fieldClass}
                  value={form.appetite}
                  onChange={(e) =>
                    update("appetite", e.target.value as FormState["appetite"])
                  }
                >
                  <option value="not_recorded">Not recorded</option>
                  <option value="lower">Lower</option>
                  <option value="normal">Normal</option>
                  <option value="higher">Higher</option>
                </select>
              </label>
            </div>

            <label className={`${labelClass} mt-4`}>
              Weight (lb)
              <input
                type="number"
                min="0"
                step="0.1"
                className={fieldClass}
                value={form.weight_lbs}
                onChange={(e) => update("weight_lbs", e.target.value)}
              />
            </label>

            <label className={`${labelClass} mt-4`}>
              Observed Effects
              <textarea
                className={`${fieldClass} min-h-28 resize-y`}
                value={form.observed_effects}
                onChange={(e) => update("observed_effects", e.target.value)}
              />
            </label>

            <label className={`${labelClass} mt-4`}>
              Side Effects or Concerns
              <textarea
                className={`${fieldClass} min-h-24 resize-y`}
                value={form.side_effects}
                onChange={(e) => update("side_effects", e.target.value)}
              />
            </label>
          </section>

          <section className="rounded-lg border border-[#d8ded0] bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-[#18211b]">Notes</h2>

            <label className={`${labelClass} mt-5`}>
              Entry Notes
              <textarea
                className={`${fieldClass} min-h-32 resize-y`}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Context, timing, meals, training, travel, or other details."
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
              <label className="flex items-start gap-3 rounded-lg border border-[#d8ded0] bg-[#fbfcf8] p-4 text-sm text-[#28362d]">
                <input
                  type="checkbox"
                  checked={form.reminder_requested}
                  onChange={(e) =>
                    update("reminder_requested", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0f766e]"
                />
                <span>Flag this entry for follow-up.</span>
              </label>

              <label className={labelClass}>
                Follow-Up Date
                <input
                  type="date"
                  className={fieldClass}
                  value={form.follow_up_date}
                  onChange={(e) => update("follow_up_date", e.target.value)}
                />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-[#d6b45d] bg-[#fff8df] px-4 py-3 text-sm text-[#5d4610]">
              This journal is for recordkeeping only and does not provide
              dosing guidance, diagnosis, or medical advice.
            </div>

            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#28362d]">
              <input
                type="checkbox"
                checked={form.terms_accepted}
                onChange={(e) => update("terms_accepted", e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#0f766e]"
                required
              />
              <span>
                I understand this record may contain health-related information
                and agree to the{" "}
                <Link href="/privacy" className="text-[#0f766e] underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-[#0f766e] underline">
                  Terms
                </Link>
                .
              </span>
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#0f766e] px-5 py-2.5 font-medium text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
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
          </section>
        </form>
      </div>
    </main>
  );
}

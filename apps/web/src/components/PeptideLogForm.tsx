"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ATTACHMENT_TYPES,
  CYCLE_PHASES,
  DOSE_UNITS,
  LOG_PEPTIDES,
  LOG_ROUTES,
  LOG_VENDORS,
  MAX_ATTACHMENT_BYTES,
  PEPTIDE_LOG_API_URL,
  initialPeptideLogEntry,
  type CyclePhase,
  type DoseUnit,
  type LogPeptide,
  type LogRoute,
  type LogVendor,
  type PeptideLogFormState,
} from "@/lib/peptide-log";

const draftKey = "peptide-log-entry-draft-v1";
const controlClass =
  "mt-2 h-11 w-full rounded-lg border border-[#fdba74] bg-[#fffdf8] px-3 text-[#17211c] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20";
const textAreaClass =
  "mt-2 min-h-28 w-full resize-y rounded-lg border border-[#fdba74] bg-[#fffdf8] px-3 py-2.5 text-[#17211c] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20";
const labelClass = "block text-sm font-medium text-[#284134]";
const hintClass = "mt-1 text-xs leading-5 text-[#6b756b]";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeSequence(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

export function PeptideLogForm() {
  const [form, setForm] =
    useState<PeptideLogFormState>(initialPeptideLogEntry);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  const maxDate = useMemo(() => todayIso(), []);

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey);
    if (!saved) return;

    try {
      setForm({ ...initialPeptideLogEntry, ...JSON.parse(saved) });
      setDraftSaved(true);
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(form));
      setDraftSaved(true);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [form]);

  function update<K extends keyof PeptideLogFormState>(
    key: K,
    value: PeptideLogFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDraftSaved(false);
  }

  function handleAttachment(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      update("attachment_name", "");
      update("attachment_type", "");
      update("attachment_size", undefined);
      return;
    }

    if (!ATTACHMENT_TYPES.includes(file.type)) {
      e.target.value = "";
      setError("Attachment must be a PDF or image file.");
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      e.target.value = "";
      setError("Attachment must be 5 MB or smaller.");
      return;
    }

    setError("");
    setForm((prev) => ({
      ...prev,
      attachment_name: file.name,
      attachment_type: file.type,
      attachment_size: file.size,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult("");
    setError("");

    const doseAmount = Number(form.dosage_amount);
    const rating = form.rating === "" ? 0 : Number(form.rating);

    if (form.administration_date > maxDate) {
      setSubmitting(false);
      setError("Administration date cannot be in the future.");
      return;
    }

    if (!/^[A-Z]+$/.test(form.sequence)) {
      setSubmitting(false);
      setError("Sequence must contain uppercase letters only.");
      return;
    }

    if (!Number.isFinite(doseAmount) || doseAmount <= 0) {
      setSubmitting(false);
      setError("Dosage must be greater than zero.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
      setSubmitting(false);
      setError("Rating must be a whole number from 0 to 10.");
      return;
    }

    try {
      const response = await fetch(PEPTIDE_LOG_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          dosage_amount: doseAmount,
          rating,
          draft: false,
          raw_payload: {
            submitted_from: "peptide-log-form",
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Submission failed. Please review the log entry.");
      }

      window.localStorage.removeItem(draftKey);
      setDraftSaved(false);
      setResult(`Peptide log saved. Log ID: ${data?.entry?.log_id ?? "N/A"}`);
      setForm(initialPeptideLogEntry);
    } catch (err) {
      const message =
        err instanceof TypeError
          ? `API is not reachable at ${PEPTIDE_LOG_API_URL}.`
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5ed] text-[#17211c]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#fdba74] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#f97316]">
              Peptide Log Entry
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#17211c]">
              Administration Journal
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617168]">
              Typed fields, guided dropdowns, and instant validation for tidy
              PostgreSQL rows.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#0f766e] underline-offset-4 hover:text-[#f97316] hover:underline"
          >
            Weekly Schedule
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#fdba74] bg-white shadow-sm"
        >
          <div className="border-b border-[#fed7aa] bg-[#fff1dc] px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">New Log Entry</h2>
                <p className="mt-1 text-sm text-[#617168]">
                  Drafts auto-save locally while you fill out the form.
                </p>
              </div>
              {draftSaved && (
                <p className="rounded-lg border border-[#86b391] bg-[#eef8ed] px-3 py-1.5 text-sm text-[#245323]">
                  Draft saved
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <label className={labelClass}>
              Peptide name
              <select
                className={controlClass}
                value={form.peptide_name}
                onChange={(e) =>
                  update("peptide_name", e.target.value as LogPeptide)
                }
                required
              >
                {LOG_PEPTIDES.map((peptide) => (
                  <option key={peptide} value={peptide}>
                    {peptide}
                  </option>
                ))}
              </select>
            </label>

            {form.peptide_name === "Other" && (
              <label className={labelClass}>
                Other peptide name
                <input
                  className={controlClass}
                  maxLength={50}
                  value={form.peptide_name_other}
                  onChange={(e) => update("peptide_name_other", e.target.value)}
                  required
                />
              </label>
            )}

            <label className={`${labelClass} md:col-span-2`}>
              Sequence
              <textarea
                className={`${textAreaClass} font-mono uppercase tracking-normal`}
                maxLength={2000}
                value={form.sequence}
                onChange={(e) => update("sequence", sanitizeSequence(e.target.value))}
                required
              />
              <p className={hintClass}>Uppercase amino-acid letters only.</p>
            </label>

            <label className={labelClass}>
              Batch / Lot #
              <input
                className={controlClass}
                pattern="[A-Za-z0-9._ -]*"
                value={form.batch_lot}
                onChange={(e) => update("batch_lot", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Vendor / Source
              <select
                className={controlClass}
                value={form.vendor_source}
                onChange={(e) =>
                  update("vendor_source", e.target.value as LogVendor | "")
                }
              >
                <option value="">Select vendor</option>
                {LOG_VENDORS.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </label>

            {form.vendor_source === "Other" && (
              <label className={labelClass}>
                Other vendor
                <input
                  className={controlClass}
                  maxLength={80}
                  value={form.vendor_source_other}
                  onChange={(e) => update("vendor_source_other", e.target.value)}
                  required
                />
              </label>
            )}

            <label className={labelClass}>
              Administration date
              <input
                className={controlClass}
                type="date"
                max={maxDate}
                value={form.administration_date}
                onChange={(e) => update("administration_date", e.target.value)}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className={labelClass}>
                Dosage
                <input
                  className={controlClass}
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.dosage_amount}
                  onChange={(e) => update("dosage_amount", e.target.value)}
                  required
                />
              </label>
              <label className={labelClass}>
                Unit
                <select
                  className={controlClass}
                  value={form.dosage_unit}
                  onChange={(e) => update("dosage_unit", e.target.value as DoseUnit)}
                  required
                >
                  {DOSE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={labelClass}>
              Route
              <select
                className={controlClass}
                value={form.route}
                onChange={(e) => update("route", e.target.value as LogRoute | "")}
              >
                <option value="">Select route</option>
                {LOG_ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </label>

            {form.route === "Other" && (
              <label className={labelClass}>
                Other route
                <input
                  className={controlClass}
                  maxLength={40}
                  value={form.route_other}
                  onChange={(e) => update("route_other", e.target.value)}
                  required
                />
              </label>
            )}

            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium text-[#284134]">
                Cycle phase
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                {CYCLE_PHASES.map((phase) => (
                  <label
                    key={phase}
                    className="flex h-11 items-center gap-2 rounded-lg border border-[#fdba74] bg-[#fffdf8] px-3 text-sm text-[#284134]"
                  >
                    <input
                      type="radio"
                      name="cycle_phase"
                      value={phase}
                      checked={form.cycle_phase === phase}
                      onChange={(e) =>
                        update("cycle_phase", e.target.value as CyclePhase)
                      }
                    />
                    {phase}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={`${labelClass} md:col-span-2`}>
              Side-effects
              <textarea
                className={textAreaClass}
                maxLength={500}
                value={form.side_effects}
                onChange={(e) => update("side_effects", e.target.value)}
              />
              <p className={hintClass}>{form.side_effects.length}/500 characters</p>
            </label>

            <label className={`${labelClass} md:col-span-2`}>
              Notes / Observations
              <textarea
                className={textAreaClass}
                maxLength={2000}
                value={form.notes_observations}
                onChange={(e) => update("notes_observations", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Rating
              <input
                className={controlClass}
                type="number"
                min="0"
                max="10"
                step="1"
                value={form.rating}
                onChange={(e) => update("rating", e.target.value)}
                placeholder="0-10"
              />
            </label>

            <label className={labelClass}>
              Attachment
              <input
                className="mt-2 block w-full rounded-lg border border-dashed border-[#fdba74] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#17211c] file:mr-3 file:rounded-md file:border-0 file:bg-[#0f766e] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={handleAttachment}
              />
              <p className={hintClass}>PDF or image, 5 MB max. Metadata is saved with the row.</p>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#fed7aa] px-5 py-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg bg-[#0f766e] px-5 font-medium text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Submit Log Entry"}
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

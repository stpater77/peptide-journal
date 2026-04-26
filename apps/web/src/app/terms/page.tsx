import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] px-4 py-10 text-[#18211b]">
      <article className="mx-auto max-w-3xl rounded-lg border border-[#d8ded0] bg-white p-6 leading-7 shadow-sm">
        <Link href="/" className="text-sm text-[#0f766e] underline">
          Back to journal
        </Link>

        <h1 className="mt-5 text-3xl font-semibold">Terms</h1>
        <p className="mt-2 text-sm text-[#5f6f64]">
          Effective date: April 26, 2026
        </p>

        <h2 className="mt-6 text-xl font-semibold">Use of the Journal</h2>
        <p className="mt-2">
          Peptide Journal is provided as a recordkeeping workflow for entries,
          observations, and notes. You are responsible for the accuracy of the
          information submitted.
        </p>

        <h2 className="mt-6 text-xl font-semibold">No Medical Advice</h2>
        <p className="mt-2">
          The application does not provide medical advice, diagnosis, treatment,
          dosing guidance, safety determinations, or emergency support. Consult
          a qualified professional for medical decisions.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Sensitive Information</h2>
        <p className="mt-2">
          Entries may contain health-related information. Only submit information
          you are comfortable storing in the configured database and any enabled
          integrations.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Availability</h2>
        <p className="mt-2">
          The journal may be unavailable during hosting, database, network, or
          maintenance events. Keep independent records when continuity matters.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Privacy</h2>
        <p className="mt-2">
          Use of the journal is also governed by the{" "}
          <Link href="/privacy" className="text-[#0f766e] underline">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </main>
  );
}

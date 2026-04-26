import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] px-4 py-10 text-[#18211b]">
      <article className="mx-auto max-w-3xl rounded-lg border border-[#d8ded0] bg-white p-6 leading-7 shadow-sm">
        <Link href="/" className="text-sm text-[#0f766e] underline">
          Back to journal
        </Link>

        <h1 className="mt-5 text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#5f6f64]">
          Effective date: April 26, 2026
        </p>

        <p className="mt-6">
          Peptide Journal is a recordkeeping tool for protocol entries,
          observations, and follow-up notes. Entries may include health-related
          information that you choose to submit.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Information Collected</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Peptide name, dose, unit, route, site, lot, and protocol phase</li>
          <li>Entry date, follow-up date, notes, and observations</li>
          <li>Optional check-in details such as mood, energy, sleep, appetite, and weight</li>
          <li>Technical data needed to save and process the journal entry</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">How Information Is Used</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Save journal entries</li>
          <li>Support follow-up workflows that you configure</li>
          <li>Maintain operational logs and troubleshoot the application</li>
          <li>Improve the reliability of the journal workflow</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Sharing</h2>
        <p className="mt-2">
          Information is not sold. If integrations are enabled, entries may be
          sent to configured service providers such as hosting, database, or
          automation platforms strictly to operate the journal workflow.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Security</h2>
        <p className="mt-2">
          Reasonable technical and organizational safeguards should be used for
          the database, hosting account, and automation endpoints. No online
          transmission or storage method can be guaranteed completely secure.
        </p>

        <h2 className="mt-6 text-xl font-semibold">Medical Notice</h2>
        <p className="mt-2">
          Peptide Journal does not provide medical advice, diagnosis, treatment
          recommendations, or dosing guidance.
        </p>
      </article>
    </main>
  );
}

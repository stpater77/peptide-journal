import Link from "next/link";
import { DASHBOARD_STATS, PROTOCOL_GROUPS } from "@/lib/peptide-journal";
import { ScheduleEntryForm } from "./ScheduleEntryForm";

export function JournalDashboard() {
  return (
    <main className="min-h-screen bg-[#f6f5ed] text-[#17211c]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#fdba74] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#f97316]">
              Private Protocol Workspace
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#17211c] sm:text-4xl">
              Peptide Journal
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617168]">
              Weekly schedule capture for Sean and Vanessa.
            </p>
          </div>

          <nav className="flex gap-4 text-sm font-medium">
            <Link
              href="/privacy"
              className="text-[#0f766e] underline-offset-4 hover:text-[#f97316] hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#0f766e] underline-offset-4 hover:text-[#f97316] hover:underline"
            >
              Terms
            </Link>
          </nav>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          {DASHBOARD_STATS.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border border-[#fdba74] border-l-4 bg-white px-4 py-3 shadow-sm ${stat.accentClass}`}
            >
              <p className="text-sm font-medium text-[#617168]">
                {stat.label}
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold text-[#17211c]">
                  {stat.value}
                </p>
                <p className="text-right text-sm text-[#617168]">
                  {stat.detail}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <ScheduleEntryForm />

          <aside>
            <section className="rounded-lg border border-[#fdba74] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-[#f97316]">
                Protocol Overview
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#17211c]">
                Current Groups
              </h2>
              <div className="mt-4 space-y-3">
                {PROTOCOL_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3"
                  >
                    <p className="font-medium text-[#24342c]">
                      {group.title}
                    </p>
                    <p className="mt-1 text-sm text-[#617168]">
                      {group.items.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

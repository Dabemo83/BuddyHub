import { loadAllSeasons } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";
import { getManualHistory } from "@/lib/content/history";
import SectionHeading from "@/app/components/SectionHeading";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let auto: { year: number; champion: string; source: "ESPN" }[] = [];
  try {
    const seasons = await loadAllSeasons();
    auto = seasons.map((s) => ({ year: s.year, champion: standings(s)[0]?.name ?? "—", source: "ESPN" as const }));
  } catch {
    auto = [];
  }

  const manual = getManualHistory().map((m) => ({ year: m.year, champion: m.champion, source: "Manual" as const }));
  const manualYears = new Set(manual.map((m) => m.year));
  const all = [...auto.filter((a) => !manualYears.has(a.year)), ...manual].sort((a, b) => b.year - a.year);

  return (
    <div>
      <SectionHeading>Roll of Honor</SectionHeading>
      <p className="text-sm text-muted mb-4">
        &quot;Champion&quot; here is the regular-season points leader. Update to playoff winners via manual history if desired.
      </p>
      <ul className="rounded-xl bg-paper-2 border border-brass/40 overflow-hidden">
        {all.map((r) => (
          <li
            key={`${r.year}-${r.source}`}
            className="flex items-center justify-between px-4 py-3 border-b border-brass/15 last:border-0"
          >
            <span className="text-brass text-lg font-bold w-16" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
              {r.year}
            </span>
            <span className="flex-1 uppercase tracking-[0.02em]" style={{ fontFamily: "var(--font-display)" }}>
              🏆 {r.champion}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.14em] text-cream bg-forest rounded px-2 py-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {r.source}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

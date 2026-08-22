import { loadAllSeasons } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";
import { getManualHistory } from "@/lib/content/history";

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
      <h1 className="text-2xl font-bold mb-4">League History</h1>
      <p className="text-sm text-slate-500 mb-4">
        Note: &quot;champion&quot; here is the regular-season points leader. Update to playoff winners via manual history if desired.
      </p>
      <ul className="divide-y divide-slate-800">
        {all.map((r) => (
          <li key={`${r.year}-${r.source}`} className="py-3 flex justify-between">
            <span className="font-medium">🏆 {r.year}</span>
            <span>{r.champion}</span>
            <span className="text-xs text-slate-500">{r.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

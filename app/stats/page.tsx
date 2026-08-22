import StatCard from "@/app/components/StatCard";
import { loadAllSeasons } from "@/lib/seasons";
import { highestScoringWeek, lowestScoringWeek, mostPointsInLoss } from "@/lib/stats/team-stats";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  try {
    const seasons = await loadAllSeasons();
    if (seasons.length === 0) throw new Error("no seasons");

    const nameFor = (year: number, teamId: number) =>
      seasons.find((s) => s.year === year)?.teams.find((t) => t.id === teamId)?.name ?? `Team ${teamId}`;

    const hi = highestScoringWeek(seasons);
    const lo = lowestScoringWeek(seasons);
    const mpl = mostPointsInLoss(seasons);

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Stats — All-Time</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard emoji="🔥" label="Highest week ever" value={hi.score.toFixed(1)}
            sub={`${nameFor(hi.year, hi.teamId)} · ${hi.year} Wk ${hi.week}`} />
          <StatCard emoji="🥶" label="Lowest week ever" value={lo.score.toFixed(1)}
            sub={`${nameFor(lo.year, lo.teamId)} · ${lo.year} Wk ${lo.week}`} />
          <StatCard emoji="💔" label="Most points in a loss" value={mpl.score.toFixed(1)}
            sub={`${nameFor(mpl.year, mpl.teamId)} · ${mpl.year} Wk ${mpl.week}`} />
        </div>
        <p className="text-sm text-slate-500 mt-6">More team stats and player-level stats coming soon.</p>
      </div>
    );
  } catch {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Stats</h1>
        <p className="text-red-400">Couldn&apos;t load stats — check the ESPN connection (cookies may have expired).</p>
      </div>
    );
  }
}

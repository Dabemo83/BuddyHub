import StatCard from "@/app/components/StatCard";
import LuckTable from "@/app/components/LuckTable";
import { loadAllSeasons, currentSeason } from "@/lib/seasons";
import { highestScoringWeek, lowestScoringWeek, mostPointsInLoss } from "@/lib/stats/team-stats";
import { longestStreak } from "@/lib/stats/streaks";
import { seasonLuck, type TeamLuck } from "@/lib/stats/luck";
import { fetchWeekBench } from "@/lib/espn/rosters";
import type { SeasonData } from "@/lib/espn/types";

export const dynamic = "force-dynamic";

type BenchRecord = { teamId: number; week: number; benchPoints: number };

async function benchRecordForSeason(season: SeasonData): Promise<BenchRecord | null> {
  const weeks = [...new Set(season.matchups.filter((m) => m.completed).map((m) => m.week))];
  if (weeks.length === 0) return null;

  const results = await Promise.allSettled(
    weeks.map((w) => fetchWeekBench(season.year, w).then((rows) => rows.map((r) => ({ ...r, week: w })))),
  );
  const flat = results
    .filter((r): r is PromiseFulfilledResult<BenchRecord[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
  if (flat.length === 0) return null;

  return flat.reduce((best, r) => (r.benchPoints > best.benchPoints ? r : best));
}

export default async function StatsPage() {
  let seasons: SeasonData[];
  try {
    seasons = await loadAllSeasons();
    if (seasons.length === 0) throw new Error("no seasons");
  } catch {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Stats</h1>
        <p className="text-red-400">Couldn&apos;t load stats — check the ESPN connection (cookies may have expired).</p>
      </div>
    );
  }

  const nameFor = (year: number, teamId: number) =>
    seasons.find((s) => s.year === year)?.teams.find((t) => t.id === teamId)?.name ?? `Team ${teamId}`;

  const hi = highestScoringWeek(seasons);
  const lo = lowestScoringWeek(seasons);
  const mpl = mostPointsInLoss(seasons);
  const winStreak = longestStreak(seasons, "win");
  const loseStreak = longestStreak(seasons, "loss");

  const current = seasons.find((s) => s.year === currentSeason());
  const luckRows: (TeamLuck & { name: string })[] = current
    ? seasonLuck(current).map((r) => ({ ...r, name: nameFor(current.year, r.teamId) }))
    : [];

  const bench = current ? await benchRecordForSeason(current) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Stats — All-Time</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard emoji="🔥" label="Highest week ever" value={hi.score.toFixed(1)}
            sub={`${nameFor(hi.year, hi.teamId)} · ${hi.year} Wk ${hi.week}`} />
          <StatCard emoji="🥶" label="Lowest week ever" value={lo.score.toFixed(1)}
            sub={`${nameFor(lo.year, lo.teamId)} · ${lo.year} Wk ${lo.week}`} />
          <StatCard emoji="💔" label="Most points in a loss" value={mpl.score.toFixed(1)}
            sub={`${nameFor(mpl.year, mpl.teamId)} · ${mpl.year} Wk ${mpl.week}`} />
          <StatCard emoji="📈" label="Longest win streak" value={`${winStreak.length} games`}
            sub={`${nameFor(winStreak.year, winStreak.teamId)} · ${winStreak.year}`} />
          <StatCard emoji="📉" label="Longest lose streak" value={`${loseStreak.length} games`}
            sub={`${nameFor(loseStreak.year, loseStreak.teamId)} · ${loseStreak.year}`} />
          {bench && (
            <StatCard emoji="🪑" label="Most points on the bench" value={bench.benchPoints.toFixed(1)}
              sub={`${nameFor(current!.year, bench.teamId)} · ${current!.year} Wk ${bench.week}`} />
          )}
        </div>
        {current && !bench && (
          <p className="text-sm text-slate-500 mt-3">Bench data unavailable right now.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          {current ? `${current.year} Luck & Scoring` : "Luck & Scoring"}
        </h2>
        {luckRows.length > 0 ? (
          <LuckTable rows={luckRows} />
        ) : (
          <p className="text-slate-400 text-sm">No games played yet this season.</p>
        )}
        <p className="text-xs text-slate-500 mt-3">
          xW = expected wins (all-play). Luck = actual wins minus expected wins. Player-level stats coming soon.
        </p>
      </div>
    </div>
  );
}

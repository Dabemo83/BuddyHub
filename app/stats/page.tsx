import StatCard from "@/app/components/StatCard";
import LuckTable from "@/app/components/LuckTable";
import SectionHeading from "@/app/components/SectionHeading";
import { loadAllSeasons, currentSeason } from "@/lib/seasons";
import { highestScoringWeek, lowestScoringWeek, mostPointsInLoss } from "@/lib/stats/team-stats";
import { longestStreak } from "@/lib/stats/streaks";
import { seasonLuck, type TeamLuck } from "@/lib/stats/luck";
import { fetchWeekBench, type TeamBench } from "@/lib/espn/rosters";
import type { SeasonData } from "@/lib/espn/types";

export const dynamic = "force-dynamic";

type BenchRecord = TeamBench & { week: number };

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
        <SectionHeading>Stats</SectionHeading>
        <p className="text-[#a3401f]">Couldn&apos;t load stats — check the ESPN connection (cookies may have expired).</p>
      </div>
    );
  }

  const nameFor = (year: number, teamId: number) =>
    seasons.find((s) => s.year === year)?.teams.find((t) => t.id === teamId)?.name ?? `Team ${teamId}`;

  // All-time record stats throw when there are zero completed matchups (e.g. a
  // brand-new league before week 1). Guard so the page degrades instead of crashing.
  let records:
    | {
        hi: ReturnType<typeof highestScoringWeek>;
        lo: ReturnType<typeof lowestScoringWeek>;
        mpl: ReturnType<typeof mostPointsInLoss>;
        winStreak: ReturnType<typeof longestStreak>;
        loseStreak: ReturnType<typeof longestStreak>;
      }
    | null = null;
  try {
    records = {
      hi: highestScoringWeek(seasons),
      lo: lowestScoringWeek(seasons),
      mpl: mostPointsInLoss(seasons),
      winStreak: longestStreak(seasons, "win"),
      loseStreak: longestStreak(seasons, "loss"),
    };
  } catch {
    records = null;
  }

  const current = seasons.find((s) => s.year === currentSeason());
  const luckRows: (TeamLuck & { name: string })[] = current
    ? seasonLuck(current).map((r) => ({ ...r, name: nameFor(current.year, r.teamId) }))
    : [];

  const bench = current ? await benchRecordForSeason(current) : null;

  if (!records) {
    return (
      <div>
        <SectionHeading>Stats — All-Time</SectionHeading>
        <p className="text-muted text-sm">No completed games yet — all-time records will appear once the season is underway.</p>
      </div>
    );
  }

  const { hi, lo, mpl, winStreak, loseStreak } = records;

  return (
    <div className="space-y-10">
      <div>
        <SectionHeading>Stats — All-Time</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
            <StatCard
              variant="feature"
              emoji="🔥"
              label="Highest week ever"
              value={hi.score.toFixed(1)}
              sub={`${nameFor(hi.year, hi.teamId)} · ${hi.year} Wk ${hi.week}`}
            />
          </div>
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
          <p className="text-sm text-muted mt-3">Bench data unavailable right now.</p>
        )}
      </div>

      <div>
        <SectionHeading>{current ? `${current.year} Luck & Scoring` : "Luck & Scoring"}</SectionHeading>
        {luckRows.length > 0 ? (
          <LuckTable rows={luckRows} />
        ) : (
          <p className="text-muted text-sm">No games played yet this season.</p>
        )}
        <p className="text-xs text-muted mt-3">
          xW = expected wins (all-play). Luck = actual wins minus expected wins. Player-level stats coming soon.
        </p>
      </div>
    </div>
  );
}

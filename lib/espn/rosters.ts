import { requireEnv } from "./client";

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";
const CACHE_SECONDS = 60 * 60 * 3; // 3 hours, matching client.ts
const BENCH_SLOTS = new Set([20, 21]); // 20 = bench, 21 = IR

interface RawEntry { lineupSlotId: number; playerPoolEntry?: { appliedStatTotal?: number } }
interface RawSide { teamId: number; rosterForCurrentScoringPeriod?: { entries?: RawEntry[] } }
interface RawGame { matchupPeriodId?: number; home?: RawSide; away?: RawSide }
interface RawBoxscore { schedule?: RawGame[] }

export interface TeamBench { teamId: number; benchPoints: number }

/** Pure: sum bench/IR applied points per team from one mBoxscore week response. */
export function benchFromRoster(raw: RawBoxscore): TeamBench[] {
  const sides: RawSide[] = [];
  for (const g of raw.schedule ?? []) {
    if (g.home) sides.push(g.home);
    if (g.away) sides.push(g.away);
  }

  const out: TeamBench[] = [];
  for (const s of sides) {
    const entries = s.rosterForCurrentScoringPeriod?.entries;
    if (!entries) continue;
    const benchPoints = entries
      .filter((e) => BENCH_SLOTS.has(e.lineupSlotId))
      .reduce((sum, e) => sum + (e.playerPoolEntry?.appliedStatTotal ?? 0), 0);
    out.push({ teamId: s.teamId, benchPoints });
  }
  return out;
}

/** Network: fetch one scoring period's bench totals. Not unit-tested (hits ESPN). */
export async function fetchWeekBench(year: number, week: number): Promise<TeamBench[]> {
  const leagueId = requireEnv("ESPN_LEAGUE_ID");
  const s2 = requireEnv("ESPN_S2");
  const swid = requireEnv("ESPN_SWID");
  const url = `${BASE}/seasons/${year}/segments/0/leagues/${leagueId}?scoringPeriodId=${week}&view=mBoxscore`;

  const res = await fetch(url, {
    headers: { Cookie: `espn_s2=${s2}; SWID=${swid}` },
    cache: "force-cache",
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) throw new Error(`ESPN boxscore fetch failed for ${year} wk ${week}: ${res.status}`);

  const json = await res.json();
  return benchFromRoster(json);
}

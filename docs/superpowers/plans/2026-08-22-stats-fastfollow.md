# Stats Fast-Follow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four team stats to the BuddyHub Stats page: longest win streak, longest lose streak, points-for/against + luck (per-team table), and most points left on the bench.

**Architecture:** Three new pure, unit-tested stat modules (`lib/stats/streaks.ts`, `lib/stats/luck.ts`, and a bench parser in `lib/espn/rosters.ts`) plus a thin network wrapper for roster fetching. The Stats page composes them, reusing the existing all-time load for streaks and the current season for luck + bench. Streaks/luck come from data already normalized; bench points needs ESPN's per-week `mBoxscore` view (current season only).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, Vitest.

---

## File Structure

```
lib/stats/streaks.ts        → longestStreak(seasons, "win"|"loss") (pure)
lib/stats/streaks.test.ts
lib/stats/luck.ts           → seasonLuck(season): TeamLuck[] (pure, all-play expected wins)
lib/stats/luck.test.ts
lib/espn/rosters.ts         → benchFromRoster(raw) (pure) + fetchWeekBench(year,week) (network)
lib/espn/rosters.test.ts
lib/espn/client.ts          → MODIFY: export requireEnv (reused by rosters.ts)
app/components/LuckTable.tsx→ presentational table for seasonLuck rows
app/stats/page.tsx          → MODIFY: add streak cards, bench card, luck table
```

All three stat modules follow the existing `lib/stats/team-stats.ts` pattern: pure functions over normalized types, tested with hand-built `SeasonData` fixtures.

---

## Task 1: Longest streaks module (TDD)

**Files:**
- Create: `lib/stats/streaks.ts`, `lib/stats/streaks.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/stats/streaks.test.ts`. It builds a `SeasonData` literal directly (no ESPN raw needed):

```ts
import { describe, it, expect } from "vitest";
import type { SeasonData } from "@/lib/espn/types";
import { longestStreak } from "@/lib/stats/streaks";

// Team 1 wins wk1-3 then loses wk4; Team 2 is the mirror.
const season: SeasonData = {
  year: 2024,
  teams: [
    { id: 1, name: "One", owner: "A", wins: 3, losses: 1, ties: 0, pointsFor: 0, pointsAgainst: 0 },
    { id: 2, name: "Two", owner: "B", wins: 1, losses: 3, ties: 0, pointsFor: 0, pointsAgainst: 0 },
  ],
  matchups: [
    { week: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
    { week: 2, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
    { week: 3, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
    { week: 4, homeTeamId: 2, awayTeamId: 1, homeScore: 100, awayScore: 90, completed: true },
    { week: 5, homeTeamId: 1, awayTeamId: 2, homeScore: 0, awayScore: 0, completed: false },
  ],
};

describe("longestStreak", () => {
  it("finds the longest win streak", () => {
    const s = longestStreak([season], "win");
    expect(s.teamId).toBe(1);
    expect(s.length).toBe(3);
    expect(s.year).toBe(2024);
  });

  it("finds the longest lose streak", () => {
    const s = longestStreak([season], "loss");
    expect(s.teamId).toBe(2);
    expect(s.length).toBe(3);
  });

  it("ignores incomplete games (they don't extend or break streaks)", () => {
    // wk5 is incomplete; team 1's streak is still the wk1-3 run of 3
    const s = longestStreak([season], "win");
    expect(s.length).toBe(3);
  });

  it("throws when there are no completed matchups", () => {
    const empty: SeasonData = { year: 2024, teams: [], matchups: [] };
    expect(() => longestStreak([empty], "win")).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- streaks`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/stats/streaks.ts`:

```ts
import type { SeasonData } from "@/lib/espn/types";

export interface Streak {
  teamId: number;
  year: number;
  length: number;
}

type Outcome = { teamId: number; year: number; week: number; result: "W" | "L" | "T" };

/** Per-team outcome rows for every completed matchup (two rows per game). */
function outcomes(seasons: SeasonData[]): Outcome[] {
  const rows: Outcome[] = [];
  for (const s of seasons) {
    for (const m of s.matchups) {
      if (!m.completed) continue;
      const home: Outcome["result"] =
        m.homeScore > m.awayScore ? "W" : m.homeScore < m.awayScore ? "L" : "T";
      const away: Outcome["result"] = home === "W" ? "L" : home === "L" ? "W" : "T";
      rows.push({ teamId: m.homeTeamId, year: s.year, week: m.week, result: home });
      rows.push({ teamId: m.awayTeamId, year: s.year, week: m.week, result: away });
    }
  }
  return rows;
}

/** Longest consecutive run of the requested result across all seasons, per team. */
export function longestStreak(seasons: SeasonData[], kind: "win" | "loss"): Streak {
  const target = kind === "win" ? "W" : "L";
  const rows = outcomes(seasons);
  if (rows.length === 0) throw new Error("No completed matchups");

  const byTeam = new Map<number, Outcome[]>();
  for (const r of rows) {
    const arr = byTeam.get(r.teamId) ?? [];
    arr.push(r);
    byTeam.set(r.teamId, arr);
  }

  let best: Streak = { teamId: rows[0].teamId, year: rows[0].year, length: 0 };
  for (const [teamId, games] of byTeam) {
    games.sort((a, b) => a.year - b.year || a.week - b.week);
    let run = 0;
    let runYear = games[0].year;
    for (const g of games) {
      if (g.result === target) {
        run += 1;
        runYear = g.year;
        if (run > best.length) best = { teamId, year: runYear, length: run };
      } else {
        run = 0;
      }
    }
  }
  return best;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- streaks`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/stats/streaks.ts lib/stats/streaks.test.ts
git commit -m "feat: add longest win/lose streak calculator with tests"
```

---

## Task 2: Luck module (TDD)

**Files:**
- Create: `lib/stats/luck.ts`, `lib/stats/luck.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/stats/luck.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { SeasonData } from "@/lib/espn/types";
import { seasonLuck } from "@/lib/stats/luck";

// One week, 4 teams. Scores A100 B90 C80 D70. Matchups: A beats B, C beats D.
const season: SeasonData = {
  year: 2024,
  teams: [
    { id: 1, name: "A", owner: "a", wins: 1, losses: 0, ties: 0, pointsFor: 100, pointsAgainst: 90 },
    { id: 2, name: "B", owner: "b", wins: 0, losses: 1, ties: 0, pointsFor: 90, pointsAgainst: 100 },
    { id: 3, name: "C", owner: "c", wins: 1, losses: 0, ties: 0, pointsFor: 80, pointsAgainst: 70 },
    { id: 4, name: "D", owner: "d", wins: 0, losses: 1, ties: 0, pointsFor: 70, pointsAgainst: 80 },
  ],
  matchups: [
    { week: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
    { week: 1, homeTeamId: 3, awayTeamId: 4, homeScore: 80, awayScore: 70, completed: true },
  ],
};

describe("seasonLuck", () => {
  const rows = seasonLuck(season);
  const byId = (id: number) => rows.find((r) => r.teamId === id)!;

  it("computes all-play expected wins", () => {
    expect(byId(1).expectedWins).toBeCloseTo(1.0);   // A beat all 3
    expect(byId(2).expectedWins).toBeCloseTo(2 / 3);  // B beat C,D
    expect(byId(3).expectedWins).toBeCloseTo(1 / 3);  // C beat D
    expect(byId(4).expectedWins).toBeCloseTo(0);
  });

  it("luck = actual wins minus expected wins", () => {
    expect(byId(3).luck).toBeCloseTo(1 - 1 / 3); // lucky: won despite low all-play
    expect(byId(2).luck).toBeCloseTo(0 - 2 / 3); // unlucky
    expect(byId(1).luck).toBeCloseTo(0);
  });

  it("carries pf/pa and games played", () => {
    expect(byId(1).pf).toBeCloseTo(100);
    expect(byId(1).pa).toBeCloseTo(90);
    expect(byId(1).gamesPlayed).toBe(1);
  });

  it("sorts by luck descending", () => {
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].luck).toBeGreaterThanOrEqual(rows[i].luck);
    }
  });

  it("counts a tie as half an expected win", () => {
    const tie: SeasonData = {
      year: 2024,
      teams: [
        { id: 1, name: "A", owner: "a", wins: 0, losses: 0, ties: 1, pointsFor: 95, pointsAgainst: 95 },
        { id: 2, name: "B", owner: "b", wins: 0, losses: 0, ties: 1, pointsFor: 95, pointsAgainst: 95 },
      ],
      matchups: [
        { week: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 95, awayScore: 95, completed: true },
      ],
    };
    expect(seasonLuck(tie).find((r) => r.teamId === 1)!.expectedWins).toBeCloseTo(0.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- luck`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/stats/luck.ts`:

```ts
import type { SeasonData } from "@/lib/espn/types";

export interface TeamLuck {
  teamId: number;
  pf: number;
  pa: number;
  expectedWins: number;
  actualWins: number;
  luck: number;
  gamesPlayed: number;
}

/**
 * All-play expected wins per team for one season: each completed week, a team's
 * expected wins = (teams it outscored + 0.5 * teams it tied) / (other teams that week).
 * Luck = actual wins (from the ESPN record) minus expected wins.
 */
export function seasonLuck(season: SeasonData): TeamLuck[] {
  const weeks = new Map<number, { teamId: number; score: number }[]>();
  for (const m of season.matchups) {
    if (!m.completed) continue;
    const arr = weeks.get(m.week) ?? [];
    arr.push({ teamId: m.homeTeamId, score: m.homeScore });
    arr.push({ teamId: m.awayTeamId, score: m.awayScore });
    weeks.set(m.week, arr);
  }

  const expected = new Map<number, number>();
  const played = new Map<number, number>();
  for (const scores of weeks.values()) {
    for (const me of scores) {
      const others = scores.filter((o) => o !== me);
      let ew = 0;
      for (const o of others) {
        if (me.score > o.score) ew += 1;
        else if (me.score === o.score) ew += 0.5;
      }
      const perWeek = others.length > 0 ? ew / others.length : 0;
      expected.set(me.teamId, (expected.get(me.teamId) ?? 0) + perWeek);
      played.set(me.teamId, (played.get(me.teamId) ?? 0) + 1);
    }
  }

  return season.teams
    .filter((t) => played.has(t.id))
    .map((t) => {
      const ew = expected.get(t.id) ?? 0;
      return {
        teamId: t.id,
        pf: t.pointsFor,
        pa: t.pointsAgainst,
        expectedWins: ew,
        actualWins: t.wins,
        luck: t.wins - ew,
        gamesPlayed: played.get(t.id) ?? 0,
      };
    })
    .sort((a, b) => b.luck - a.luck);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- luck`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/stats/luck.ts lib/stats/luck.test.ts
git commit -m "feat: add all-play luck calculator with tests"
```

---

## Task 3: Roster bench module (TDD parser + network wrapper)

**Files:**
- Create: `lib/espn/rosters.ts`, `lib/espn/rosters.test.ts`, `test/fixtures/espn-boxscore-week.json`
- Modify: `lib/espn/client.ts` (export `requireEnv` for reuse)

- [ ] **Step 1: Export `requireEnv` from client.ts**

In `lib/espn/client.ts`, change the line `function requireEnv(name: string): string {` to `export function requireEnv(name: string): string {`. Change nothing else.

- [ ] **Step 2: Create the boxscore fixture**

Create `test/fixtures/espn-boxscore-week.json` (mirrors ESPN's `mBoxscore` view; lineup slot 20 = bench, 21 = IR, others = starters):

```json
{
  "schedule": [
    {
      "matchupPeriodId": 1,
      "home": {
        "teamId": 1,
        "rosterForCurrentScoringPeriod": {
          "entries": [
            { "lineupSlotId": 0, "playerPoolEntry": { "appliedStatTotal": 20.0 } },
            { "lineupSlotId": 2, "playerPoolEntry": { "appliedStatTotal": 12.0 } },
            { "lineupSlotId": 20, "playerPoolEntry": { "appliedStatTotal": 15.5 } },
            { "lineupSlotId": 21, "playerPoolEntry": { "appliedStatTotal": 4.5 } }
          ]
        }
      },
      "away": {
        "teamId": 2,
        "rosterForCurrentScoringPeriod": {
          "entries": [
            { "lineupSlotId": 0, "playerPoolEntry": { "appliedStatTotal": 10.0 } },
            { "lineupSlotId": 20, "playerPoolEntry": { "appliedStatTotal": 30.0 } }
          ]
        }
      }
    }
  ]
}
```

- [ ] **Step 3: Write the failing test**

Create `lib/espn/rosters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/espn-boxscore-week.json";
import { benchFromRoster } from "@/lib/espn/rosters";

describe("benchFromRoster", () => {
  const rows = benchFromRoster(fixture as unknown as Parameters<typeof benchFromRoster>[0]);
  const byId = (id: number) => rows.find((r) => r.teamId === id)!;

  it("sums only bench (20) and IR (21) slots per team", () => {
    expect(byId(1).benchPoints).toBeCloseTo(20.0); // 15.5 + 4.5
    expect(byId(2).benchPoints).toBeCloseTo(30.0);
  });

  it("returns one row per side that has a roster", () => {
    expect(rows).toHaveLength(2);
  });

  it("handles missing schedule/rosters without throwing", () => {
    expect(benchFromRoster({})).toEqual([]);
    expect(benchFromRoster({ schedule: [{ matchupPeriodId: 1 }] })).toEqual([]);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- rosters`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement**

Create `lib/espn/rosters.ts`:

```ts
import { requireEnv } from "./client";

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";
const CACHE_SECONDS = 60 * 60 * 3; // 3 hours, matching client.ts
const BENCH_SLOTS = new Set([20, 21]); // 20 = bench, 21 = IR

interface RawEntry { lineupSlotId: number; playerPoolEntry?: { appliedStatTotal?: number } }
interface RawSide { teamId: number; rosterForCurrentScoringPeriod?: { entries?: RawEntry[] } }
interface RawGame { home?: RawSide; away?: RawSide }
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

/** Network: fetch one scoring period's bench totals. Not unit-tested. */
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- rosters`
Expected: PASS (3 tests).

- [ ] **Step 7: Verify nothing else broke**

Run: `npm test` (all suites), then `npx tsc --noEmit`.
Expected: all tests pass; tsc clean.

- [ ] **Step 8: Commit**

```bash
git add lib/espn/rosters.ts lib/espn/rosters.test.ts test/fixtures/espn-boxscore-week.json lib/espn/client.ts
git commit -m "feat: add roster bench parser + week fetch; export requireEnv"
```

---

## Task 4: Wire the new stats into the Stats page

**Files:**
- Create: `app/components/LuckTable.tsx`
- Modify: `app/stats/page.tsx`

- [ ] **Step 1: Create the LuckTable component**

Create `app/components/LuckTable.tsx`:

```tsx
import type { TeamLuck } from "@/lib/stats/luck";

export default function LuckTable({ rows }: { rows: (TeamLuck & { name: string })[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-400 border-b border-slate-800">
        <tr>
          <th scope="col" className="py-2">Team</th>
          <th scope="col" className="text-right">PF</th>
          <th scope="col" className="text-right">PA</th>
          <th scope="col" className="text-right">PF/G</th>
          <th scope="col" className="text-right">xW</th>
          <th scope="col" className="text-right">W</th>
          <th scope="col" className="text-right">Luck</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.teamId} className="border-b border-slate-800/50">
            <td className="py-2 font-medium">{r.name}</td>
            <td className="text-right">{r.pf.toFixed(1)}</td>
            <td className="text-right">{r.pa.toFixed(1)}</td>
            <td className="text-right">{r.gamesPlayed ? (r.pf / r.gamesPlayed).toFixed(1) : "—"}</td>
            <td className="text-right">{r.expectedWins.toFixed(1)}</td>
            <td className="text-right">{r.actualWins}</td>
            <td className={`text-right ${r.luck >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {r.luck >= 0 ? "+" : ""}{r.luck.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Replace the Stats page**

Replace the entire contents of `app/stats/page.tsx` with the following. It keeps the existing all-time record cards, adds two streak cards, computes the current-season luck table, and adds the bench record (fetched per completed week of the current season, degrading gracefully):

```tsx
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
```

Note: `highestScoringWeek`/`lowestScoringWeek`/`mostPointsInLoss`/`longestStreak` throw only when there are zero completed matchups across all seasons; since we reach this code only after `seasons.length > 0`, and past seasons always have completed games, this is safe. If you want to be extra defensive you may wrap the record-card computations in the same try, but it is not required for correct behavior.

- [ ] **Step 3: Verify the build and tests**

Run: `npm run build`
Expected: succeeds; `/stats` is a dynamic route. The build must not fetch ESPN (no creds) — `force-dynamic` defers rendering to request time.

Run: `npm test`
Expected: all suites pass (streaks, luck, rosters added to the prior 20).

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add app/components/LuckTable.tsx app/stats/page.tsx
git commit -m "feat: add streaks, luck table, and bench record to stats page"
```

---

## Self-Review Notes

- **Spec coverage:** longest win/lose streak (Task 1, shown as cards in Task 4), points-for/against + all-play luck table current-season (Task 2 + LuckTable in Task 4), bench points current-season record via mBoxscore (Task 3 parser + fetch, card in Task 4), graceful degradation for bench and empty luck (Task 4), isolation of roster parsing in `lib/espn/rosters.ts` (Task 3), TDD on the three pure functions (Tasks 1-3). All spec sections map to a task.
- **Deviations from spec, intentional:** `TeamLuck` gains a `gamesPlayed` field (needed for the PF/G column); `Streak.year` is the season the streak ended in, as specified.
- **Type consistency:** `SeasonData`/`Team`/`Matchup` reused unchanged; `TeamLuck` defined in Task 2 and consumed by `LuckTable`/page in Task 4; `TeamBench`/`benchFromRoster`/`fetchWeekBench` defined in Task 3 and used in Task 4; `requireEnv` exported in Task 3 and imported by `rosters.ts`. `longestStreak(seasons, "win"|"loss")` signature consistent between Task 1 and Task 4.
- **No placeholders:** every code step is complete; commands include expected results.

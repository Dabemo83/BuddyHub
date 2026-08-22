# BuddyHub Stats Fast-Follow — Design Spec

**Date:** 2026-08-22
**Repo:** https://github.com/Dabemo83/BuddyHub
**Status:** Design approved, pending spec review
**Builds on:** `2026-08-22-buddyhub-design.md` (the shipped v1)

## Overview

Extend the existing Stats page with four additional team-level stats requested
after v1 shipped: longest win streak, longest lose streak, points for/against
with a luck index, and bench points. Three come from data already fetched;
bench points requires new roster-level data from ESPN.

## Goals

- Add the four stats with correct, well-defined semantics.
- Keep each stat as a small, independently unit-tested pure function, matching
  the existing `lib/stats` pattern.
- Isolate the new ESPN roster fetching so it does not complicate the existing
  `lib/espn/normalize.ts`.
- Degrade gracefully when ESPN (or roster data) is unavailable, like the rest
  of the app.

## Non-Goals

- Player-level stats (best/bust player, most-rostered) — still deferred.
- All-time bench points (see Bench Points scope decision below).
- "Optimal lineup / points lost to start-sit" analysis — bench points is the
  simple total only.

## Stat Definitions

### Longest win streak / Longest lose streak (all-time)
Single all-time records. For each team, walk its completed matchups in
chronological order (by year, then week) and find the longest consecutive run
of wins (and separately, losses). Result: `{ teamId, year, length }` where
`year` is the season the streak ended in (for display context). Displayed as
two record cards.

### Points For / Against + Luck (current season, per-team table)
A per-team table for the current season. Each row: team name, PF, PA, PF/game,
expected wins, actual wins, luck.

**Expected wins (all-play method):** For each completed week, compare a team's
score against every other team that played that week. A team's expected wins
for the week = (number of other teams it outscored) / (number of other teams).
Ties count as 0.5. Sum across weeks = season expected wins.

**Luck** = actual wins − expected wins. Positive = lucky (won more than scoring
deserved); negative = unlucky.

### Bench points (current season record)
"Most points left on the bench" for the current season. For each completed
week, sum the actual points of each team's benched players (ESPN lineup slots
20 = bench, 21 = IR). The record is the single highest team-week bench total:
`{ teamId, week, benchPoints }`. Displayed as one record card. Degrades to a
"not available" note if roster data can't be fetched.

**Scope decision:** Bench is current-season only. ESPN's `mBoxscore` view
returns lineups per scoring period, so an all-time bench record would require
100+ per-week fetches across all seasons and risk Vercel function timeouts.
Current season bounds this to at most ~17 week-fetches (cached ~3h).

## Architecture

### New: `lib/espn/rosters.ts`
Isolated roster fetching + parsing. Keeps roster logic out of `normalize.ts`.
- `benchFromRoster(rawWeek): { teamId: number; benchPoints: number }[]` — pure
  parser over one `mBoxscore` week response. Sums applied points for entries in
  lineup slots 20 and 21 per team. Unit-tested with a fixture.
- `fetchWeekBench(year, week): Promise<{ teamId, benchPoints }[]>` — thin
  network wrapper: calls the ESPN `mBoxscore` view for one scoring period with
  the league cookies (reusing the same env vars and cache settings as
  `lib/espn/client.ts`), then delegates to `benchFromRoster`. Not unit-tested
  (network).

### New: `lib/stats/streaks.ts`
- `longestStreak(seasons: SeasonData[], kind: "win" | "loss"): { teamId, year, length }`
  — pure; walks per-team completed matchups chronologically. Throws a named
  error if there are no completed matchups (consistent with existing stats).

### New: `lib/stats/luck.ts`
- `interface TeamLuck { teamId; pf; pa; expectedWins; actualWins; luck }`
- `seasonLuck(season: SeasonData): TeamLuck[]` — pure; computes all-play
  expected wins and luck per team for one season. Returns `[]` for a season
  with no completed matchups (page can show "no data yet").

### Modified: `app/stats/page.tsx`
Extends the existing page (keeps the current highest/lowest week + most-points-
in-a-loss cards). Adds, inside the existing try/catch:
- Two record cards: longest win streak, longest lose streak (all-time, via
  `longestStreak`).
- One bench record card: fetches the current season's completed weeks via
  `Promise.allSettled(weeks.map(w => fetchWeekBench(year, w)))`, flattens, and
  takes the max team-week. If all fetches fail or return empty, show a small
  "bench data unavailable" note instead of the card.
- A per-team table for the current season built from `seasonLuck(currentSeason)`:
  columns Team, PF, PA, PF/G, xW (expected wins, 1 decimal), W, Luck (signed, 1
  decimal). Sorted by luck descending.

The current season is `currentSeason()` from `lib/seasons.ts`; its completed
weeks are the distinct `week` values among that season's `completed` matchups.

## Data Flow

```
Stats page (server, force-dynamic)
  ├─ loadAllSeasons()  → existing all-time record cards + longestStreak
  ├─ loadCurrentSeason() → seasonLuck() table
  └─ for each completed week of current season:
        fetchWeekBench(year, week) → benchFromRoster() → bench record
```

All ESPN calls are server-side, cookie-authenticated, cached ~3h, and wrapped
so failures render fallbacks rather than crashing.

## Error Handling

- Streaks/luck reuse the existing all-time and current-season loads; on ESPN
  failure the whole Stats page shows its existing fallback message.
- Bench fetching is independently guarded: `Promise.allSettled` drops failed
  weeks; if nothing usable comes back, the bench card is replaced with a note.
- `seasonLuck` returning `[]` renders the table area empty with a "no games
  yet" line rather than throwing.

## Testing

TDD with fixtures on the three pure functions:
- `lib/stats/streaks.test.ts` — a crafted 2-team, multi-week season with a
  known longest win run and lose run.
- `lib/stats/luck.test.ts` — a small field where expected-wins math is
  hand-verifiable (including a tie week → 0.5).
- `lib/espn/rosters.test.ts` — a `mBoxscore` week fixture with known bench
  totals per team (entries across starter and bench/IR slots); verifies
  `benchFromRoster` sums only slots 20/21.

Fetch wrappers (`fetchWeekBench`) are not unit-tested (network), consistent
with `lib/espn/client.ts`.

## Risks

- **Roster availability for legacy seasons** is irrelevant here since bench is
  current-season only.
- **ESPN `mBoxscore` shape** is undocumented; the fixture encodes our
  assumption (entries with `lineupSlotId` and `playerPoolEntry` applied points).
  If the live shape differs, `benchFromRoster` is the single place to adjust and
  the bench card degrades gracefully in the meantime.
- **Function time:** current-season week fetches run in parallel and are
  cached; worst case ~17 parallel requests on a cache miss, well within limits.

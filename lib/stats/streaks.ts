import type { SeasonData } from "@/lib/espn/types";

export interface Streak {
  teamId: number;
  year: number;
  length: number;
}

type Outcome = { teamId: number; year: number; week: number; result: "W" | "L" | "T" };

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

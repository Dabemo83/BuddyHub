import type { SeasonData, Team } from "@/lib/espn/types";

export interface TeamWeek { teamId: number; week: number; year: number; score: number; won: boolean }

/** Flatten completed matchups into per-team weekly rows. */
export function teamWeeks(seasons: SeasonData[]): TeamWeek[] {
  const rows: TeamWeek[] = [];
  for (const s of seasons) {
    for (const m of s.matchups) {
      if (!m.completed) continue;
      rows.push({ teamId: m.homeTeamId, week: m.week, year: s.year, score: m.homeScore, won: m.homeScore > m.awayScore });
      rows.push({ teamId: m.awayTeamId, week: m.week, year: s.year, score: m.awayScore, won: m.awayScore > m.homeScore });
    }
  }
  return rows;
}

export function standings(season: SeasonData): Team[] {
  return [...season.teams].sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
}

export function highestScoringWeek(seasons: SeasonData[]): TeamWeek {
  const rows = teamWeeks(seasons);
  if (rows.length === 0) throw new Error("No completed matchups");
  return rows.reduce((best, r) => (r.score > best.score ? r : best));
}

export function lowestScoringWeek(seasons: SeasonData[]): TeamWeek {
  const rows = teamWeeks(seasons);
  if (rows.length === 0) throw new Error("No completed matchups");
  return rows.reduce((worst, r) => (r.score < worst.score ? r : worst));
}

export function mostPointsInLoss(seasons: SeasonData[]): TeamWeek {
  const losers = teamWeeks(seasons).filter((r) => !r.won);
  if (losers.length === 0) throw new Error("No completed losses");
  return losers.reduce((best, r) => (r.score > best.score ? r : best));
}

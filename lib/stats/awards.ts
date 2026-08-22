import type { SeasonData } from "@/lib/espn/types";
import { teamWeeks } from "./team-stats";

export interface WeeklyAwards {
  week: number;
  topScorer: { teamId: number; score: number };
  loser: { teamId: number; score: number };
  biggestBlowout: { winnerTeamId: number; loserTeamId: number; margin: number };
}

export function weeklyAwards(season: SeasonData, week: number): WeeklyAwards {
  const rows = teamWeeks([season]).filter((r) => r.week === week);
  if (rows.length === 0) throw new Error(`No completed matchups for week ${week}`);

  const top = rows.reduce((b, r) => (r.score > b.score ? r : b));
  const low = rows.reduce((w, r) => (r.score < w.score ? r : w));

  const games = season.matchups.filter((m) => m.week === week && m.completed);
  const blowout = games
    .map((g) => {
      const margin = Math.abs(g.homeScore - g.awayScore);
      const homeWon = g.homeScore > g.awayScore;
      return {
        winnerTeamId: homeWon ? g.homeTeamId : g.awayTeamId,
        loserTeamId: homeWon ? g.awayTeamId : g.homeTeamId,
        margin,
      };
    })
    .reduce((b, g) => (g.margin > b.margin ? g : b));

  return {
    week,
    topScorer: { teamId: top.teamId, score: top.score },
    loser: { teamId: low.teamId, score: low.score },
    biggestBlowout: blowout,
  };
}

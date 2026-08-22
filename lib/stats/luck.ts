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

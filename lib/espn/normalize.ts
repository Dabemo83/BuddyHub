import type { SeasonData, Team, Matchup } from "./types";

interface RawMember { id: string; firstName?: string; lastName?: string }
interface RawTeam {
  id: number; name?: string; location?: string; nickname?: string;
  owners?: string[];
  record?: { overall?: { wins?: number; losses?: number; ties?: number; pointsFor?: number; pointsAgainst?: number } };
}
interface RawSide { teamId: number; totalPoints?: number }
interface RawGame { matchupPeriodId: number; winner?: string; home?: RawSide; away?: RawSide }
interface RawSeason { seasonId: number; teams?: RawTeam[]; members?: RawMember[]; schedule?: RawGame[] }

function teamName(t: RawTeam): string {
  if (t.name) return t.name;
  return [t.location, t.nickname].filter(Boolean).join(" ").trim() || `Team ${t.id}`;
}

export function normalizeSeason(raw: RawSeason): SeasonData {
  const memberNames = new Map<string, string>();
  for (const m of raw.members ?? []) {
    memberNames.set(m.id, [m.firstName, m.lastName].filter(Boolean).join(" ").trim());
  }

  const teams: Team[] = (raw.teams ?? []).map((t) => {
    const o = t.record?.overall ?? {};
    const ownerId = t.owners?.[0];
    return {
      id: t.id,
      name: teamName(t),
      owner: (ownerId && memberNames.get(ownerId)) || "Unknown",
      wins: o.wins ?? 0,
      losses: o.losses ?? 0,
      ties: o.ties ?? 0,
      pointsFor: o.pointsFor ?? 0,
      pointsAgainst: o.pointsAgainst ?? 0,
    };
  });

  const matchups: Matchup[] = (raw.schedule ?? [])
    .filter((g) => g.home && g.away)
    .map((g) => ({
      week: g.matchupPeriodId,
      homeTeamId: g.home!.teamId,
      awayTeamId: g.away!.teamId,
      homeScore: g.home!.totalPoints ?? 0,
      awayScore: g.away!.totalPoints ?? 0,
      completed: g.winner !== undefined && g.winner !== "UNDECIDED",
    }));

  return { year: raw.seasonId, teams, matchups };
}

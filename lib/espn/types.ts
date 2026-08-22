export interface Team {
  id: number;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Matchup {
  week: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  completed: boolean;
}

export interface SeasonData {
  year: number;
  teams: Team[];
  matchups: Matchup[];
}

import { describe, it, expect } from "vitest";
import type { SeasonData } from "@/lib/espn/types";
import { seasonLuck } from "@/lib/stats/luck";

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
    expect(byId(1).expectedWins).toBeCloseTo(1.0);
    expect(byId(2).expectedWins).toBeCloseTo(2 / 3);
    expect(byId(3).expectedWins).toBeCloseTo(1 / 3);
    expect(byId(4).expectedWins).toBeCloseTo(0);
  });
  it("luck = actual wins minus expected wins", () => {
    expect(byId(3).luck).toBeCloseTo(1 - 1 / 3);
    expect(byId(2).luck).toBeCloseTo(0 - 2 / 3);
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

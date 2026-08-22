import { describe, it, expect } from "vitest";
import type { SeasonData } from "@/lib/espn/types";
import { longestStreak } from "@/lib/stats/streaks";

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
  it("ignores incomplete games", () => {
    expect(longestStreak([season], "win").length).toBe(3);
  });
  it("throws when there are no completed matchups", () => {
    const empty: SeasonData = { year: 2024, teams: [], matchups: [] };
    expect(() => longestStreak([empty], "win")).toThrow();
  });
});

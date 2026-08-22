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
    { week: 5, homeTeamId: 1, awayTeamId: 2, homeScore: 120, awayScore: 90, completed: false },
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
  it("ignores incomplete games (an incomplete win does not extend the streak)", () => {
    // wk5 is team 1 winning but incomplete; the win streak must stay 3, not become 4
    expect(longestStreak([season], "win").length).toBe(3);
  });
  it("throws when there are no completed matchups", () => {
    const empty: SeasonData = { year: 2024, teams: [], matchups: [] };
    expect(() => longestStreak([empty], "win")).toThrow();
  });

  it("continues a streak across season boundaries", () => {
    const s2023: SeasonData = {
      year: 2023,
      teams: [
        { id: 1, name: "One", owner: "A", wins: 2, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 },
        { id: 2, name: "Two", owner: "B", wins: 0, losses: 2, ties: 0, pointsFor: 0, pointsAgainst: 0 },
      ],
      matchups: [
        { week: 13, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
        { week: 14, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
      ],
    };
    const s2024: SeasonData = {
      year: 2024,
      teams: [
        { id: 1, name: "One", owner: "A", wins: 1, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 },
        { id: 2, name: "Two", owner: "B", wins: 0, losses: 1, ties: 0, pointsFor: 0, pointsAgainst: 0 },
      ],
      matchups: [
        { week: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true },
      ],
    };
    const s = longestStreak([s2023, s2024], "win");
    expect(s.teamId).toBe(1);
    expect(s.length).toBe(3); // 2023 wk13, wk14 + 2024 wk1
    expect(s.year).toBe(2024); // streak ended in 2024
  });

  it("a tie breaks a win streak", () => {
    const season: SeasonData = {
      year: 2024,
      teams: [
        { id: 1, name: "One", owner: "A", wins: 2, losses: 0, ties: 1, pointsFor: 0, pointsAgainst: 0 },
        { id: 2, name: "Two", owner: "B", wins: 0, losses: 2, ties: 1, pointsFor: 0, pointsAgainst: 0 },
      ],
      matchups: [
        { week: 1, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true }, // 1 W
        { week: 2, homeTeamId: 1, awayTeamId: 2, homeScore: 95, awayScore: 95, completed: true },  // tie
        { week: 3, homeTeamId: 1, awayTeamId: 2, homeScore: 100, awayScore: 90, completed: true }, // 1 W
      ],
    };
    // team 1: W, T, W -> longest win streak is 1, not 2
    expect(longestStreak([season], "win").length).toBe(1);
  });
});

import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/espn-season.json";
import { normalizeSeason } from "@/lib/espn/normalize";
import { standings, highestScoringWeek, lowestScoringWeek, mostPointsInLoss } from "@/lib/stats/team-stats";

const seasons = [normalizeSeason(fixture as unknown as Parameters<typeof normalizeSeason>[0])];

describe("team stats", () => {
  it("standings sort by wins then pointsFor", () => {
    const table = standings(seasons[0]);
    expect(table.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it("highestScoringWeek finds the single best team-week", () => {
    const hi = highestScoringWeek(seasons);
    expect(hi.score).toBeCloseTo(130.0);
    expect(hi.teamId).toBe(1);
    expect(hi.week).toBe(2);
    expect(hi.year).toBe(2024);
  });

  it("lowestScoringWeek ignores incomplete games", () => {
    const lo = lowestScoringWeek(seasons);
    expect(lo.score).toBeCloseTo(90.0);
  });

  it("mostPointsInLoss finds the highest-scoring loser", () => {
    const m = mostPointsInLoss(seasons);
    expect(m.score).toBeCloseTo(110.0);
    expect(m.teamId).toBe(2);
  });
});

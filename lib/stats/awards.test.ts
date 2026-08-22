import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/espn-season.json";
import { normalizeSeason } from "@/lib/espn/normalize";
import { weeklyAwards } from "@/lib/stats/awards";

const season = normalizeSeason(fixture as unknown as Parameters<typeof normalizeSeason>[0]);

describe("weeklyAwards", () => {
  const awards = weeklyAwards(season, 1);

  it("names the top scorer of the week", () => {
    expect(awards.topScorer.teamId).toBe(1);
    expect(awards.topScorer.score).toBeCloseTo(120.5);
  });

  it("names the loser of the week (lowest score)", () => {
    expect(awards.loser.teamId).toBe(3);
    expect(awards.loser.score).toBeCloseTo(90.0);
  });

  it("finds the biggest blowout margin", () => {
    expect(awards.biggestBlowout.margin).toBeCloseTo(10.5);
  });
});

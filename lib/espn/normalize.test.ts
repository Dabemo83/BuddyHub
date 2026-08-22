import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/espn-season.json";
import { normalizeSeason } from "@/lib/espn/normalize";

describe("normalizeSeason", () => {
  const season = normalizeSeason(fixture as unknown as Parameters<typeof normalizeSeason>[0]);

  it("uses seasonId as the year", () => {
    expect(season.year).toBe(2024);
  });

  it("maps teams with records and resolved owner names", () => {
    const alpha = season.teams.find((t) => t.id === 1)!;
    expect(alpha.name).toBe("Team Alpha");
    expect(alpha.owner).toBe("Al Pha");
    expect(alpha.wins).toBe(2);
    expect(alpha.pointsFor).toBeCloseTo(250.5);
  });

  it("maps completed matchups with home/away scores", () => {
    const wk1 = season.matchups.filter((m) => m.week === 1);
    expect(wk1).toHaveLength(2);
    const first = wk1.find((m) => m.homeTeamId === 1)!;
    expect(first.homeScore).toBeCloseTo(120.5);
    expect(first.awayScore).toBeCloseTo(110.0);
    expect(first.completed).toBe(true);
  });

  it("marks UNDECIDED matchups as not completed", () => {
    const undecided = season.matchups.find((m) => m.week === 2 && m.homeTeamId === 2)!;
    expect(undecided.completed).toBe(false);
  });

  it("defaults missing scores to 0 and treats unknown winner as not completed", () => {
    const wk3 = season.matchups.find((m) => m.week === 3)!;
    expect(wk3.homeScore).toBe(0);
    expect(wk3.awayScore).toBe(0);
    expect(wk3.completed).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/espn-boxscore-week.json";
import { benchFromRoster } from "@/lib/espn/rosters";

describe("benchFromRoster", () => {
  const rows = benchFromRoster(fixture as unknown as Parameters<typeof benchFromRoster>[0]);
  const byId = (id: number) => rows.find((r) => r.teamId === id)!;

  it("sums only bench (20) and IR (21) slots per team", () => {
    expect(byId(1).benchPoints).toBeCloseTo(20.0); // 15.5 + 4.5
    expect(byId(2).benchPoints).toBeCloseTo(30.0);
  });

  it("returns one row per side that has a roster", () => {
    expect(rows).toHaveLength(2);
  });

  it("handles missing schedule/rosters without throwing", () => {
    expect(benchFromRoster({})).toEqual([]);
    expect(benchFromRoster({ schedule: [{ matchupPeriodId: 1 }] })).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { getMembers, getMember } from "@/lib/content/members";
import { getRecaps } from "@/lib/content/recaps";
import { getManualHistory } from "@/lib/content/history";

describe("content loaders", () => {
  it("loads members from JSON", () => {
    const members = getMembers();
    expect(members.some((m) => m.slug === "daniel-morrissey")).toBe(true);
    expect(getMember("daniel-morrissey")?.name).toBe("Daniel Morrissey");
  });

  it("loads and parses recap markdown with front-matter", () => {
    const recaps = getRecaps();
    const wk1 = recaps.find((r) => r.slug === "2024-week-01")!;
    expect(wk1.title).toBe("Week 1: First Blood");
    expect(wk1.year).toBe(2024);
    expect(wk1.week).toBe(1);
    expect(wk1.body).toContain("fireworks");
  });

  it("sorts recaps newest first", () => {
    const recaps = getRecaps();
    for (let i = 1; i < recaps.length; i++) {
      const a = recaps[i - 1], b = recaps[i];
      expect(a.year * 100 + a.week).toBeGreaterThanOrEqual(b.year * 100 + b.week);
    }
  });

  it("loads manual history seasons", () => {
    const seasons = getManualHistory();
    expect(seasons.find((s) => s.year === 2015)?.champion).toBe("Team Bravo");
  });
});

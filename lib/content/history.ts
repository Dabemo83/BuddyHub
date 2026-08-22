import fs from "node:fs";
import path from "node:path";

export interface ManualSeason {
  year: number; champion: string; runnerUp?: string; notes?: string; finalStandings?: string[];
}

const DIR = path.join(process.cwd(), "content", "history");

export function getManualHistory(): ManualSeason[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as ManualSeason)
    .sort((a, b) => b.year - a.year);
}

import fs from "node:fs";
import path from "node:path";

export interface Member {
  slug: string; name: string; photo?: string; espnTeamName?: string;
  bio?: string; funFacts?: string[]; birthday?: string;
}

const DIR = path.join(process.cwd(), "content", "members");

export function getMembers(): Member[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Member;
      return { ...data, slug: f.replace(/\.json$/, "") };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getMember(slug: string): Member | undefined {
  return getMembers().find((m) => m.slug === slug);
}

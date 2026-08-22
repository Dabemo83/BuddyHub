import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface Recap {
  slug: string; year: number; week: number; title: string; date: string; body: string;
}

const DIR = path.join(process.cwd(), "content", "recaps");

export function getRecaps(): Recap[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const parsed = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
      const d = parsed.data as { year: number; week: number; title: string; date: string };
      return { slug: f.replace(/\.md$/, ""), body: parsed.content.trim(), ...d, date: String(d.date) };
    })
    .sort((a, b) => b.year * 100 + b.week - (a.year * 100 + a.week));
}

export function getRecap(slug: string): Recap | undefined {
  return getRecaps().find((r) => r.slug === slug);
}

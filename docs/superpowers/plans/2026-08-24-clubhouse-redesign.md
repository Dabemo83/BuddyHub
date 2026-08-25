# Throwback Clubhouse Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle BuddyHub into the "Throwback Clubhouse" look (cream paper, forest-green panels, brass accent, Oswald + Bitter fonts, trading-card members, bento stats, accessible motion) without changing any routes, data, or logic.

**Architecture:** A theme layer (Tailwind v4 `@theme` tokens + `next/font` + a grain overlay in the root layout) drives everything. All pages already render through shared components, so restyling those components plus three new primitives (`SectionHeading`, `TradingCard`, `Reveal`) cascades the new look site-wide. Presentation only — `lib/**`, `proxy.ts`, and content files are untouched.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, `next/font/google` (Oswald, Bitter). No new runtime dependencies (motion uses IntersectionObserver).

**Verification note:** This is a styling change, so tasks verify with `npm run build` (must succeed, same route list) and `npm test` (existing 34 tests must stay green — they cover logic, not styles). No new unit tests. Do a visual check where noted.

---

## File Structure

```
app/globals.css              → MODIFY: @theme tokens, base body, reveal + noscript rules
app/layout.tsx               → MODIFY: load Oswald+Bitter, apply font vars, grain overlay, footer
app/components/Reveal.tsx     → NEW: client scroll-reveal wrapper (reduced-motion safe)
app/components/SectionHeading.tsx → NEW: brass-ruled Oswald heading
app/components/TradingCard.tsx    → NEW: large member trading card
app/components/Nav.tsx        → MODIFY: clubhouse nav
app/components/StatCard.tsx   → MODIFY: add variant "paper" | "feature"
app/components/MemberCard.tsx → MODIFY: compact trading card (monogram, number)
app/components/StandingsTable.tsx → MODIFY: clubhouse table
app/components/LuckTable.tsx  → MODIFY: clubhouse table
app/page.tsx                 → MODIFY: Home (hero, snapshot, recap, crew strip)
app/standings/page.tsx       → MODIFY: SectionHeading
app/stats/page.tsx           → MODIFY: bento grid + feature StatCard
app/history/page.tsx         → MODIFY: Roll of Honor ledger
app/recaps/page.tsx          → MODIFY: program entries
app/recaps/[slug]/page.tsx   → MODIFY: award chips
app/members/page.tsx         → MODIFY: trading-card grid
app/members/[slug]/page.tsx  → MODIFY: TradingCard detail
app/login/page.tsx           → MODIFY: clubhouse door
```

---

## Task 1: Theme foundation (fonts, tokens, grain, footer)

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

Keep Tailwind's import; add the theme tokens, base styles, reveal defaults, and a no-JS safeguard.

```css
@import "tailwindcss";

@theme {
  --color-paper: #f4ecd8;
  --color-paper-2: #efe6cf;
  --color-forest: #1f3a2e;
  --color-forest-2: #274a3a;
  --color-brass: #b0864a;
  --color-brass-bright: #c99a52;
  --color-ink: #241d15;
  --color-cream: #f3ead3;
  --color-muted: #6f6552;

  --font-display: var(--font-oswald), "Arial Narrow", sans-serif;
  --font-body: var(--font-bitter), Georgia, serif;
}

body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
}

/* Fixed paper-grain overlay lives in layout; this styles it. */
.grain {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  opacity: 0.5;
  background-image: radial-gradient(rgba(120, 90, 40, 0.06) 1px, transparent 1px);
  background-size: 4px 4px;
}

/* Reveal wrapper: hidden→shown; reduced motion and no-JS force visible. */
[data-reveal] {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal][data-shown="true"] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Add the no-JS safeguard + fonts + grain + footer to `app/layout.tsx`**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Oswald, Bitter } from "next/font/google";
import Nav from "./components/Nav";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});
const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-bitter",
});

export const metadata: Metadata = {
  title: "BuddyHub",
  description: "Our league, our crew — since 2012.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${bitter.variable}`}>
      <head>
        {/* No-JS safeguard: reveal wrappers must show content without JS. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-5xl mx-auto px-4 py-10 mt-10 border-t border-forest/20 text-sm text-muted font-[family-name:var(--font-display)] uppercase tracking-[0.15em]">
          🏈 BuddyHub · Est. 2012
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds. Then `npm test` → 34 pass (unchanged).

Note: the utility `font-[family-name:var(--font-display)]` is Tailwind v4's arbitrary font-family syntax. If the build flags it, use inline `style={{ fontFamily: "var(--font-display)" }}` instead.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): clubhouse theme foundation — fonts, tokens, grain, footer"
```

---

## Task 2: Reveal + SectionHeading primitives

**Files:**
- Create: `app/components/Reveal.tsx`, `app/components/SectionHeading.tsx`

- [ ] **Step 1: Create `app/components/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal data-shown={shown} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `app/components/SectionHeading.tsx`**

```tsx
export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-[family-name:var(--font-display)] uppercase tracking-[0.05em] text-2xl font-600 text-forest border-l-4 border-brass pl-3 mb-4"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </h2>
  );
}
```

Note: `font-600` isn't a default Tailwind class — use `font-semibold` (600). Corrected class list: `uppercase tracking-[0.05em] text-2xl font-semibold text-forest border-l-4 border-brass pl-3 mb-4` with the inline `fontFamily`.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds. (Components aren't imported yet; build just type-checks them.)

- [ ] **Step 4: Commit**

```bash
git add app/components/Reveal.tsx app/components/SectionHeading.tsx
git commit -m "feat(design): add Reveal and SectionHeading primitives"
```

---

## Task 3: Nav restyle

**Files:**
- Modify: `app/components/Nav.tsx`

- [ ] **Step 1: Replace `app/components/Nav.tsx`**

```tsx
import Link from "next/link";

const LINKS = [
  { href: "/standings", label: "Standings" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/recaps", label: "Recaps" },
  { href: "/members", label: "Members" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b-2 border-forest">
      <nav
        className="max-w-5xl mx-auto flex items-center gap-6 px-4 h-14 uppercase tracking-[0.08em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <Link href="/" className="font-bold text-forest text-lg tracking-[0.04em]">
          🏈 BuddyHub
        </Link>
        <div className="flex gap-4 text-xs font-medium">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink/80 hover:text-forest border-b-2 border-transparent hover:border-brass pb-0.5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/components/Nav.tsx
git commit -m "feat(design): clubhouse nav"
```

---

## Task 4: StatCard restyle (with variant)

**Files:**
- Modify: `app/components/StatCard.tsx`

- [ ] **Step 1: Replace `app/components/StatCard.tsx`**

Backwards compatible: existing callers pass no `variant` → `"paper"`. The Stats feature tile passes `variant="feature"`.

```tsx
export default function StatCard({
  emoji,
  label,
  value,
  sub,
  variant = "paper",
}: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  variant?: "paper" | "feature";
}) {
  const feature = variant === "feature";
  return (
    <div
      className={
        feature
          ? "rounded-xl p-5 bg-forest text-cream border border-brass/60"
          : "rounded-xl p-4 bg-paper-2 border border-brass/40"
      }
    >
      <div className="text-2xl">{emoji}</div>
      <div
        className={`text-[10px] uppercase tracking-[0.16em] mt-1 ${feature ? "text-brass-bright" : "text-brass"}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </div>
      <div
        className={`font-bold ${feature ? "text-3xl" : "text-2xl"} ${feature ? "text-cream" : "text-ink"}`}
        style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      {sub && (
        <div className={`text-sm mt-0.5 ${feature ? "text-cream/80" : "text-muted"}`}>{sub}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds (Stats/recap pages still pass only emoji/label/value/sub — valid).

- [ ] **Step 3: Commit**

```bash
git add app/components/StatCard.tsx
git commit -m "feat(design): clubhouse StatCard with feature variant"
```

---

## Task 5: MemberCard (trading card) + TradingCard

**Files:**
- Modify: `app/components/MemberCard.tsx`
- Create: `app/components/TradingCard.tsx`

Shared helper: monogram = first letters of the first two words of the name.

- [ ] **Step 1: Replace `app/components/MemberCard.tsx`**

```tsx
import Link from "next/link";
import type { Member } from "@/lib/content/members";

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function MemberCard({ member, index }: { member: Member; index?: number }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="relative block rounded-xl p-4 bg-forest text-cream border-2 border-brass shadow-[4px_4px_0_var(--color-brass)] hover:-translate-y-0.5 hover:shadow-[5px_6px_0_var(--color-brass)] active:translate-y-0 transition-all"
    >
      {typeof index === "number" && (
        <span
          className="absolute top-2 right-3 text-2xl font-bold text-brass-bright/90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span
        className="flex items-center justify-center w-11 h-11 rounded-full bg-brass text-forest text-lg font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {monogram(member.name)}
      </span>
      <div
        className="mt-2 uppercase font-semibold text-base tracking-[0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {member.name}
      </div>
      {member.espnTeamName && <div className="text-sm italic text-brass-bright">{member.espnTeamName}</div>}
      <div
        className="mt-2 text-[9px] uppercase tracking-[0.15em] text-cream/70"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Manager since 2012
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `app/components/TradingCard.tsx`**

```tsx
import type { Member } from "@/lib/content/members";

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function TradingCard({ member, index }: { member: Member; index?: number }) {
  return (
    <div className="relative max-w-md rounded-2xl p-6 bg-forest text-cream border-2 border-brass shadow-[6px_6px_0_var(--color-brass)]">
      {typeof index === "number" && (
        <span
          className="absolute top-4 right-5 text-4xl font-bold text-brass-bright/90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span
        className="flex items-center justify-center w-16 h-16 rounded-full bg-brass text-forest text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {monogram(member.name)}
      </span>
      <h1
        className="mt-4 uppercase font-bold text-2xl tracking-[0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {member.name}
      </h1>
      {member.espnTeamName && <div className="text-lg italic text-brass-bright">{member.espnTeamName}</div>}
      <div
        className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream/70"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Manager since 2012
      </div>

      {member.bio && <p className="mt-4 text-cream/90">{member.bio}</p>}

      {member.funFacts && member.funFacts.length > 0 && (
        <div className="mt-4">
          <div
            className="text-[10px] uppercase tracking-[0.16em] text-brass-bright"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fun facts
          </div>
          <ul className="list-disc list-inside text-cream/90 mt-1">
            {member.funFacts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {member.birthday && <div className="mt-4 text-sm text-cream/70">🎂 {member.birthday}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/components/MemberCard.tsx app/components/TradingCard.tsx
git commit -m "feat(design): trading-card member components"
```

---

## Task 6: StandingsTable + LuckTable restyle

**Files:**
- Modify: `app/components/StandingsTable.tsx`, `app/components/LuckTable.tsx`

- [ ] **Step 1: Replace `app/components/StandingsTable.tsx`**

```tsx
import type { Team } from "@/lib/espn/types";

export default function StandingsTable({ teams }: { teams: Team[] }) {
  return (
    <table className="w-full text-sm bg-paper-2 rounded-xl overflow-hidden border border-brass/40">
      <thead
        className="text-left bg-forest text-cream uppercase tracking-[0.08em] text-xs"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tr>
          <th scope="col" className="py-2 px-3">#</th>
          <th scope="col" className="px-2">Team</th>
          <th scope="col" className="px-2">Owner</th>
          <th scope="col" className="px-2 text-right">W</th>
          <th scope="col" className="px-2 text-right">L</th>
          <th scope="col" className="px-2 text-right">PF</th>
          <th scope="col" className="px-2 text-right">PA</th>
        </tr>
      </thead>
      <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
        {teams.map((t, i) => (
          <tr key={t.id} className={i % 2 ? "bg-paper/40" : ""}>
            <td className="py-2 px-3 text-muted">{i + 1}</td>
            <td className="px-2 font-medium">{t.name}</td>
            <td className="px-2 text-muted">{t.owner}</td>
            <td className="px-2 text-right">{t.wins}</td>
            <td className="px-2 text-right">{t.losses}</td>
            <td className="px-2 text-right">{t.pointsFor.toFixed(1)}</td>
            <td className="px-2 text-right">{t.pointsAgainst.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Replace `app/components/LuckTable.tsx`**

Keep the same props (`rows: (TeamLuck & { name: string })[]`).

```tsx
import type { TeamLuck } from "@/lib/stats/luck";

export default function LuckTable({ rows }: { rows: (TeamLuck & { name: string })[] }) {
  return (
    <table className="w-full text-sm bg-paper-2 rounded-xl overflow-hidden border border-brass/40">
      <thead
        className="text-left bg-forest text-cream uppercase tracking-[0.08em] text-xs"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tr>
          <th scope="col" className="py-2 px-3">Team</th>
          <th scope="col" className="px-2 text-right">PF</th>
          <th scope="col" className="px-2 text-right">PA</th>
          <th scope="col" className="px-2 text-right">PF/G</th>
          <th scope="col" className="px-2 text-right">xW</th>
          <th scope="col" className="px-2 text-right">W</th>
          <th scope="col" className="px-2 text-right">Luck</th>
        </tr>
      </thead>
      <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
        {rows.map((r, i) => (
          <tr key={r.teamId} className={i % 2 ? "bg-paper/40" : ""}>
            <td className="py-2 px-3 font-medium">{r.name}</td>
            <td className="px-2 text-right">{r.pf.toFixed(1)}</td>
            <td className="px-2 text-right">{r.pa.toFixed(1)}</td>
            <td className="px-2 text-right">{r.gamesPlayed ? (r.pf / r.gamesPlayed).toFixed(1) : "—"}</td>
            <td className="px-2 text-right">{r.expectedWins.toFixed(1)}</td>
            <td className="px-2 text-right">{r.actualWins}</td>
            <td className={`px-2 text-right font-semibold ${r.luck >= 0 ? "text-forest" : "text-[#a3401f]"}`}>
              {r.luck >= 0 ? "+" : ""}
              {r.luck.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/components/StandingsTable.tsx app/components/LuckTable.tsx
git commit -m "feat(design): clubhouse standings and luck tables"
```

---

## Task 7: Home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from "next/link";
import { loadCurrentSeason } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";
import { getRecaps } from "@/lib/content/recaps";
import { getMembers } from "@/lib/content/members";
import MemberCard from "@/app/components/MemberCard";
import SectionHeading from "@/app/components/SectionHeading";
import Reveal from "@/app/components/Reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  let top3: { id: number; name: string; wins: number; losses: number }[] = [];
  let seasonLabel = "Season";
  try {
    const season = await loadCurrentSeason();
    seasonLabel = `${season.year} Season · Week ${Math.max(1, ...season.matchups.filter((m) => m.completed).map((m) => m.week), 0) || 1}`;
    top3 = standings(season)
      .slice(0, 3)
      .map((t) => ({ id: t.id, name: t.name, wins: t.wins, losses: t.losses }));
  } catch {
    seasonLabel = "Season";
  }

  const latest = getRecaps()[0];
  const members = getMembers();

  return (
    <div className="space-y-12">
      <section className="relative rounded-2xl p-8 sm:p-10 bg-forest text-cream border border-forest-2 shadow-[0_10px_30px_rgba(31,58,46,0.25)] overflow-hidden">
        <div className="absolute inset-2 rounded-xl border border-brass/55 pointer-events-none" />
        <div
          className="text-xs uppercase tracking-[0.22em] text-brass-bright"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Est. 2012 · Fantasy Football
        </div>
        <h1
          className="mt-2 uppercase font-bold text-5xl sm:text-6xl leading-[0.95]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sunday
          <br />
          Clubhouse
        </h1>
        <div
          className="mt-4 uppercase tracking-[0.2em] text-sm text-brass-bright"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {seasonLabel}
        </div>
      </section>

      <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <SectionHeading>Standings</SectionHeading>
          {top3.length > 0 ? (
            <ol className="rounded-xl bg-paper-2 border border-brass/40 overflow-hidden">
              {top3.map((t, i) => (
                <li
                  key={t.id}
                  className="flex justify-between px-4 py-2.5 border-b border-brass/15 last:border-0"
                >
                  <span style={{ fontFamily: "var(--font-display)" }} className="uppercase text-sm tracking-[0.02em]">
                    {i + 1}. {t.name}
                  </span>
                  <span className="text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {t.wins}-{t.losses}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted">Standings unavailable right now.</p>
          )}
          <Link
            href="/standings"
            className="inline-block mt-2 text-sm uppercase tracking-[0.12em] text-brass"
            style={{ fontFamily: "var(--font-display)" }}
          >
            See full standings →
          </Link>
        </section>

        <section>
          <SectionHeading>Latest Recap</SectionHeading>
          {latest ? (
            <Link
              href={`/recaps/${latest.slug}`}
              className="block rounded-xl bg-paper-2 border border-brass/40 p-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {latest.title}
              </div>
              <div className="text-xs text-muted">{latest.date}</div>
            </Link>
          ) : (
            <p className="text-muted">No recaps yet.</p>
          )}
        </section>
      </Reveal>

      <Reveal>
        <SectionHeading>The Crew</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {members.slice(0, 8).map((m, i) => (
            <MemberCard key={m.slug} member={m} index={i} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
```

Note on `seasonLabel`: the `Math.max(...)` spread over completed weeks defaults to `1` when empty (the `|| 1` guard). This avoids `-Infinity`. If it reads awkwardly, replace the whole expression with `` `${season.year} Season` `` — the week number is a nicety, not required.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds; `/` dynamic. Then `npm test` → 34 pass.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(design): clubhouse home page"
```

---

## Task 8: Standings + Stats pages

**Files:**
- Modify: `app/standings/page.tsx`, `app/stats/page.tsx`

- [ ] **Step 1: Replace `app/standings/page.tsx`**

```tsx
import StandingsTable from "@/app/components/StandingsTable";
import SectionHeading from "@/app/components/SectionHeading";
import { loadCurrentSeason } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  try {
    const season = await loadCurrentSeason();
    const table = standings(season);
    return (
      <div>
        <SectionHeading>{season.year} Standings</SectionHeading>
        <StandingsTable teams={table} />
      </div>
    );
  } catch {
    return (
      <div>
        <SectionHeading>Standings</SectionHeading>
        <p className="text-[#a3401f]">
          Couldn&apos;t reach ESPN right now. The league cookies may have expired — refresh
          <code className="mx-1">ESPN_S2</code>/<code className="mx-1">ESPN_SWID</code> in Vercel.
        </p>
      </div>
    );
  }
}
```

- [ ] **Step 2: Update `app/stats/page.tsx`** — only the JSX return changes (keep all the data logic exactly as-is). Replace the `return (...)` blocks so the all-time records use a bento grid with a `feature` StatCard, and headings use `SectionHeading`. Add these imports at the top:

```tsx
import SectionHeading from "@/app/components/SectionHeading";
```

Then replace the SUCCESS `return (...)` (the one rendering the cards + luck table) with:

```tsx
  return (
    <div className="space-y-10">
      <div>
        <SectionHeading>Stats — All-Time</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
            <StatCard
              variant="feature"
              emoji="🔥"
              label="Highest week ever"
              value={hi.score.toFixed(1)}
              sub={`${nameFor(hi.year, hi.teamId)} · ${hi.year} Wk ${hi.week}`}
            />
          </div>
          <StatCard emoji="🥶" label="Lowest week ever" value={lo.score.toFixed(1)}
            sub={`${nameFor(lo.year, lo.teamId)} · ${lo.year} Wk ${lo.week}`} />
          <StatCard emoji="💔" label="Most points in a loss" value={mpl.score.toFixed(1)}
            sub={`${nameFor(mpl.year, mpl.teamId)} · ${mpl.year} Wk ${mpl.week}`} />
          <StatCard emoji="📈" label="Longest win streak" value={`${winStreak.length} games`}
            sub={`${nameFor(winStreak.year, winStreak.teamId)} · ${winStreak.year}`} />
          <StatCard emoji="📉" label="Longest lose streak" value={`${loseStreak.length} games`}
            sub={`${nameFor(loseStreak.year, loseStreak.teamId)} · ${loseStreak.year}`} />
          {bench && (
            <StatCard emoji="🪑" label="Most points on the bench" value={bench.benchPoints.toFixed(1)}
              sub={`${nameFor(current!.year, bench.teamId)} · ${current!.year} Wk ${bench.week}`} />
          )}
        </div>
        {current && !bench && (
          <p className="text-sm text-muted mt-3">Bench data unavailable right now.</p>
        )}
      </div>

      <div>
        <SectionHeading>{current ? `${current.year} Luck & Scoring` : "Luck & Scoring"}</SectionHeading>
        {luckRows.length > 0 ? (
          <LuckTable rows={luckRows} />
        ) : (
          <p className="text-muted text-sm">No games played yet this season.</p>
        )}
        <p className="text-xs text-muted mt-3">
          xW = expected wins (all-play). Luck = actual wins minus expected wins. Player-level stats coming soon.
        </p>
      </div>
    </div>
  );
```

And replace the two ERROR/empty fallback `return (...)` blocks' wrappers to use `SectionHeading` and `text-[#a3401f]` instead of `text-red-400` (keep the messages). For the catch block:

```tsx
    return (
      <div>
        <SectionHeading>Stats</SectionHeading>
        <p className="text-[#a3401f]">Couldn&apos;t load stats — check the ESPN connection (cookies may have expired).</p>
      </div>
    );
```

Leave every non-JSX line (imports of StatCard/LuckTable/seasons/stat functions, `benchRecordForSeason`, all the `const hi/lo/mpl/winStreak/loseStreak/current/luckRows/bench` computations, the try/catch structure) exactly as it is.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds; `/standings` and `/stats` dynamic. `npm test` → 34 pass.

- [ ] **Step 4: Commit**

```bash
git add app/standings/page.tsx app/stats/page.tsx
git commit -m "feat(design): clubhouse standings + bento stats"
```

---

## Task 9: History + Recaps pages

**Files:**
- Modify: `app/history/page.tsx`, `app/recaps/page.tsx`, `app/recaps/[slug]/page.tsx`

- [ ] **Step 1: Replace `app/history/page.tsx`** (keep the data logic; restyle to a Roll of Honor ledger)

```tsx
import { loadAllSeasons } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";
import { getManualHistory } from "@/lib/content/history";
import SectionHeading from "@/app/components/SectionHeading";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let auto: { year: number; champion: string; source: "ESPN" }[] = [];
  try {
    const seasons = await loadAllSeasons();
    auto = seasons.map((s) => ({ year: s.year, champion: standings(s)[0]?.name ?? "—", source: "ESPN" as const }));
  } catch {
    auto = [];
  }

  const manual = getManualHistory().map((m) => ({ year: m.year, champion: m.champion, source: "Manual" as const }));
  const manualYears = new Set(manual.map((m) => m.year));
  const all = [...auto.filter((a) => !manualYears.has(a.year)), ...manual].sort((a, b) => b.year - a.year);

  return (
    <div>
      <SectionHeading>Roll of Honor</SectionHeading>
      <p className="text-sm text-muted mb-4">
        &quot;Champion&quot; here is the regular-season points leader. Update to playoff winners via manual history if desired.
      </p>
      <ul className="rounded-xl bg-paper-2 border border-brass/40 overflow-hidden">
        {all.map((r) => (
          <li
            key={`${r.year}-${r.source}`}
            className="flex items-center justify-between px-4 py-3 border-b border-brass/15 last:border-0"
          >
            <span className="text-brass text-lg font-bold w-16" style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}>
              {r.year}
            </span>
            <span className="flex-1 uppercase tracking-[0.02em]" style={{ fontFamily: "var(--font-display)" }}>
              🏆 {r.champion}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.14em] text-cream bg-forest rounded px-2 py-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {r.source}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/recaps/page.tsx`**

```tsx
import Link from "next/link";
import { getRecaps } from "@/lib/content/recaps";
import SectionHeading from "@/app/components/SectionHeading";

export default function RecapsPage() {
  const recaps = getRecaps();
  return (
    <div>
      <SectionHeading>Weekly Recaps</SectionHeading>
      {recaps.length === 0 && <p className="text-muted">No recaps yet.</p>}
      {recaps.length > 0 && (
        <ul className="space-y-3">
          {recaps.map((r) => (
            <li key={r.slug} className="rounded-xl bg-paper-2 border border-brass/40 p-4 hover:-translate-y-0.5 transition-transform">
              <Link
                href={`/recaps/${r.slug}`}
                className="font-semibold text-forest hover:text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {r.title}
              </Link>
              <div className="text-xs text-muted">{r.date}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update `app/recaps/[slug]/page.tsx`** — keep ALL logic (generateStaticParams, force-dynamic, params await, getRecap/notFound, the try/catch fetching `weeklyAwards`, the `console.error`). Only change the award block styling and the title/body wrappers. Replace the `awardsBlock` success JSX and the final `return (...)` with:

```tsx
    awardsBlock = (
      <div className="flex flex-wrap gap-2 my-6">
        <span className="rounded-full bg-forest text-cream text-sm px-4 py-1.5 border border-brass/60">
          🏆 <b style={{ fontFamily: "var(--font-display)" }}>{nameFor(a.topScorer.teamId)}</b> · {a.topScorer.score.toFixed(1)} pts
        </span>
        <span className="rounded-full bg-forest text-cream text-sm px-4 py-1.5 border border-brass/60">
          💥 <b style={{ fontFamily: "var(--font-display)" }}>{nameFor(a.biggestBlowout.winnerTeamId)}</b> by {a.biggestBlowout.margin.toFixed(1)}
        </span>
        <span className="rounded-full bg-forest text-cream text-sm px-4 py-1.5 border border-brass/60">
          😬 <b style={{ fontFamily: "var(--font-display)" }}>{nameFor(a.loser.teamId)}</b> · {a.loser.score.toFixed(1)} pts
        </span>
      </div>
    );
```

and the catch fallback:

```tsx
    awardsBlock = <p className="text-sm text-muted my-6">Awards unavailable (ESPN data not reachable for this week).</p>;
```

and the final return:

```tsx
  return (
    <article className="max-w-none">
      <h1 className="text-3xl font-bold text-forest uppercase" style={{ fontFamily: "var(--font-display)" }}>
        {recap.title}
      </h1>
      <div className="text-xs text-muted">{recap.date}</div>
      {awardsBlock}
      <p className="whitespace-pre-wrap leading-relaxed">{recap.body}</p>
    </article>
  );
```

Keep the `StatCard` import removal optional — if `StatCard` is no longer used in this file after the change, remove its import to satisfy eslint (`import StatCard from "@/app/components/StatCard";`).

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds. `npm test` → 34 pass.

- [ ] **Step 5: Commit**

```bash
git add app/history/page.tsx app/recaps/page.tsx "app/recaps/[slug]/page.tsx"
git commit -m "feat(design): clubhouse history ledger and recaps"
```

---

## Task 10: Members + Login pages

**Files:**
- Modify: `app/members/page.tsx`, `app/members/[slug]/page.tsx`, `app/login/page.tsx`

- [ ] **Step 1: Replace `app/members/page.tsx`**

```tsx
import MemberCard from "@/app/components/MemberCard";
import SectionHeading from "@/app/components/SectionHeading";
import { getMembers } from "@/lib/content/members";

export default function MembersPage() {
  const members = getMembers();
  return (
    <div>
      <SectionHeading>The Crew</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <MemberCard key={m.slug} member={m} index={i} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/members/[slug]/page.tsx`** (keep generateStaticParams + params await + notFound)

```tsx
import { notFound } from "next/navigation";
import { getMember, getMembers } from "@/lib/content/members";
import TradingCard from "@/app/components/TradingCard";

export function generateStaticParams() {
  return getMembers().map((m) => ({ slug: m.slug }));
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const members = getMembers();
  const index = members.findIndex((m) => m.slug === slug);
  const member = index >= 0 ? members[index] : getMember(slug);
  if (!member) notFound();

  return <TradingCard member={member} index={index >= 0 ? index : undefined} />;
}
```

- [ ] **Step 3: Replace `app/login/page.tsx`** (same form/POST behavior, clubhouse styling)

```tsx
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-paper p-6">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm bg-forest text-cream rounded-2xl p-8 border-2 border-brass shadow-[6px_6px_0_var(--color-brass)] space-y-4"
      >
        <h1 className="text-2xl font-bold text-center uppercase" style={{ fontFamily: "var(--font-display)" }}>
          🏈 BuddyHub
        </h1>
        <p className="text-sm text-cream/70 text-center">Enter the crew password to continue.</p>
        {error && <p className="text-sm text-[#e8b06a] text-center">Wrong password — try again.</p>}
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg bg-cream/10 border border-brass/40 px-4 py-2 text-cream placeholder-cream/40 outline-none focus:ring-2 focus:ring-brass"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brass hover:bg-brass-bright text-forest font-semibold py-2 uppercase tracking-[0.08em] transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Enter
        </button>
      </form>
    </main>
  );
}
```

Note: the login page renders its own full-screen `<main>` inside the root layout's `<main>` (pre-existing nesting, acceptable). The grain overlay and Nav still render above it — that's fine for the gate.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds; members pages SSG, login renders. `npm test` → 34 pass.

- [ ] **Step 5: Commit**

```bash
git add app/members/page.tsx "app/members/[slug]/page.tsx" app/login/page.tsx
git commit -m "feat(design): clubhouse members and login"
```

---

## Task 11: Final verification

- [ ] **Step 1: Full build + tests**

Run: `npm run build` → succeeds, route list unchanged (Home/Standings/Stats/History/Recaps dynamic; Members SSG; Proxy present).
Run: `npm test` → 34 pass.
Run: `npx tsc --noEmit` → clean.

- [ ] **Step 2: Visual check (manual)**

Set `SITE_PASSWORD`, `ESPN_LEAGUE_ID`, `ESPN_S2`, `ESPN_SWID` in `.env.local`, run `npm run dev`, and confirm at desktop + mobile widths: login gate, hero, standings, stats bento, history ledger, recaps, member trading cards. Confirm `prefers-reduced-motion` disables reveals (macOS: System Settings → Accessibility → Display → Reduce motion).

- [ ] **Step 3: Commit any tweaks and finish**

The finishing-a-development-branch skill handles merge/push.

---

## Self-Review Notes

- **Spec coverage:** theme tokens + fonts + grain + footer (T1); Reveal + SectionHeading (T2); Nav (T3); StatCard variant (T4); MemberCard trading card + TradingCard (T5); StandingsTable + LuckTable (T6); Home hero/snapshot/recap/crew (T7); Standings + Stats bento (T8); History Roll of Honor + Recaps program entries + award chips (T9); Members grid/detail + Login (T10); accessible motion via `[data-reveal]` CSS + Reveal + reduced-motion + noscript (T1/T2); palette contrast handled (forest/cream, ink/paper, brass-bright on dark, dark red `#a3401f` for negative). All spec sections map to a task.
- **Non-goals respected:** no edits to `lib/**`, `proxy.ts`, `lib/auth.ts`, or content files; Stats/Recaps/History/Members data logic preserved verbatim, only JSX/styles changed.
- **Type/interface consistency:** `StatCard` gains optional `variant` (default keeps old callers valid); `MemberCard`/`TradingCard` gain optional `index`; `LuckTable`/`StandingsTable` props unchanged; `SectionHeading`/`Reveal` used consistently. Tailwind color utilities (`bg-forest`, `text-brass`, etc.) all derive from the `@theme` tokens defined in T1, so they exist before any component uses them.
- **No placeholders:** every step has complete code; the two known Tailwind-v4 wrinkles (arbitrary font-family utility; `font-600` → `font-semibold`) are called out with the correct form.

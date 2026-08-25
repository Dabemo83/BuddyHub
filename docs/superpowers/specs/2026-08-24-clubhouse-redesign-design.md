# BuddyHub "Throwback Clubhouse" Redesign — Design Spec

**Date:** 2026-08-24
**Repo:** https://github.com/Dabemo83/BuddyHub
**Status:** Design approved, pending spec review
**Builds on:** the shipped BuddyHub v1 + stats fast-follow

## Overview

A full visual redesign of BuddyHub into a "Throwback Clubhouse" aesthetic: a
warm vintage sports-program / clubhouse look built on a cream paper base, deep
forest-green surfaces, and a single brass-gold accent. This is a presentation-
only change — routes, data flow, ESPN fetching, stats logic, auth, and content
files are untouched. The redesign cascades through the existing shared
components plus a small theme layer and a few new primitives.

## Goals

- Replace the plain dark-slate theme with a cohesive, characterful vintage
  clubhouse visual system.
- Introduce signature moments: trading-card member profiles, a program-cover
  hero, a bento stats grid, a "Roll of Honor" history ledger.
- Add tasteful, accessible motion (scroll reveals, hover lifts).
- Keep everything free, fast, and structurally identical to today.

## Non-Goals

- No changes to data fetching (`lib/espn/*`), stats logic (`lib/stats/*`),
  content loaders (`lib/content/*`), auth (`proxy.ts`, `lib/auth.ts`), or the
  content files themselves.
- No new routes or pages. No framework/library migrations.
- No real photography (members use monograms; no image pipeline).

## Visual System

### Palette (CSS variables, defined once)
- `--paper` #f4ecd8 (page background), `--paper-2` #efe6cf (secondary surface)
- `--forest` #1f3a2e (primary panel/card surface), `--forest-2` #274a3a (raised)
- `--brass` #b0864a, `--brass-bright` #c99a52 (single accent)
- `--ink` #241d15 (text on paper), `--cream` #f3ead3 (text on forest)
- `--muted` #6f6552 (secondary text on paper)

**Palette justification:** the taste playbooks discourage a default beige+brass
reach, but this is an explicitly vintage brief chosen by the user, and the
dominant surface is forest green (not mono-beige), which differentiates it. The
warmth is intentional identity, not a default.

### Typography (self-hosted via `next/font/google`)
- **Display / headings / team names / nav / big numbers:** `Oswald`
  (condensed athletic), weights 500–700, uppercase for labels and titles.
- **Body / prose:** `Bitter` (warm slab serif), weights 400–600 + italic.
- Numbers use `font-variant-numeric: tabular-nums`.

### Surface & shape language
- One radius scale (cards ~14px, hero ~18px, pills full).
- Cards: forest-green fill, brass hairline border, offset brass shadow
  (`4px 4px 0 var(--brass)`) for the "trading card" feel; white/cream data
  panels use a thin forest hairline.
- Brass rule lines under section headings; hero has an inset brass frame.
- Fixed, `pointer-events-none` paper-grain overlay (subtle radial-dot texture).

### Motion (accessible, GPU-safe)
- Scroll-reveal fade-up on sections/cards via a small client `Reveal` wrapper
  (IntersectionObserver or Motion `whileInView`), `transform`/`opacity` only.
- Hover: card lift / shadow shift; `:active` press (`scale(0.98)`).
- All motion gated behind `prefers-reduced-motion: reduce` (no motion then).

## Components

Restyle existing (public interfaces unchanged):
- `app/components/Nav.tsx` — clubhouse bar: Oswald links, brass active underline,
  forest bottom rule.
- `app/components/StatCard.tsx` — brass-labeled tile; supports a `variant`
  ("paper" default | "feature" forest-filled) for the bento big tile.
- `app/components/StandingsTable.tsx` — Oswald headers, brass rules, tabular
  nums, warm row banding.
- `app/components/MemberCard.tsx` — becomes a compact trading card (monogram,
  jersey number = index, team name, "since 2012").
- `app/components/LuckTable.tsx` — matches the new table styling.

New primitives:
- `app/components/SectionHeading.tsx` — Oswald uppercase title with a brass
  left-rule; used across pages.
- `app/components/TradingCard.tsx` — the large member card used on member detail
  (monogram, number, name, team, bio, fun facts, birthday).
- `app/components/Reveal.tsx` — `"use client"` scroll-reveal wrapper (respects
  reduced motion); wraps sections/cards.

Theme layer:
- `app/globals.css` — CSS variables, base body (paper bg + grain), font-family
  wiring, shared utility classes if needed.
- `app/layout.tsx` — load `Oswald` + `Bitter` via `next/font`, apply CSS vars,
  render the fixed grain overlay + a small footer ("Est. 2012").

## Page Treatments

- **Home (`app/page.tsx`):** program-cover hero (forest panel, inset brass
  frame, Oswald title, season/week), standings snapshot panel, latest-recap
  card, trading-card crew strip. Sections wrapped in `Reveal`.
- **Standings:** restyled table via `StandingsTable`; page title via
  `SectionHeading`.
- **Stats:** bento grid — one `feature` StatCard (big) + smaller StatCards for
  records/streaks/bench; restyled `LuckTable` below. Keeps existing graceful
  fallbacks.
- **History:** "Roll of Honor" ledger — years with brass rules, champion in
  Oswald, source shown as a small stamp/tag. Keeps ESPN+manual merge/dedup.
- **Recaps:** index as stacked program entries; detail renders auto-awards as
  brass award chips (restyle of the current StatCard usage), body in Bitter.
- **Members:** grid of `MemberCard` trading cards; detail = `TradingCard`.
- **Login (`app/login/page.tsx`):** clubhouse-door treatment (forest panel,
  brass, Oswald), same form/POST behavior.
- **Global states:** ESPN-down / empty messages restyled warmly (no logic
  change).

## Error Handling

Unchanged behavior. All existing try/catch fallbacks, the password gate, and the
graceful "no games yet / ESPN unavailable" messages remain; only their styling
updates. Motion never blocks content: reveal wrappers render content visible by
default and only animate as an enhancement, so JS-off / reduced-motion users see
everything.

## Testing

- Existing unit tests (`lib/**`) are untouched and must still pass (they cover
  logic, not styling).
- `npm run build` must succeed and produce the same route list.
- Manual visual verification of each page at desktop and mobile widths
  (single-column collapse below 768px: trading-card grid → 1–2 cols, bento →
  stacked, hero type scales down).
- `prefers-reduced-motion` disables animations (verify no motion).

## Risks

- **Palette readability:** ensure WCAG AA contrast — ink on paper, cream on
  forest, and especially brass text (use `--brass-bright` on dark, darker brass
  on light; never brass-on-cream for body text). Audit CTAs/labels.
- **Font weight/loading:** self-host via `next/font` (no layout shift, no
  external `<link>`); subset to needed weights to stay fast.
- **Motion scope creep:** keep the `Reveal` wrapper and hover states simple;
  no scroll-hijack or pinned sections in this pass.

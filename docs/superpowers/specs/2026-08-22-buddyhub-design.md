# BuddyHub — Design Spec

**Date:** 2026-08-22
**Repo:** https://github.com/Dabemo83/BuddyHub
**Status:** Design approved, pending spec review

## Overview

BuddyHub is a private website for a group of friends, anchored around their
ESPN fantasy football league. It surfaces live standings, all-time history and
records, an interesting-stats section, weekly recaps with auto-computed awards,
and a profile page per member. The site is gated behind a single shared
password. Content is maintained by one admin (the owner) via files in the repo;
there is no user-facing login or database.

## Goals

- Make the fantasy league the centerpiece: live standings, deep stats, history.
- Keep the whole thing free to run and simple to maintain.
- No user accounts, no database — the git repo is the CMS.
- Room to grow later into trip planning, shared photos, and a calendar.

## Non-Goals (explicitly out of scope for v1)

- Trash talk / message board (deferred — will be a separate effort).
- Trip planning, shared photo galleries, group calendar (later phases).
- Per-user accounts or self-service editing by non-admins.
- Player-level stats in the first release (fast follow after launch).

## Users

- **Admin (owner):** maintains content by editing files and pushing to git.
- **Members (viewers):** enter the shared password and browse; no editing.

## Pages

1. **Home** — hero (season + current week), live standings snapshot, latest
   recap, strip of member cards.
2. **Standings** — full live standings and matchups from ESPN.
3. **Stats** — interesting team-level stats for the current season and
   all-time (see Stats section). Player-level stats are a fast follow.
4. **History** — all-time records, past champions, head-to-head. Pulled
   automatically where possible; hand-entered for seasons the API can't reach.
5. **Recaps** — weekly writeups (admin-authored) each with auto-computed
   awards (top scorer, biggest blowout, loser of the week).
6. **Members** — a profile card/page per person.

A shared-password screen gates all pages before any content loads.

## Architecture

Single Next.js (App Router) + TypeScript app deployed on Vercel (free tier),
auto-deploying on git push. No database, no auth library.

### Live ESPN data (Standings, Stats, Home snapshot)

```
Browser → Next.js API route (server) → ESPN API (with cookies) → cached JSON → page
```

- The league is **private**, so requests require the owner's `espn_s2` and
  `SWID` cookies plus the league ID. These are stored as **secure Vercel
  environment variables**, never committed to code and never exposed to the
  browser.
- A single **ESPN client module** (`/lib/espn`) is the only code that talks to
  ESPN. It fetches and **normalizes** ESPN's raw JSON into clean internal
  types (`Team`, `Matchup`, `WeekScore`, `SeasonSummary`). Every page/route
  consumes these normalized shapes; nothing else touches ESPN directly.
- Responses are **cached** with a short revalidate window (target ~1–6 hours)
  so pages are fast and ESPN is not hammered. Standings feel current without
  per-request API calls.

### Content (Recaps, Members, manual history)

```
Admin edits a file → git push → Vercel auto-deploys → live
```

- Recaps: one Markdown file per week (front-matter + writeup).
- Members: one JSON file per person.
- Manual history: one JSON file per season the API cannot pull.
- The repo is the CMS. No database, no admin UI, no login for editing.

### Password gate

- Next.js **middleware** (`middleware.ts`) checks for a valid auth cookie on
  every request. If absent, it serves the shared-password screen. On correct
  entry it sets the cookie. The password is a Vercel environment variable.

### Derived stats

- A **stats module** (`/lib/stats`) computes team stats (records, streaks,
  highs/lows, points for/against, luck = record vs. points) from the
  normalized ESPN data. Stats are computed (and cached), not stored. Player
  stats later follow the same pattern using weekly box-score data.

## Stats (v1 = team-level)

Reliable team-level stats for the current season and all accessible past
seasons:

- Highest / lowest single-week score (ever and per season)
- Longest win / lose streaks
- Points for / against (season and all-time averages)
- Most points in a loss
- Luckiest / unluckiest (record vs. points scored)
- Best / worst bench decisions (points left on the bench)

**Player-level stats (fast follow, not v1):** best single player game started,
biggest bust started (projected vs. actual), most-rostered player. These
require weekly box-score data (more API calls), which will be fetched and
cached.

## History depth

- **2018–present:** use the modern, reliable ESPN API. Clean, complete.
- **Pre-2018:** attempt ESPN's legacy API; where it is spotty or unavailable,
  fill gaps via hand-entered season JSON files under `/content/history`.

## Project structure

```
/app            → the six pages (home, standings, stats, history, recaps, members)
/app/api        → ESPN proxy route(s)
/lib/espn       → ESPN client + normalizer (only module that talks to ESPN)
/lib/stats      → team-stats calculator over normalized data
/content        → recaps/*.md, members/*.json, history/*.json (admin-edited)
middleware.ts   → shared-password gate
```

## Content formats

- **Recap** (`/content/recaps/2026-week-02.md`): front-matter
  (`week`, `title`, `date`) + Markdown body. Awards are auto-computed from
  ESPN data for that week, not written by hand.
- **Member** (`/content/members/<slug>.json`): `name`, `photo`, `espnTeamName`,
  `bio`, `funFacts[]`, optional `birthday`.
- **Manual history** (`/content/history/<year>.json`): standings, champion,
  and notable results for a season the API cannot pull.

Templates for each will be provided during implementation.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- Vercel (free tier) hosting, auto-deploy on push
- No database, no auth library

## Testing strategy

- **Unit tests on the two "brains":**
  - ESPN normalizer: sample ESPN JSON fixtures → expected clean shapes.
  - Stats calculator: fixtures → correct records, streaks, highs/lows, luck.
- **Light integration checks:** pages render; password middleware blocks
  unauthenticated requests and allows authenticated ones.
- **Real ESPN validation:** verified against the owner's actual league during
  the first deploy.

## Configuration / secrets (supplied at deploy time, not in repo)

- `ESPN_LEAGUE_ID`
- `ESPN_S2` (cookie; expires periodically, refreshed as needed)
- `ESPN_SWID` (cookie; expires periodically, refreshed as needed)
- `SITE_PASSWORD` (shared viewing password)

A short guide for grabbing the league ID and cookies will be provided when
needed.

## Risks & caveats

- **Unofficial ESPN API:** undocumented and could change. Historically stable
  and widely used; manual entry is the fallback if it breaks.
- **Cookie expiry:** private-league cookies expire (weeks–months); the owner
  refreshes the Vercel env vars occasionally. No code change required.
- **Legacy seasons (pre-2018):** may be incomplete; covered by manual entry.

## Future phases (not now)

- Trip planning (destination/date voting, itinerary, cost splitting)
- Shared photo galleries
- Group calendar / events
- Trash talk / message board
- Player-level stats

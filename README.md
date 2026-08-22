# BuddyHub

Private site for our friend group, anchored on our ESPN fantasy league. Live standings,
all-time stats, league history, weekly recaps, and member profiles — behind a shared password.

## Local dev
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values (see `docs/ESPN-COOKIES.md`).
3. `npm run dev` then open http://localhost:3000

## Environment variables
| Var | What |
|-----|------|
| `ESPN_LEAGUE_ID` | Your ESPN league ID |
| `ESPN_S2` | ESPN auth cookie (private leagues) |
| `ESPN_SWID` | ESPN auth cookie, include the braces (private leagues) |
| `SITE_PASSWORD` | The shared password visitors type to view the site |

## Editing content
Content is plain files committed to git. Push to `main` and Vercel auto-redeploys.
- **Recaps:** add a Markdown file to `content/recaps/` (e.g. `2024-week-02.md`) with front-matter
  `year`, `week`, `title`, `date`, followed by your writeup. Awards are computed automatically from ESPN.
- **Members:** add a JSON file to `content/members/`. The filename is the member's URL slug
  (e.g. `jane-doe.json` -> `/members/jane-doe`). Fields: `name`, `photo`, `espnTeamName`, `bio`, `funFacts`, `birthday`.
- **Old seasons (pre-ESPN):** add a JSON file to `content/history/` (e.g. `2015.json`) with
  `year`, `champion`, and optionally `runnerUp`, `notes`, `finalStandings`.

## How it works
- Live ESPN data is fetched server-side and cached (~3h) via `lib/espn`. Team stats are computed in `lib/stats`.
- The shared-password gate is in `proxy.ts` (Next.js 16's replacement for middleware).
- Set `FIRST_ESPN_SEASON` in `lib/seasons.ts` to your league's first ESPN season.

## Deploy (Vercel, free)
1. Import the repo at vercel.com.
2. Add the four environment variables above.
3. Deploy. Visit the `*.vercel.app` URL, enter the password, and you're in.

## Tests
`npm test`

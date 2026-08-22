import { normalizeSeason } from "./normalize";
import type { SeasonData } from "./types";

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";
const CACHE_SECONDS = 60 * 60 * 3; // 3 hours

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Fetch one season. Uses the leagueHistory endpoint for past seasons. */
export async function fetchSeason(year: number): Promise<SeasonData> {
  const leagueId = requireEnv("ESPN_LEAGUE_ID");
  const s2 = requireEnv("ESPN_S2");
  const swid = requireEnv("ESPN_SWID");
  const current = new Date().getFullYear();

  const url =
    year >= current
      ? `${BASE}/seasons/${year}/segments/0/leagues/${leagueId}?view=mTeam&view=mMatchup&view=mSettings`
      : `${BASE}/leagueHistory/${leagueId}?seasonId=${year}&view=mTeam&view=mMatchup&view=mSettings`;

  // Note (Next.js 16 — previous caching model, cacheComponents not enabled):
  // fetch() is "auto no cache" by default, so next: { revalidate } alone is
  // insufficient. Adding cache: 'force-cache' opts this request into the
  // server-side persistent cache; revalidate then sets the TTL. Without
  // force-cache the fetch would re-run on every request.
  const res = await fetch(url, {
    headers: { Cookie: `espn_s2=${s2}; SWID=${swid}` },
    cache: "force-cache",
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) throw new Error(`ESPN fetch failed for ${year}: ${res.status}`);

  const json: any = await res.json();
  // leagueHistory returns an array of season objects; the seasons endpoint returns one object.
  const raw = Array.isArray(json) ? json[0] : json;
  return normalizeSeason(raw);
}

/** Fetch multiple seasons, skipping any that fail (e.g. spotty legacy years). */
export async function fetchSeasons(years: number[]): Promise<SeasonData[]> {
  const results = await Promise.allSettled(years.map(fetchSeason));
  return results
    .filter((r): r is PromiseFulfilledResult<SeasonData> => r.status === "fulfilled")
    .map((r) => r.value);
}

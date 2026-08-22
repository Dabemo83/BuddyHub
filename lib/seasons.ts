import { fetchSeason, fetchSeasons } from "@/lib/espn/client";
import type { SeasonData } from "@/lib/espn/types";

// The first season the league existed on ESPN. Adjust once the real value is known.
export const FIRST_ESPN_SEASON = 2018;

export function currentSeason(): number {
  return new Date().getFullYear();
}

export function allEspnYears(): number[] {
  const years: number[] = [];
  for (let y = FIRST_ESPN_SEASON; y <= currentSeason(); y++) years.push(y);
  return years;
}

export async function loadCurrentSeason(): Promise<SeasonData> {
  return fetchSeason(currentSeason());
}

export async function loadAllSeasons(): Promise<SeasonData[]> {
  return fetchSeasons(allEspnYears());
}

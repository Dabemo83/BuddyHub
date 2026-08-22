import StandingsTable from "@/app/components/StandingsTable";
import { loadCurrentSeason } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  try {
    const season = await loadCurrentSeason();
    const table = standings(season);
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{season.year} Standings</h1>
        <StandingsTable teams={table} />
      </div>
    );
  } catch {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Standings</h1>
        <p className="text-red-400">
          Couldn&apos;t reach ESPN right now. The league cookies may have expired — refresh
          <code className="mx-1">ESPN_S2</code>/<code className="mx-1">ESPN_SWID</code> in Vercel.
        </p>
      </div>
    );
  }
}

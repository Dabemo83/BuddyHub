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

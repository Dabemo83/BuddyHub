import { notFound } from "next/navigation";
import { getRecap, getRecaps } from "@/lib/content/recaps";
import { fetchSeason } from "@/lib/espn/client";
import { weeklyAwards } from "@/lib/stats/awards";
import StatCard from "@/app/components/StatCard";

export function generateStaticParams() {
  return getRecaps().map((r) => ({ slug: r.slug }));
}

export const dynamic = "force-dynamic";

export default async function RecapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recap = getRecap(slug);
  if (!recap) notFound();

  let awardsBlock = null;
  try {
    const season = await fetchSeason(recap.year);
    const a = weeklyAwards(season, recap.week);
    const nameFor = (id: number) => season.teams.find((t) => t.id === id)?.name ?? `Team ${id}`;
    awardsBlock = (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <StatCard emoji="🏆" label="Top scorer" value={nameFor(a.topScorer.teamId)} sub={`${a.topScorer.score.toFixed(1)} pts`} />
        <StatCard emoji="💥" label="Biggest blowout" value={nameFor(a.biggestBlowout.winnerTeamId)} sub={`by ${a.biggestBlowout.margin.toFixed(1)} over ${nameFor(a.biggestBlowout.loserTeamId)}`} />
        <StatCard emoji="😬" label="Loser of the week" value={nameFor(a.loser.teamId)} sub={`${a.loser.score.toFixed(1)} pts`} />
      </div>
    );
  } catch (e) {
    console.error("weeklyAwards failed for", slug, e);
    awardsBlock = <p className="text-sm text-slate-500 my-6">Awards unavailable (ESPN data not reachable for this week).</p>;
  }

  return (
    <article className="max-w-none space-y-4">
      <h1 className="text-2xl font-bold">{recap.title}</h1>
      <div className="text-xs text-slate-500">{recap.date}</div>
      {awardsBlock}
      <p className="whitespace-pre-wrap">{recap.body}</p>
    </article>
  );
}

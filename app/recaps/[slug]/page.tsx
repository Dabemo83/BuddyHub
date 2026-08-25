import { notFound } from "next/navigation";
import { getRecap, getRecaps } from "@/lib/content/recaps";
import { fetchSeason } from "@/lib/espn/client";
import { weeklyAwards } from "@/lib/stats/awards";

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
  } catch (e) {
    console.error("weeklyAwards failed for", slug, e);
    awardsBlock = <p className="text-sm text-muted my-6">Awards unavailable (ESPN data not reachable for this week).</p>;
  }

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
}

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
    const completedWeeks = season.matchups.filter((m) => m.completed).map((m) => m.week);
    const week = completedWeeks.length > 0 ? Math.max(...completedWeeks) : 1;
    seasonLabel = `${season.year} Season · Week ${week}`;
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

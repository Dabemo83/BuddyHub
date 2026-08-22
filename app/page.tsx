import Link from "next/link";
import { loadCurrentSeason } from "@/lib/seasons";
import { standings } from "@/lib/stats/team-stats";
import { getRecaps } from "@/lib/content/recaps";
import { getMembers } from "@/lib/content/members";
import MemberCard from "@/app/components/MemberCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let top3: { id: number; name: string; wins: number; losses: number }[] = [];
  let seasonLabel = "";
  try {
    const season = await loadCurrentSeason();
    seasonLabel = `${season.year} Season`;
    top3 = standings(season).slice(0, 3).map((t) => ({ id: t.id, name: t.name, wins: t.wins, losses: t.losses }));
  } catch {
    seasonLabel = "Season";
  }

  const latest = getRecaps()[0];
  const members = getMembers();

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-br from-emerald-600 to-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold">🏈 BuddyHub</h1>
        <p className="text-emerald-100">{seasonLabel}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Standings</h2>
          {top3.length > 0 ? (
            <ol className="space-y-2">
              {top3.map((t, i) => (
                <li key={t.id} className="flex justify-between bg-slate-800 rounded-lg px-4 py-2">
                  <span>{i + 1}. {t.name}</span><span className="text-slate-400">{t.wins}-{t.losses}</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-slate-400">Standings unavailable right now.</p>}
          <Link href="/standings" className="text-emerald-400 text-sm mt-2 inline-block">See full standings →</Link>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Latest recap</h2>
          {latest ? (
            <Link href={`/recaps/${latest.slug}`} className="block bg-slate-800 rounded-lg p-4 hover:ring-2 hover:ring-emerald-400">
              <div className="font-semibold">{latest.title}</div>
              <div className="text-xs text-slate-500">{latest.date}</div>
            </Link>
          ) : <p className="text-slate-400">No recaps yet.</p>}
        </section>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">The crew</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {members.slice(0, 8).map((m) => <MemberCard key={m.slug} member={m} />)}
        </div>
      </section>
    </div>
  );
}

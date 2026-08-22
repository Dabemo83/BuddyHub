import Link from "next/link";
import { getRecaps } from "@/lib/content/recaps";

export default function RecapsPage() {
  const recaps = getRecaps();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Weekly Recaps</h1>
      {recaps.length === 0 && <p className="text-slate-400">No recaps yet.</p>}
      <ul className="space-y-3">
        {recaps.map((r) => (
          <li key={r.slug} className="bg-slate-800 rounded-xl p-4">
            <Link href={`/recaps/${r.slug}`} className="font-semibold hover:text-emerald-400">{r.title}</Link>
            <div className="text-xs text-slate-500">{r.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

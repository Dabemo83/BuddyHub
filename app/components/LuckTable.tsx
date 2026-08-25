import type { TeamLuck } from "@/lib/stats/luck";

export default function LuckTable({ rows }: { rows: (TeamLuck & { name: string })[] }) {
  return (
    <table className="w-full text-sm bg-paper-2 rounded-xl overflow-hidden border border-brass/40">
      <thead
        className="text-left bg-forest text-cream uppercase tracking-[0.08em] text-xs"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tr>
          <th scope="col" className="py-2 px-3">Team</th>
          <th scope="col" className="px-2 text-right">PF</th>
          <th scope="col" className="px-2 text-right">PA</th>
          <th scope="col" className="px-2 text-right">PF/G</th>
          <th scope="col" className="px-2 text-right">xW</th>
          <th scope="col" className="px-2 text-right">W</th>
          <th scope="col" className="px-2 text-right">Luck</th>
        </tr>
      </thead>
      <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
        {rows.map((r, i) => (
          <tr key={r.teamId} className={i % 2 ? "bg-paper/40" : ""}>
            <td className="py-2 px-3 font-medium">{r.name}</td>
            <td className="px-2 text-right">{r.pf.toFixed(1)}</td>
            <td className="px-2 text-right">{r.pa.toFixed(1)}</td>
            <td className="px-2 text-right">{r.gamesPlayed ? (r.pf / r.gamesPlayed).toFixed(1) : "—"}</td>
            <td className="px-2 text-right">{r.expectedWins.toFixed(1)}</td>
            <td className="px-2 text-right">{r.actualWins}</td>
            <td className={`px-2 text-right font-semibold ${r.luck >= 0 ? "text-forest" : "text-[#a3401f]"}`}>
              {r.luck >= 0 ? "+" : ""}
              {r.luck.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

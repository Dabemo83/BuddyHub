import type { TeamLuck } from "@/lib/stats/luck";

export default function LuckTable({ rows }: { rows: (TeamLuck & { name: string })[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-400 border-b border-slate-800">
        <tr>
          <th scope="col" className="py-2">Team</th>
          <th scope="col" className="text-right">PF</th>
          <th scope="col" className="text-right">PA</th>
          <th scope="col" className="text-right">PF/G</th>
          <th scope="col" className="text-right">xW</th>
          <th scope="col" className="text-right">W</th>
          <th scope="col" className="text-right">Luck</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.teamId} className="border-b border-slate-800/50">
            <td className="py-2 font-medium">{r.name}</td>
            <td className="text-right">{r.pf.toFixed(1)}</td>
            <td className="text-right">{r.pa.toFixed(1)}</td>
            <td className="text-right">{r.gamesPlayed ? (r.pf / r.gamesPlayed).toFixed(1) : "—"}</td>
            <td className="text-right">{r.expectedWins.toFixed(1)}</td>
            <td className="text-right">{r.actualWins}</td>
            <td className={`text-right ${r.luck >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {r.luck >= 0 ? "+" : ""}{r.luck.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

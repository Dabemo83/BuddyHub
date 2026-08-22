import type { Team } from "@/lib/espn/types";

export default function StandingsTable({ teams }: { teams: Team[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-400 border-b border-slate-800">
        <tr>
          <th className="py-2">#</th><th>Team</th><th>Owner</th>
          <th className="text-right">W</th><th className="text-right">L</th>
          <th className="text-right">PF</th><th className="text-right">PA</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((t, i) => (
          <tr key={t.id} className="border-b border-slate-800/50">
            <td className="py-2 text-slate-500">{i + 1}</td>
            <td className="font-medium">{t.name}</td>
            <td className="text-slate-400">{t.owner}</td>
            <td className="text-right">{t.wins}</td>
            <td className="text-right">{t.losses}</td>
            <td className="text-right">{t.pointsFor.toFixed(1)}</td>
            <td className="text-right">{t.pointsAgainst.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

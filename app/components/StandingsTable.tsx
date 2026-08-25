import type { Team } from "@/lib/espn/types";

export default function StandingsTable({ teams }: { teams: Team[] }) {
  return (
    <table className="w-full text-sm bg-paper-2 rounded-xl overflow-hidden border border-brass/40">
      <thead
        className="text-left bg-forest text-cream uppercase tracking-[0.08em] text-xs"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <tr>
          <th scope="col" className="py-2 px-3">#</th>
          <th scope="col" className="px-2">Team</th>
          <th scope="col" className="px-2">Owner</th>
          <th scope="col" className="px-2 text-right">W</th>
          <th scope="col" className="px-2 text-right">L</th>
          <th scope="col" className="px-2 text-right">PF</th>
          <th scope="col" className="px-2 text-right">PA</th>
        </tr>
      </thead>
      <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
        {teams.map((t, i) => (
          <tr key={t.id} className={i % 2 ? "bg-paper/40" : ""}>
            <td className="py-2 px-3 text-muted">{i + 1}</td>
            <td className="px-2 font-medium">{t.name}</td>
            <td className="px-2 text-muted">{t.owner}</td>
            <td className="px-2 text-right">{t.wins}</td>
            <td className="px-2 text-right">{t.losses}</td>
            <td className="px-2 text-right">{t.pointsFor.toFixed(1)}</td>
            <td className="px-2 text-right">{t.pointsAgainst.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

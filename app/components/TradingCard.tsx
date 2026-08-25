import type { Member } from "@/lib/content/members";

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function TradingCard({ member, index }: { member: Member; index?: number }) {
  return (
    <div className="relative max-w-md rounded-2xl p-6 bg-forest text-cream border-2 border-brass shadow-[6px_6px_0_var(--color-brass)]">
      {typeof index === "number" && (
        <span
          className="absolute top-4 right-5 text-4xl font-bold text-brass-bright/90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span
        className="flex items-center justify-center w-16 h-16 rounded-full bg-brass text-forest text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {monogram(member.name)}
      </span>
      <h1
        className="mt-4 uppercase font-bold text-2xl tracking-[0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {member.name}
      </h1>
      {member.espnTeamName && <div className="text-lg italic text-brass-bright">{member.espnTeamName}</div>}
      <div
        className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream/70"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Manager since 2012
      </div>

      {member.bio && <p className="mt-4 text-cream/90">{member.bio}</p>}

      {member.funFacts && member.funFacts.length > 0 && (
        <div className="mt-4">
          <div
            className="text-[10px] uppercase tracking-[0.16em] text-brass-bright"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fun facts
          </div>
          <ul className="list-disc list-inside text-cream/90 mt-1">
            {member.funFacts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {member.birthday && <div className="mt-4 text-sm text-cream/70">🎂 {member.birthday}</div>}
    </div>
  );
}

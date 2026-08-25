import Link from "next/link";
import type { Member } from "@/lib/content/members";

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function MemberCard({ member, index }: { member: Member; index?: number }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="relative block rounded-xl p-4 bg-forest text-cream border-2 border-brass shadow-[4px_4px_0_var(--color-brass)] hover:-translate-y-0.5 hover:shadow-[5px_6px_0_var(--color-brass)] active:translate-y-0 transition-all"
    >
      {typeof index === "number" && (
        <span
          className="absolute top-2 right-3 text-2xl font-bold text-brass-bright/90"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span
        className="flex items-center justify-center w-11 h-11 rounded-full bg-brass text-forest text-lg font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {monogram(member.name)}
      </span>
      <div
        className="mt-2 uppercase font-semibold text-base tracking-[0.02em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {member.name}
      </div>
      {member.espnTeamName && <div className="text-sm italic text-brass-bright">{member.espnTeamName}</div>}
      <div
        className="mt-2 text-[9px] uppercase tracking-[0.15em] text-cream/70"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Manager since 2012
      </div>
    </Link>
  );
}

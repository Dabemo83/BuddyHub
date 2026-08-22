import Link from "next/link";
import type { Member } from "@/lib/content/members";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <Link href={`/members/${member.slug}`} className="bg-slate-800 rounded-xl p-4 block hover:ring-2 hover:ring-emerald-400">
      <div className="text-lg font-semibold">{member.name}</div>
      {member.espnTeamName && <div className="text-sm text-slate-400">{member.espnTeamName}</div>}
    </Link>
  );
}

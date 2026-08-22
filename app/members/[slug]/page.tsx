import { notFound } from "next/navigation";
import { getMember, getMembers } from "@/lib/content/members";

export function generateStaticParams() {
  return getMembers().map((m) => ({ slug: m.slug }));
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = getMember(slug);
  if (!member) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">{member.name}</h1>
      {member.espnTeamName && <div className="text-slate-400">{member.espnTeamName}</div>}
      {member.bio && <p className="mt-4">{member.bio}</p>}
      {member.funFacts && member.funFacts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-6">Fun facts</h2>
          <ul className="list-disc list-inside text-slate-300">
            {member.funFacts.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </>
      )}
      {member.birthday && <p className="text-sm text-slate-500 mt-6">🎂 {member.birthday}</p>}
    </div>
  );
}

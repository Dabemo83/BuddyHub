import MemberCard from "@/app/components/MemberCard";
import { getMembers } from "@/lib/content/members";

export default function MembersPage() {
  const members = getMembers();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">The Crew</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {members.map((m) => <MemberCard key={m.slug} member={m} />)}
      </div>
    </div>
  );
}

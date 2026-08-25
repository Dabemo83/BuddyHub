import MemberCard from "@/app/components/MemberCard";
import SectionHeading from "@/app/components/SectionHeading";
import { getMembers } from "@/lib/content/members";

export default function MembersPage() {
  const members = getMembers();
  return (
    <div>
      <SectionHeading>The Crew</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <MemberCard key={m.slug} member={m} index={i} />
        ))}
      </div>
    </div>
  );
}

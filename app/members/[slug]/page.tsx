import { notFound } from "next/navigation";
import { getMember, getMembers } from "@/lib/content/members";
import TradingCard from "@/app/components/TradingCard";

export function generateStaticParams() {
  return getMembers().map((m) => ({ slug: m.slug }));
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const members = getMembers();
  const index = members.findIndex((m) => m.slug === slug);
  const member = index >= 0 ? members[index] : getMember(slug);
  if (!member) notFound();

  return <TradingCard member={member} index={index >= 0 ? index : undefined} />;
}

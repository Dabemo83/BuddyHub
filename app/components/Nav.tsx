import Link from "next/link";

const LINKS = [
  { href: "/standings", label: "Standings" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/recaps", label: "Recaps" },
  { href: "/members", label: "Members" },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto flex items-center gap-6 px-4 h-14">
        <Link href="/" className="font-bold text-emerald-400">🏈 BuddyHub</Link>
        <div className="flex gap-4 text-sm text-slate-300">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">{l.label}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

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
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b-2 border-forest">
      <nav
        className="max-w-5xl mx-auto flex items-center gap-6 px-4 h-14 uppercase tracking-[0.08em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <Link href="/" className="font-bold text-forest text-lg tracking-[0.04em]">
          🏈 BuddyHub
        </Link>
        <div className="flex gap-4 text-xs font-medium">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink/80 hover:text-forest border-b-2 border-transparent hover:border-brass pb-0.5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

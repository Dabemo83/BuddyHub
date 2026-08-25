import Link from "next/link";
import { getRecaps } from "@/lib/content/recaps";
import SectionHeading from "@/app/components/SectionHeading";

export default function RecapsPage() {
  const recaps = getRecaps();
  return (
    <div>
      <SectionHeading>Weekly Recaps</SectionHeading>
      {recaps.length === 0 && <p className="text-muted">No recaps yet.</p>}
      {recaps.length > 0 && (
        <ul className="space-y-3">
          {recaps.map((r) => (
            <li key={r.slug} className="rounded-xl bg-paper-2 border border-brass/40 p-4 hover:-translate-y-0.5 transition-transform">
              <Link
                href={`/recaps/${r.slug}`}
                className="font-semibold text-forest hover:text-brass"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {r.title}
              </Link>
              <div className="text-xs text-muted">{r.date}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function StatCard({
  emoji,
  label,
  value,
  sub,
  variant = "paper",
}: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  variant?: "paper" | "feature";
}) {
  const feature = variant === "feature";
  return (
    <div
      className={
        feature
          ? "rounded-xl p-5 bg-forest text-cream border border-brass/60"
          : "rounded-xl p-4 bg-paper-2 border border-brass/40"
      }
    >
      <div className="text-2xl">{emoji}</div>
      <div
        className={`text-[10px] uppercase tracking-[0.16em] mt-1 ${feature ? "text-brass-bright" : "text-brass"}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </div>
      <div
        className={`font-bold ${feature ? "text-3xl" : "text-2xl"} ${feature ? "text-cream" : "text-ink"}`}
        style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      {sub && (
        <div className={`text-sm mt-0.5 ${feature ? "text-cream/80" : "text-muted"}`}>{sub}</div>
      )}
    </div>
  );
}

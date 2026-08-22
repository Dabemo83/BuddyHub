export default function StatCard({
  emoji, label, value, sub,
}: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs uppercase tracking-wide text-slate-400 mt-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-sm text-slate-400">{sub}</div>}
    </div>
  );
}

export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase tracking-[0.05em] text-2xl font-semibold text-forest border-l-4 border-brass pl-3 mb-4"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </h2>
  );
}

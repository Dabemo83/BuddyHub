export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-paper p-6">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm bg-forest text-cream rounded-2xl p-8 border-2 border-brass shadow-[6px_6px_0_var(--color-brass)] space-y-4"
      >
        <h1 className="text-2xl font-bold text-center uppercase" style={{ fontFamily: "var(--font-display)" }}>
          🏈 BuddyHub
        </h1>
        <p className="text-sm text-cream/70 text-center">Enter the crew password to continue.</p>
        {error && <p className="text-sm text-[#e8b06a] text-center">Wrong password — try again.</p>}
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg bg-cream/10 border border-brass/40 px-4 py-2 text-cream placeholder-cream/40 outline-none focus:ring-2 focus:ring-brass"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brass hover:bg-brass-bright text-forest font-semibold py-2 uppercase tracking-[0.08em] transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Enter
        </button>
      </form>
    </main>
  );
}

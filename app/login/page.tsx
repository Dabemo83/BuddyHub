export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <form method="POST" action="/api/login" className="w-full max-w-sm bg-slate-800 rounded-2xl p-8 shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-center">🏈 BuddyHub</h1>
        <p className="text-sm text-slate-400 text-center">Enter the crew password to continue.</p>
        {error && <p className="text-sm text-red-400 text-center">Wrong password — try again.</p>}
        <input type="password" name="password" placeholder="Password" autoFocus
          className="w-full rounded-lg bg-slate-700 px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-400" />
        <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2">Enter</button>
      </form>
    </main>
  );
}

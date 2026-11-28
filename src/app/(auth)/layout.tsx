export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Hookline
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {children}
        </div>
      </div>
    </main>
  );
}
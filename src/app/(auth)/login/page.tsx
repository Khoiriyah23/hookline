import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <>
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Log in</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">Welcome back.</p>
      {error === "confirm" && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          That confirmation link is invalid or expired. Try logging in, or sign up again.
        </p>
      )}
      <LoginForm next={next} />
    </>
  );
}
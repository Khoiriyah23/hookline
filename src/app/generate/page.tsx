import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Generator</h1>
      <p className="text-zinc-500">Coming soon. Signed in as {user?.email}</p>
      <LogoutButton />
    </main>
  );
}
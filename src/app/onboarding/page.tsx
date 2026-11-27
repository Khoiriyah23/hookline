import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || user?.email} 👋</h1>
      <p className="text-zinc-500">
        Profile setup comes here. Signed in as {user?.email} · plan: {profile?.plan}
      </p>
      <LogoutButton />
    </main>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Generator</h1>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-sm text-zinc-500 hover:underline">
            Profile
          </Link>
          <LogoutButton />
        </div>
      </div>
      <p className="text-zinc-500">
        Hi {profile.full_name}. The generator is coming next.
      </p>
    </main>
  );
}
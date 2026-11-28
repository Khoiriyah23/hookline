import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm, type ProfileRow } from "@/components/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, skills, years_experience, portfolio_links, bio, tone, plan")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/generate" className="text-sm text-zinc-500 hover:underline">
          ← Back to generator
        </Link>
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Your profile</h1>
      <p className="mb-8 mt-2 text-sm text-zinc-500">
        {user.email} · {profile?.plan === "pro" ? "Pro plan" : "Free plan"}
      </p>
      <ProfileForm intent="edit" profile={profile as ProfileRow | null} />
    </main>
  );
}
import { redirect } from "next/navigation";
import { ProfileForm, type ProfileRow } from "@/components/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, skills, years_experience, portfolio_links, bio, tone, onboarded")
    .eq("id", user.id)
    .single();

  // Already set up? Go straight to the generator.
  if (profile?.onboarded) redirect("/generate");

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm font-medium text-zinc-500">Step 1 of 1</p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Set up your profile
      </h1>
      <p className="mb-8 mt-2 text-sm text-zinc-500">
        Hookline uses this to make every proposal, cover letter and cold email sound like you.
      </p>
      <ProfileForm intent="onboarding" profile={profile as ProfileRow | null} />
    </main>
  );
}
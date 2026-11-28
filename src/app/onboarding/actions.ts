"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tone } from "@/types/api";

export type ProfileFormValues = {
  fullName: string;
  headline: string;
  skills: string;
  yearsExperience: string;
  portfolioLinks: string;
  bio: string;
  tone: string;
};

export type ProfileState = {
  error: string | null;
  saved: boolean;
  values?: ProfileFormValues; // sent back on error so the form keeps what the user typed
};

const TONES: Tone[] = ["professional", "friendly", "confident", "concise"];

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values: ProfileFormValues = {
    fullName: field(formData, "fullName"),
    headline: field(formData, "headline"),
    skills: field(formData, "skills"),
    yearsExperience: field(formData, "yearsExperience"),
    portfolioLinks: field(formData, "portfolioLinks"),
    bio: field(formData, "bio"),
    tone: field(formData, "tone"),
  };
  const fail = (error: string): ProfileState => ({ error, saved: false, values });

  const skills = values.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const portfolioLinks = values.portfolioLinks
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!values.fullName) return fail("Enter your name.");
  if (!values.headline) return fail("Add a short headline, e.g. “Full-stack developer”.");
  if (values.headline.length > 120) return fail("Keep your headline under 120 characters.");
  if (skills.length === 0) return fail("Add at least one skill.");
  if (skills.length > 30 || skills.some((s) => s.length > 40)) {
    return fail("Add up to 30 skills, each under 40 characters.");
  }
  if (values.bio.length > 2000) return fail("Keep your bio under 2,000 characters.");
  if (!TONES.includes(values.tone as Tone)) return fail("Pick a writing tone.");

  let yearsExperience: number | null = null;
  if (values.yearsExperience) {
    const years = Number(values.yearsExperience);
    if (!Number.isInteger(years) || years < 0 || years > 60) {
      return fail("Years of experience must be a whole number between 0 and 60.");
    }
    yearsExperience = years;
  }

  if (portfolioLinks.length > 5) return fail("Add up to 5 portfolio links.");
  for (const link of portfolioLinks) {
    try {
      const url = new URL(link);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      return fail(`“${link}” isn't a valid link. Links must start with https://`);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName,
      headline: values.headline,
      skills,
      years_experience: yearsExperience,
      portfolio_links: portfolioLinks,
      bio: values.bio,
      tone: values.tone,
      onboarded: true,
    })
    .eq("id", user.id);

  if (error) return fail("We couldn't save your profile. Please try again.");

  revalidatePath("/", "layout");

  if (formData.get("intent") === "onboarding") {
    redirect("/generate");
  }
  return { error: null, saved: true };
}
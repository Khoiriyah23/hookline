"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null; message: string | null };

// Only allow redirects to our own pages (blocks "//evil.com" style tricks).
function safePath(value: FormDataEntryValue | null, fallback: string) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox.", message: null };
    }
    return { error: "Wrong email or password.", message: null };
  }

  redirect(safePath(formData.get("next"), "/generate"));
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email) {
    return { error: "Enter your name and email.", message: null };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", message: null };
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // our sign-up trigger copies this into profiles
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  // If email confirmation is off, the user is logged in straight away.
  if (data.session) {
    redirect("/onboarding");
  }

  return {
    error: null,
    message: "Almost there! Check your email and click the link to confirm your account.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
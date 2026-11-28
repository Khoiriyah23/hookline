"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "@/app/onboarding/actions";

export type ProfileRow = {
  full_name: string;
  headline: string;
  skills: string[];
  years_experience: number | null;
  portfolio_links: string[];
  bio: string;
  tone: string;
};

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", hint: "Polished and businesslike" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "confident", label: "Confident", hint: "Direct and results-focused" },
  { value: "concise", label: "Concise", hint: "Short and to the point" },
];

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
const hintClass = "text-xs text-zinc-500";

const initialState: ProfileState = { error: null, saved: false };

export function ProfileForm({
  profile,
  intent,
}: {
  profile: ProfileRow | null;
  intent: "onboarding" | "edit";
}) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  // After a failed save, show what the user typed; otherwise show the saved profile.
  const v = state.values;
  const selectedTone = v?.tone || profile?.tone || "professional";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="intent" value={intent} />

      <label className="block space-y-1">
        <span className={labelClass}>Full name</span>
        <input
          name="fullName"
          required
          defaultValue={v?.fullName ?? profile?.full_name ?? ""}
          className={inputClass}
        />
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>Headline</span>
        <input
          name="headline"
          required
          maxLength={120}
          placeholder="e.g. Full-stack developer specialising in Next.js"
          defaultValue={v?.headline ?? profile?.headline ?? ""}
          className={inputClass}
        />
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>Skills</span>
        <input
          name="skills"
          required
          placeholder="React, Next.js, Tailwind, Node.js"
          defaultValue={v?.skills ?? profile?.skills?.join(", ") ?? ""}
          className={inputClass}
        />
        <span className={hintClass}>Separate skills with commas.</span>
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>Years of experience</span>
        <input
          name="yearsExperience"
          type="number"
          min={0}
          max={60}
          defaultValue={v?.yearsExperience ?? profile?.years_experience?.toString() ?? ""}
          className={`${inputClass} max-w-32`}
        />
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>Portfolio links (optional)</span>
        <textarea
          name="portfolioLinks"
          rows={3}
          placeholder={"https://github.com/you\nhttps://yourportfolio.com"}
          defaultValue={v?.portfolioLinks ?? profile?.portfolio_links?.join("\n") ?? ""}
          className={inputClass}
        />
        <span className={hintClass}>One link per line, up to 5.</span>
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>Short bio (optional)</span>
        <textarea
          name="bio"
          rows={5}
          maxLength={2000}
          placeholder="What you do, who you've worked with, results you're proud of."
          defaultValue={v?.bio ?? profile?.bio ?? ""}
          className={inputClass}
        />
        <span className={hintClass}>
          The more specific you are, the more personal your proposals will sound.
        </span>
      </label>

      <fieldset className="space-y-2">
        <legend className={labelClass}>Writing tone</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TONE_OPTIONS.map((tone) => (
            <label
              key={tone.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-300 p-3 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 dark:border-zinc-700 dark:has-[:checked]:border-zinc-300 dark:has-[:checked]:bg-zinc-900"
            >
              <input
                type="radio"
                name="tone"
                value={tone.value}
                defaultChecked={selectedTone === tone.value}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {tone.label}
                </span>
                <span className={hintClass}>{tone.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving…" : intent === "onboarding" ? "Save and continue" : "Save changes"}
      </button>
    </form>
  );
}
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = { error: null, message: null };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.message) {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full name</span>
        <input name="fullName" type="text" autoComplete="name" required className={inputClass} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
        <span className="text-xs text-zinc-500">At least 8 characters.</span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </form>
  );
}
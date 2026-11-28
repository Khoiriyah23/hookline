"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = { error: null, message: null };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 underline dark:text-zinc-50">
          Sign up
        </Link>
      </p>
    </form>
  );
}
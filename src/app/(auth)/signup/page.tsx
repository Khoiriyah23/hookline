import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">
        Write proposals, cover letters and cold emails in seconds.
      </p>
      <SignupForm />
    </>
  );
}
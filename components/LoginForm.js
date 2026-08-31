"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/auth/actions";
import FormField from "@/components/FormField";

const field = "field-control";

function LoginButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary w-full" type="submit">{pending ? "Logging in…" : "Log in"}</button>;
}

export default function LoginForm({ next = "/dashboard", message }) {
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {message && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{message}</p>}
      {state?.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}
      <FormField label="Email address"><input className={field} id="email" name="email" type="email" autoComplete="email" placeholder="student@university.edu" required /></FormField>
      <FormField label="Password"><input className={field} id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></FormField>
      <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-500"><input className="size-4 accent-teal-700" type="checkbox" name="remember" /> Remember me</label><span className="font-semibold text-slate-400">Password recovery coming later</span></div>
      <LoginButton />
    </form>
  );
}

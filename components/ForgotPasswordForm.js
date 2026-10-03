"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/app/auth/actions";
import FormField from "@/components/FormField";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending} type="submit">
      {pending ? "Sending link…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <div
        className="rounded-2xl border border-brand-200 bg-brand-50 p-5"
        role="status"
      >
        <span className="grid size-10 place-items-center rounded-full bg-white font-bold text-brand-700 shadow-sm">
          ✓
        </span>
        <h2 className="mt-4 font-bold text-brand-950">Check your inbox</h2>
        <p className="mt-2 text-sm leading-6 text-brand-800">
          {state.success}
        </p>
        <Link className="btn-secondary mt-5 w-full" href="/login">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {state.error}
        </p>
      )}
      <FormField label="Email address" hint="Your Findmatch account email">
        <input
          className="field-control"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="student@university.edu"
          required
        />
      </FormField>
      <p className="text-xs leading-5 text-slate-500">
        For your privacy, Findmatch shows the same confirmation whether or not
        an account exists for the address.
      </p>
      <SubmitButton />
    </form>
  );
}

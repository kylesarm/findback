"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/auth/actions";
import FormField from "@/components/FormField";
import PasswordField from "@/components/PasswordField";

const field = "field-control";

function RegisterButton({ passwordsMatch }) {
  const { pending } = useFormStatus();
  return <button disabled={pending || !passwordsMatch} className="btn-primary w-full" type="submit">{pending ? "Creating account…" : "Create account"}</button>;
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(register, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (state?.success) {
    return <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5" role="status"><span className="grid size-10 place-items-center rounded-full bg-white text-lg text-teal-700 shadow-sm">✓</span><h2 className="mt-4 font-bold text-teal-950">Check your inbox</h2><p className="mt-2 text-sm leading-6 text-teal-800">{state.success}</p></div>;
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}
      <div className="grid gap-5 sm:grid-cols-2"><FormField label="First name"><input className={field} name="firstName" autoComplete="given-name" placeholder="Alex" required /></FormField><FormField label="Last name"><input className={field} name="lastName" autoComplete="family-name" placeholder="Morgan" required /></FormField></div>
      <FormField label="Campus email"><input className={field} name="email" type="email" autoComplete="email" placeholder="student@university.edu" required /></FormField>
      <FormField label="Student or employee ID"><input className={field} name="campusId" autoComplete="off" placeholder="e.g. 2026-00123" required /></FormField>
      <PasswordField id="register-password" label="Password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} placeholder="At least 8 characters" describedBy="password-requirements" />
      <p id="password-requirements" className="-mt-3 text-xs leading-5 text-slate-500">Use at least 8 characters.</p>
      <PasswordField id="register-confirm-password" label="Confirm password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} visible={showConfirmation} onToggle={() => setShowConfirmation((visible) => !visible)} placeholder="Re-enter your password" invalid={showMismatch} describedBy={showMismatch ? "password-match-error" : undefined} />
      {showMismatch && <p id="password-match-error" className="-mt-3 text-xs font-semibold text-rose-700" role="alert">Passwords do not match.</p>}
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-500"><input className="mt-0.5 size-4 accent-teal-700" name="terms" type="checkbox" required /> I agree to use FindMatch responsibly and follow the campus item claim policy.</label>
      <RegisterButton passwordsMatch={passwordsMatch} />
    </form>
  );
}

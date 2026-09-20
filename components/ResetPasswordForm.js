"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword } from "@/app/auth/actions";
import PasswordField from "@/components/PasswordField";

function SubmitButton({ passwordsMatch }) {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending || !passwordsMatch} type="submit">{pending ? "Updating password…" : "Update password"}</button>;
}

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}
      <PasswordField id="reset-password" label="New password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} visible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} placeholder="At least 8 characters" describedBy="reset-password-requirements" />
      <p id="reset-password-requirements" className="-mt-3 text-xs leading-5 text-slate-500">Use at least 8 characters and choose a password you do not use elsewhere.</p>
      <PasswordField id="reset-confirm-password" label="Confirm new password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} visible={showConfirmation} onToggle={() => setShowConfirmation((visible) => !visible)} placeholder="Re-enter your new password" invalid={showMismatch} describedBy={showMismatch ? "reset-password-match-error" : undefined} />
      {showMismatch && <p id="reset-password-match-error" className="-mt-3 text-xs font-semibold text-rose-700" role="alert">Passwords do not match.</p>}
      <SubmitButton passwordsMatch={passwordsMatch} />
    </form>
  );
}

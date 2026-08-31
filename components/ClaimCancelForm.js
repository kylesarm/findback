"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cancelClaim } from "@/app/actions/claims";

function CancelButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit" className="btn-danger min-h-9 py-2 text-xs">
      {pending ? "Cancelling…" : "Cancel claim"}
    </button>
  );
}

export default function ClaimCancelForm({ claimId }) {
  const [state, formAction] = useActionState(cancelClaim, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-3">
      <input type="hidden" name="claimId" value={claimId} />
      {state?.error && <span className="text-xs font-medium text-rose-700" role="alert">{state.error}</span>}
      {state?.success && <span className="text-xs font-medium text-teal-700" role="status">{state.success}</span>}
      <CancelButton />
    </form>
  );
}

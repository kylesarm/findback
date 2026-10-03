"use client";
import { useActionState } from "react";
import { cancelClaim } from "@/app/actions/claims";
import ConfirmAction from "./ConfirmAction";

export default function ClaimCancelForm({ claimId }) {
  const [state, formAction] = useActionState(cancelClaim, null);
  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-end gap-3"
    >
      <input type="hidden" name="claimId" value={claimId} />
      {state?.error && (
        <span className="text-xs font-medium text-rose-700" role="alert">
          {state.error}
        </span>
      )}
      {state?.success && (
        <span className="text-xs font-medium text-emerald-700" role="status">
          {state.success}
        </span>
      )}
      <ConfirmAction
        className="btn-danger text-xs"
        title="Cancel this ownership claim?"
        description="Your claim will leave the verification queue. The claim record stays in your history with a cancelled status."
        confirmLabel="Cancel claim"
        pendingLabel="Cancelling…"
        danger
      >
        Cancel claim
      </ConfirmAction>
    </form>
  );
}

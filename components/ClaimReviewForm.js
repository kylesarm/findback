"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { reviewClaim } from "@/app/actions/claims";

const inputClass = "field-control";

function ReviewButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit" className="btn-primary text-xs">
      {pending ? "Saving decision…" : "Save decision"}
    </button>
  );
}

export default function ClaimReviewForm({ claimId }) {
  const [state, formAction] = useActionState(reviewClaim, null);

  return (
    <form action={formAction} className="mt-5 rounded-xl border border-teal-200 bg-teal-50/50 p-4 sm:p-5">
      <input type="hidden" name="claimId" value={claimId} />
      <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">Administrator decision</p><p className="mt-1 text-xs text-slate-500">Set the outcome and add a clear response for the claimant.</p></div>
      <div className="grid gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">Decision</span>
          <select className={inputClass} name="decision" defaultValue="under_review" required>
            <option value="under_review">Under review</option>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">Response to claimant</span>
          <textarea className={`${inputClass} min-h-10 resize-y`} name="response" maxLength={3000} placeholder="Required when rejecting; optional otherwise" />
        </label>
        <ReviewButton />
      </div>
      {state?.error && <p className="mt-3 text-xs font-medium text-rose-700" role="alert">{state.error}</p>}
      {state?.success && <p className="mt-3 text-xs font-medium text-teal-700" role="status">{state.success}</p>}
    </form>
  );
}

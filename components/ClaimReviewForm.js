"use client";
import { useActionState, useState } from "react";
import { reviewClaim } from "@/app/actions/claims";
import ConfirmAction from "./ConfirmAction";
import Icon from "./Icon";

const decisions = {
  under_review: {
    title: "Move this claim to review?",
    description:
      "The claimant will see that their proof is under review. No ownership approval is granted at this stage.",
    label: "Start review",
  },
  approved: {
    title: "Approve this ownership claim?",
    description:
      "Confirm that the private evidence supports ownership. Approval resolves the found item and rejects competing active claims. A Similarity Score is not sufficient evidence.",
    label: "Approve claim",
  },
  rejected: {
    title: "Reject this ownership claim?",
    description:
      "The claimant will receive your response explaining the decision. Make sure it is clear, helpful, and does not reveal the finder’s private verification details.",
    label: "Reject claim",
  },
};

export default function ClaimReviewForm({ claimId }) {
  const [state, formAction] = useActionState(reviewClaim, null);
  const [decision, setDecision] = useState("under_review");
  const selected = decisions[decision];
  return (
    <form
      action={formAction}
      className="mt-5 rounded-xl border border-brand-200 bg-brand-50/40 p-5"
    >
      <input type="hidden" name="claimId" value={claimId} />
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600">
          <Icon name="admin" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-brand-950">
            Record your decision
          </h3>
          <p className="mt-1 text-xs leading-6 text-slate-600">
            Base your decision on ownership proof and the private verification
            reference.
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-700">
            Verification status
          </span>
          <select
            className="field-control"
            name="decision"
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            required
          >
            <option value="under_review">Under review</option>
            <option value="approved">Approve claim</option>
            <option value="rejected">Reject claim</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-slate-700">
            Response to claimant
          </span>
          <textarea
            className="field-control min-h-24 resize-y"
            name="response"
            maxLength={3000}
            required={decision === "rejected"}
            placeholder={
              decision === "rejected"
                ? "Explain why the proof could not be verified."
                : "Add next steps or a helpful note (optional)."
            }
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <ConfirmAction
          title={selected.title}
          description={selected.description}
          confirmLabel={selected.label}
          danger={decision === "rejected"}
          pendingLabel="Saving decision…"
        >
          {selected.label}
        </ConfirmAction>
      </div>
      {state?.error && (
        <p className="mt-3 text-xs font-medium text-rose-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}

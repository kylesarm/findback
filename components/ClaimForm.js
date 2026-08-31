"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitClaim } from "@/app/actions/claims";
import FormField from "./FormField";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn-primary w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? "Submitting claim…" : "Submit ownership claim"}
    </button>
  );
}

export default function ClaimForm({ match = null, foundItem = null, backHref = "/matches" }) {
  const [state, formAction] = useActionState(submitClaim, null);
  const item = match?.foundItem || foundItem;
  const lostItem = match?.lostItem || null;

  if (!item) return null;

  if (state?.success) {
    return (
      <section className="surface-card p-6 text-center sm:p-9" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 text-2xl font-bold text-teal-700 ring-1 ring-inset ring-teal-100">✓</span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Claim submitted</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{state.success}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/claims">View my claims</Link>
          <Link className="btn-secondary" href={backHref}>Back to item</Link>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="surface-card p-5 sm:p-7">
      <input name="foundItemId" type="hidden" value={item.id} />
      <input name="lostItemId" type="hidden" value={lostItem?.id || ""} />

      <div className="border-b border-slate-100 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Private ownership proof</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Tell us what only the owner would know</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Your answers are saved with the claim for verification. They are not added to the public listing.</p>
      </div>

      {state?.error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}

      <div className="mt-6 space-y-6">
        <FormField label="Identifying details not shown publicly" hint="Required">
          <textarea className="field-control min-h-28 resize-y" name="identifyingDetails" minLength={3} maxLength={800} placeholder="Describe details that are not visible in the listing, such as a serial-number fragment, custom engraving, or exact model." required />
        </FormField>

        <FormField label="Distinguishing marks or contents" hint="Required">
          <textarea className="field-control min-h-28 resize-y" name="distinguishingFeatures" minLength={3} maxLength={800} placeholder="Mention scratches, stickers, hidden contents, accessories, or other distinctive features." required />
        </FormField>

        <FormField label="Why this item belongs to you" hint="Required">
          <textarea className="field-control min-h-32 resize-y" name="ownershipExplanation" minLength={3} maxLength={1000} placeholder="Explain when and where you lost it and why the found item matches your property." required />
        </FormField>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600">
        <input className="mt-1 size-4 shrink-0 accent-teal-700" name="declaration" type="checkbox" required />
        <span>I confirm that this information is accurate and that I am the rightful owner or authorized representative of this item.</span>
      </label>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
        <Link className="btn-secondary" href={backHref}>Cancel</Link>
        <SubmitButton />
      </div>
    </form>
  );
}

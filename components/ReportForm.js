"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createFoundItem, createLostItem } from "@/app/actions/reports";
import FormField from "./FormField";
import ImageUploadField from "./ImageUploadField";

const inputClass = "field-control";

function SubmitButton({ type }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit" className="btn-primary mt-4 w-full">
      {pending ? "Saving report…" : `Submit ${type} report`}
    </button>
  );
}

export default function ReportForm({ type }) {
  const isLost = type === "lost";
  const action = isLost ? createLostItem : createFoundItem;
  const [state, formAction] = useActionState(action, null);

  if (state?.success) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center sm:p-10" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-2xl text-teal-700 shadow-sm">✓</span>
        <h2 className="mt-5 text-2xl font-bold text-teal-950">Report saved</h2>
        <p className="mt-2 text-sm leading-6 text-teal-800">{state.success}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white">Return to dashboard</Link>
          <a href={isLost ? "/report-lost" : "/report-found"} className="rounded-xl border border-teal-300 bg-white px-5 py-3 text-sm font-bold text-teal-800">Create another report</a>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="surface-card space-y-6 p-5 sm:p-7">
        {state?.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Item name"><input className={inputClass} name="itemName" minLength={2} maxLength={120} placeholder="Enter a short item name" required /></FormField>
          <FormField label="Category"><select className={inputClass} name="category" defaultValue="" required><option value="" disabled>Select a category</option><option>Electronics</option><option>ID & cards</option><option>Bags</option><option>Clothing</option><option>Books & notes</option><option>Accessories</option><option>Bottles</option><option>Other</option></select></FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Brand" hint="Optional"><input className={inputClass} name="brand" maxLength={120} placeholder="e.g. Hydro Flask" /></FormField>
          <FormField label="Color" hint="Optional"><input className={inputClass} name="color" maxLength={80} placeholder="e.g. Matte black" /></FormField>
        </div>

        <FormField label="Public description" hint="10–2,000 characters"><textarea className={`${inputClass} min-h-32 resize-y`} name="description" minLength={10} maxLength={2000} placeholder="Describe visible features that can safely appear in the public listing." required /></FormField>

        {!isLost && (
          <FormField label="Finder-only verification details" hint="Private · optional">
            <textarea className={`${inputClass} min-h-28 resize-y`} name="privateDetails" minLength={3} maxLength={3000} placeholder="Record hidden contents, scratches, serial details, or other facts that can help verify the real owner." />
            <p className="mt-2 text-xs leading-5 text-slate-400">This information is not used for matching and is visible only to you and administrators during claim verification.</p>
          </FormField>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={isLost ? "Where did you last see it?" : "Where was it found?"}><input className={inputClass} name="location" minLength={2} maxLength={200} placeholder="Building or campus area" required /></FormField>
          <FormField label={isLost ? "Date lost" : "Date found"}><input className={inputClass} name="itemDate" type="date" required /></FormField>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <ImageUploadField name="itemImage" label="Item photo" help="Optional · JPEG, PNG, or WebP · maximum 5 MB" maxBytes={5 * 1024 * 1024} initials={isLost ? "LI" : "FI"} />
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5"><p className="font-bold text-teal-900">A good report helps.</p><ul className="mt-3 space-y-2 text-sm leading-6 text-teal-800"><li>• Use a short, clear item name.</li><li>• Describe only details safe for a public listing.</li><li>• Keep private ownership proof for the claim process.</li></ul></div>
        <div className="surface-card p-5"><p className="text-sm font-semibold text-slate-800">Ready to submit?</p><p className="mt-1 text-xs leading-5 text-slate-500">This report will be securely linked to your authenticated account.</p><SubmitButton type={type} /></div>
      </aside>
    </form>
  );
}

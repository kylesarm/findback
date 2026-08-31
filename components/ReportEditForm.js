"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateReport } from "@/app/actions/reports";
import FormField from "./FormField";
import ImageUploadField from "./ImageUploadField";

const categories = ["Electronics", "ID & cards", "Bags", "Clothing", "Books & notes", "Accessories", "Bottles", "Other"];

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending} type="submit">{pending ? "Saving changes…" : "Save changes"}</button>;
}

export default function ReportEditForm({ report }) {
  const [state, formAction] = useActionState(updateReport, null);
  const detailsHref = `/items/${report.type}/${report.id}`;
  const isFound = report.type === "found";

  if (state?.success) {
    return (
      <section className="surface-card p-6 text-center sm:p-10" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 text-2xl font-bold text-teal-700 ring-1 ring-inset ring-teal-100">✓</span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Report updated</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{state.success}</p>
        {state.warning && <p className="mx-auto mt-3 max-w-xl rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{state.warning}</p>}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link className="btn-primary" href={detailsHref}>View details</Link><Link className="btn-secondary" href="/profile">Back to activity</Link></div>
      </section>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <input name="reportType" type="hidden" value={report.type} />
      <input name="reportId" type="hidden" value={report.id} />

      <div className="surface-card space-y-6 p-5 sm:p-7">
        {state?.error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.error}</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Item name"><input className="field-control" name="itemName" minLength={2} maxLength={120} defaultValue={report.itemName} required /></FormField>
          <FormField label="Category"><select className="field-control" name="category" defaultValue={report.category} required>{categories.map((category) => <option key={category}>{category}</option>)}</select></FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Brand" hint="Optional"><input className="field-control" name="brand" maxLength={120} defaultValue={report.brand || ""} /></FormField>
          <FormField label="Color" hint="Optional"><input className="field-control" name="color" maxLength={80} defaultValue={report.color || ""} /></FormField>
        </div>

        <FormField label="Public description" hint="10–2,000 characters"><textarea className="field-control min-h-36 resize-y" name="description" minLength={10} maxLength={2000} defaultValue={report.description} required /></FormField>

        {isFound && <FormField label="Finder-only verification details" hint="Private · optional"><textarea className="field-control min-h-32 resize-y" name="privateDetails" minLength={3} maxLength={3000} defaultValue={report.privateDetails || ""} placeholder="Hidden contents, scratches, serial details, or other ownership proof." /><p className="mt-2 text-xs leading-5 text-slate-500">Only the original finder and administrators can read this information.</p></FormField>}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={isFound ? "Where was it found?" : "Where was it last seen?"}><input className="field-control" name="location" minLength={2} maxLength={200} defaultValue={report.location} required /></FormField>
          <FormField label={isFound ? "Date found" : "Date lost"}><input className="field-control" name="itemDate" type="date" defaultValue={report.itemDate} required /></FormField>
        </div>

        {report.isOwner ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <ImageUploadField name="itemImage" label="Replace item photo" help="Optional · JPEG, PNG, or WebP · maximum 5 MB" maxBytes={5 * 1024 * 1024} initialUrl={report.imageUrl} initials={report.type === "lost" ? "LI" : "FI"} />
            {report.imagePath && <label className="mt-4 flex items-start gap-3 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600"><input className="mt-1 size-4 accent-teal-700" name="removeImage" type="checkbox" /><span>Remove the current photo if no replacement is selected.</span></label>}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Administrators may edit report fields, but reporter-owned Storage images remain protected by the original owner&apos;s Storage policy.</div>
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="surface-card p-5"><p className="font-bold text-slate-900">System fields stay protected</p><p className="mt-2 text-xs leading-5 text-slate-500">The reporter, report status, created date, claim decisions, and other workflow-controlled values cannot be changed here.</p></div>
        <div className="surface-card p-5"><p className="text-sm font-semibold text-slate-800">Ready to save?</p><p className="mt-1 text-xs leading-5 text-slate-500">A replacement photo uploads first. FindBack updates the report before removing the previous owned image.</p><div className="mt-5 grid gap-2"><SaveButton /><Link className="btn-secondary" href={detailsHref}>Cancel</Link></div></div>
      </aside>
    </form>
  );
}

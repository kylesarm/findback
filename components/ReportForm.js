"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createFoundItem, createLostItem } from "@/app/actions/reports";
import FormField from "./FormField";
import FormSection from "./FormSection";
import ImageUploadField from "./ImageUploadField";
import Icon from "./Icon";

function SubmitButton({ type }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="btn-primary mt-5 w-full"
    >
      {pending ? "Saving report…" : `Submit ${type} report`}
      <Icon name="arrowRight" />
    </button>
  );
}

export default function ReportForm({ type }) {
  const isLost = type === "lost";
  const [state, formAction] = useActionState(
    isLost ? createLostItem : createFoundItem,
    null,
  );
  if (state?.success)
    return (
      <section
        className="surface-card mx-auto max-w-2xl p-7 text-center sm:p-12"
        role="status"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon name="check" className="size-7" />
        </span>
        <p className="eyebrow mt-6">One step closer</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Your report is live.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">{state.success}</p>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {isLost
            ? "Visit Possible Matches to compare available found items."
            : "Ownership claims will appear in your Claims workspace."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={isLost ? "/matches" : "/claims"} className="btn-primary">
            {isLost ? "View Possible Matches" : "Open Claims"}
          </Link>
          <a
            href={isLost ? "/report-lost" : "/report-found"}
            className="btn-secondary"
          >
            Create another report
          </a>
          <Link href="/dashboard" className="text-link justify-center">
            Dashboard
          </Link>
        </div>
      </section>
    );
  return (
    <form action={formAction} className="workspace-grid">
      <div className="surface-card min-w-0 overflow-hidden">
        {state?.error && (
          <p
            className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {state.error}
          </p>
        )}
        <FormSection
          number="01"
          title="Start with the essentials"
          description="Give the item a clear name and a few recognizable details."
          id="item-details"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Item name">
              <input
                className="field-control"
                name="itemName"
                minLength={2}
                maxLength={120}
                placeholder="What kind of item is it?"
                required
              />
            </FormField>
            <FormField label="Category">
              <select
                className="field-control"
                name="category"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {[
                  "Electronics",
                  "ID & cards",
                  "Bags",
                  "Clothing",
                  "Books & notes",
                  "Accessories",
                  "Bottles",
                  "Other",
                ].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Brand" hint="Optional">
              <input
                className="field-control"
                name="brand"
                maxLength={120}
                placeholder="e.g. Hydro Flask"
              />
            </FormField>
            <FormField label="Color" hint="Optional">
              <input
                className="field-control"
                name="color"
                maxLength={80}
                placeholder="e.g. Matte black"
              />
            </FormField>
          </div>
        </FormSection>
        <FormSection
          number="02"
          title="Pinpoint the moment"
          description="A location and date help connect the right reports."
          id="location-date"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={isLost ? "Last seen at" : "Found at"}>
              <input
                className="field-control"
                name="location"
                minLength={2}
                maxLength={200}
                placeholder="Building or campus area"
                required
              />
            </FormField>
            <FormField label={isLost ? "Date lost" : "Date found"}>
              <input
                className="field-control"
                name="itemDate"
                type="date"
                required
              />
            </FormField>
          </div>
        </FormSection>
        <FormSection
          number="03"
          title="Make it recognizable"
          description="These details and the photo are visible on the item listing."
          id="description-photo"
        >
          <FormField label="Public description" hint="10–2,000 characters">
            <textarea
              className="field-control min-h-32 resize-y"
              name="description"
              minLength={10}
              maxLength={2000}
              placeholder="Describe visible features. Keep personal information and hidden identifying details out of the public description."
              required
            />
          </FormField>
          <ImageUploadField
            name="itemImage"
            label="Item photo"
            help="Optional · JPEG, PNG, or WebP · maximum 5 MB"
            maxBytes={5 * 1024 * 1024}
            initials={isLost ? "LI" : "FI"}
          />
        </FormSection>
        {!isLost && (
          <FormSection
            number="04"
            title="Keep a private reference"
            description="Only you and administrators can see this information."
            id="private-reference"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-amber-800">
                <Icon name="lock" />
                For Claim Verification only
              </p>
              <FormField
                label="Finder-only verification details"
                hint="Optional"
              >
                <textarea
                  className="field-control min-h-28 resize-y"
                  name="privateDetails"
                  minLength={3}
                  maxLength={3000}
                  placeholder="Hidden contents, scratches, serial details, or other information that only the owner would know."
                />
              </FormField>
              <p className="mt-3 text-xs leading-6 text-amber-800">
                These details never appear in public listings or Weighted
                Similarity Matching.
              </p>
            </div>
          </FormSection>
        )}
      </div>
      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="surface-card p-5">
          <p className="eyebrow mb-4">Your report checklist</p>
          <ol className="space-y-3">
            {[
              ["item-details", "Item details"],
              ["location-date", "Location & date"],
              ["description-photo", "Description & photo"],
              ...(!isLost
                ? [["private-reference", "Private verification"]]
                : []),
            ].map(([id, label], index) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-3 text-xs font-medium text-slate-600 hover:text-brand-600"
                >
                  <span className="grid size-6 place-items-center rounded-md bg-slate-100 text-[10px]">
                    {index + 1}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-5">
          <Icon name="info" className="size-5 text-brand-600" />
          <h2 className="mt-3 text-sm font-semibold text-brand-950">
            Small details make a difference.
          </h2>
          <p className="mt-2 text-xs leading-6 text-brand-900">
            Use a specific campus location, a clear item name, and an accurate
            date. Keep ownership proof private.
          </p>
        </div>
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Ready to share?</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            Review your entries before submitting. You can edit your report
            later from Profile & activity.
          </p>
          <SubmitButton type={type} />
          <Link
            className="mt-3 block text-center text-xs font-medium text-slate-500 hover:text-brand-600"
            href="/dashboard"
          >
            Cancel and return
          </Link>
        </div>
      </aside>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/app/actions/profile";
import FormField from "@/components/FormField";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending} type="submit">
      {pending ? "Saving profile…" : "Save profile"}
    </button>
  );
}

export default function ProfileInformationForm({
  firstName,
  lastName,
  displayName,
  department,
  phone,
  email,
  campusId,
}) {
  const [state, formAction] = useActionState(updateProfile, null);

  return (
    <section
      id="account-information"
      className="surface-card scroll-mt-24 p-5 sm:p-7"
    >
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-bold text-slate-950">Account information</h2>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          Choose how you appear in Findmatch and keep your contact information
          up to date.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        {state?.error && (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {state.error}
          </p>
        )}
        {state?.success && (
          <p
            className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700"
            role="status"
          >
            {state.success}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="First name">
            <input
              className="field-control"
              name="firstName"
              autoComplete="given-name"
              minLength={1}
              maxLength={80}
              defaultValue={firstName || ""}
              required
            />
          </FormField>
          <FormField label="Last name">
            <input
              className="field-control"
              name="lastName"
              autoComplete="family-name"
              minLength={1}
              maxLength={80}
              defaultValue={lastName || ""}
              required
            />
          </FormField>
        </div>

        <FormField label="Display name" hint="Optional">
          <input
            className="field-control"
            name="displayName"
            autoComplete="nickname"
            maxLength={120}
            defaultValue={displayName || ""}
            placeholder="Name shown in your Findmatch workspace"
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Department" hint="Optional">
            <input
              className="field-control"
              name="department"
              maxLength={120}
              defaultValue={department || ""}
              placeholder="e.g. College of Engineering"
            />
          </FormField>
          <FormField label="Phone number" hint="Optional · private">
            <input
              className="field-control"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              defaultValue={phone || ""}
              placeholder="e.g. +63 912 345 6789"
            />
          </FormField>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Campus email
            </p>
            <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
              {email}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Student or employee ID
            </p>
            <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
              {campusId}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          <p className="max-w-lg text-xs leading-6 text-slate-500">
            Your phone number and contact information never appear on public
            item listings.
          </p>
          <SaveButton />
        </div>
      </form>
    </section>
  );
}

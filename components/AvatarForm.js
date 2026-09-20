"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { removeAvatar, updateAvatar } from "@/app/actions/profile";
import ImageUploadField from "./ImageUploadField";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending} type="submit">{pending ? "Saving avatar…" : "Save avatar"}</button>;
}

function RemoveButton() {
  const { pending } = useFormStatus();
  return <button className="btn-danger min-h-10" disabled={pending} type="submit">{pending ? "Removing…" : "Remove avatar"}</button>;
}

export default function AvatarForm({ avatarUrl, initials, hasAvatar }) {
  const [updateState, updateAction] = useActionState(updateAvatar, null);
  const [removeState, removeAction] = useActionState(removeAvatar, null);

  return (
    <section className="surface-card p-5 sm:p-7">
      <div className="border-b border-slate-100 pb-5"><h2 className="font-bold text-slate-950">Profile photo</h2><p className="mt-1 text-xs leading-5 text-slate-500">Your avatar appears in the dashboard header and account navigation.</p></div>
      <form action={updateAction} className="mt-5">
        <ImageUploadField name="avatar" label="Upload an avatar" help="JPEG, PNG, or WebP · maximum 2 MB" maxBytes={2 * 1024 * 1024} initialUrl={avatarUrl} initials={initials} compact />
        {updateState?.error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{updateState.error}</p>}
        {updateState?.success && <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700" role="status">{updateState.success}</p>}
        <div className="mt-5"><SaveButton /></div>
      </form>
      {hasAvatar && <form action={removeAction} className="mt-5 border-t border-slate-100 pt-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-slate-800">Remove profile photo</p><p className="mt-1 text-xs text-slate-500">FindMatch will return to showing your initials.</p></div><RemoveButton /></div>{removeState?.error && <p className="mt-3 text-xs font-medium text-rose-700" role="alert">{removeState.error}</p>}{removeState?.success && <p className="mt-3 text-xs font-medium text-teal-700" role="status">{removeState.success}</p>}</form>}
    </section>
  );
}

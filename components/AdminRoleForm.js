"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserRole } from "@/app/actions/admin";

function SaveRoleButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn-secondary min-h-9 px-3 py-2 text-xs"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving…" : "Save role"}
    </button>
  );
}

export default function AdminRoleForm({ userId, currentRole, isCurrentAdmin }) {
  const [state, formAction] = useActionState(updateUserRole, null);

  if (isCurrentAdmin) {
    return (
      <p className="text-xs font-semibold text-slate-500">
        Current administrator
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-3 border-t border-slate-100 pt-3">
      <input name="userId" type="hidden" value={userId} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Account role</span>
          <select
            className="field-control min-h-9 py-2 text-xs"
            defaultValue={currentRole}
            name="role"
          >
            <option value="user">User</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
        <SaveRoleButton />
      </div>
      {state?.error && (
        <p className="mt-2 text-xs font-medium text-rose-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-2 text-xs font-medium text-brand-700" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}

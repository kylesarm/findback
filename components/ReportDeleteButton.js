"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteReport } from "@/app/actions/reports";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return <button className="btn-danger" disabled={pending} type="submit">{pending ? "Deleting…" : "Delete report"}</button>;
}

export default function ReportDeleteButton({ report, adminModeration = false }) {
  const [state, formAction] = useActionState(deleteReport, null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (state?.success) dialogRef.current?.close();
  }, [state]);

  return (
    <div>
      <button className="btn-danger min-h-9 px-3 py-2 text-xs" type="button" onClick={() => dialogRef.current?.showModal()}>Delete</button>
      {state?.error && <p className="mt-2 max-w-xs text-xs leading-5 text-rose-700" role="alert">{state.error}</p>}
      {state?.warning && <p className="mt-2 max-w-xs text-xs leading-5 text-amber-700" role="status">{state.warning}</p>}

      <dialog ref={dialogRef} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55">
        <form action={formAction} className="p-6 sm:p-7">
          <input name="reportType" type="hidden" value={report.type} />
          <input name="reportId" type="hidden" value={report.id} />
          <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-lg font-bold text-rose-700 ring-1 ring-inset ring-rose-100">!</span>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">Delete this {report.type} report?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-800">{report.itemName}</span> will be removed permanently. {adminModeration ? "The reporter-owned Storage image remains protected and is not deleted by another account." : "Its owned Storage image will also be deleted."}</p>
          {report.type === "found" && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Deletion is blocked if any pending, reviewed, cancelled, rejected, or approved claim is linked to this item. This protects claim history.</p>}
          {state?.error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800" role="alert">{state.error}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="btn-secondary" type="button" onClick={() => dialogRef.current?.close()}>Keep report</button>
            <ConfirmDeleteButton />
          </div>
        </form>
      </dialog>
    </div>
  );
}

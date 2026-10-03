"use client";
import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import Icon from "./Icon";

export default function ConfirmAction({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  pendingLabel = "Saving…",
  danger = false,
  className = "btn-primary",
}) {
  const dialog = useRef(null);
  const trigger = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const { pending } = useFormStatus();
  function open(event) {
    event.preventDefault();
    if (trigger.current?.form?.reportValidity()) dialog.current?.showModal();
  }
  function confirm() {
    const form = trigger.current?.form;
    dialog.current?.close();
    form?.requestSubmit(trigger.current);
  }
  return (
    <>
      <button
        ref={trigger}
        type="submit"
        disabled={pending}
        className={className}
        onClick={open}
      >
        {pending ? pendingLabel : children}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-7"
      >
        <span
          className={`grid size-11 place-items-center rounded-xl ${danger ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-600"}`}
        >
          <Icon name={danger ? "info" : "admin"} className="size-5" />
        </span>
        <h2 id={titleId} className="mt-5 text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-7 text-slate-500">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            autoFocus
            type="button"
            className="btn-secondary"
            onClick={() => dialog.current?.close()}
          >
            Go back
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={confirm}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}

"use client";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function ErrorPage({ retry }) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70dvh] max-w-xl items-center px-5 py-12"
    >
      <section className="surface-card w-full p-8 text-center" role="alert">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <Icon name="info" className="size-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          We couldn’t load this page.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Please try again in a moment. Your saved reports and claims remain in
          your account.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="btn-primary" onClick={retry}>
            Try again
          </button>
          <Link className="btn-secondary" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

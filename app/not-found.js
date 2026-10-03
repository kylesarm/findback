import Link from "next/link";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-16 text-center"
    >
      <Brand />
      <div className="surface-card mt-10 w-full max-w-lg p-8 sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name="browse" className="size-7" />
        </span>
        <p className="eyebrow mt-7">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-slate-950">
          This page got a little lost.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          The link may be outdated, or the report may no longer be available.
          Let’s get you back to the community board.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-primary" href="/browse">
            Browse items
            <Icon name="arrowRight" />
          </Link>
          <Link className="btn-secondary" href="/">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

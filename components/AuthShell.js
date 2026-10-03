import Link from "next/link";
import Brand from "./Brand";
import Icon from "./Icon";
import BrandVisual from "./BrandVisual";

export default function AuthShell({ title, description, children, alternate }) {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh bg-white lg:grid-cols-[1fr_.9fr]"
    >
      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-brand-600"
          >
            Back to home
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[420px] py-12">
          <p className="eyebrow mb-3">Your campus. Connected.</p>
          <h1 className="text-3xl font-semibold tracking-[-.04em] text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-7 text-center text-sm text-slate-500">
            {alternate.text}{" "}
            <Link
              className="font-semibold text-brand-600 hover:underline"
              href={alternate.href}
            >
              {alternate.label}
            </Link>
          </p>
        </div>
        <p className="flex items-center gap-2 text-[11px] text-slate-500">
          <Icon name="lock" className="size-3" />
          Your information stays protected with Findmatch.
        </p>
      </section>
      <section className="brand-panel relative m-4 hidden overflow-hidden rounded-[32px] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
        <p className="relative flex items-center gap-2 text-xs text-slate-300">
          <span className="size-2 rounded-full bg-teal-300" />A better way
          to find your way back
        </p>
        <div className="relative py-8">
          <h2 className="max-w-md text-4xl font-medium leading-[1.16] tracking-[-.04em] xl:text-5xl">
            Lost is a moment.
            <br />
            <span className="text-teal-300">Found is a connection.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Report a missing item, discover Possible Matches, and help
            belongings get back to the people who need them.
          </p>
          <BrandVisual dark />
        </div>
        <div className="relative border-t border-white/10 pt-6">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="admin" className="size-4 text-teal-300" />
            Similarity starts the search. Verification completes it.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Every ownership claim is reviewed separately. A Similarity Score
            never proves ownership.
          </p>
        </div>
      </section>
    </main>
  );
}

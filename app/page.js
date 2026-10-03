import Link from "next/link";
import Icon from "@/components/Icon";
import BrandVisual from "@/components/BrandVisual";
import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/EmptyState";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { getRecentListings } from "@/lib/data/items";

const steps = [
  [
    "01",
    "Report what happened.",
    "Share the item, the place, and the details that matter. A clear report is where every return begins.",
    "lost",
  ],
  [
    "02",
    "Find the connection.",
    "Explore possible matches to see which found items share details with your report.",
    "matches",
  ],
  [
    "03",
    "Verify. Then reunite.",
    "Submit private ownership proof for administrator review before an item is returned.",
    "admin",
  ],
];

export default async function Home() {
  const recentListings = await getRecentListings();
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PublicHeader />
      <main id="main-content">
        <section className="brand-hero relative overflow-hidden border-b border-brand-100">
          <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:gap-16 lg:py-20">
            <div className="min-w-0">
              <p className="eyebrow mb-5 flex items-center gap-2">
                <span className="size-2 rounded-full bg-teal-500" />A little
                less lost. A lot more connected.
              </p>
              <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.08] tracking-[-.055em] sm:text-6xl lg:text-[4.5rem]">
                Find what you lost.
                <br />
                <span className="text-brand-700">
                  Return what
                  <br className="hidden lg:block" /> you found.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
                Your campus, looking out for you. Report lost belongings,
                discover Possible Matches, and return items through secure Claim
                Verification.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary min-h-12 px-5" href="/report-lost">
                  <Icon name="search" />I lost something
                  <Icon name="arrowRight" />
                </Link>
                <Link
                  className="btn-found min-h-12 px-5"
                  href="/report-found"
                >
                  <Icon name="found" />I found something
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="admin" className="size-3.5 text-brand-600" />
                  Private ownership proof
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="profile" className="size-3.5 text-brand-600" />
                  Built for campus life
                </span>
              </div>
            </div>
            <BrandVisual />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="section-heading">
            <div>
              <p className="eyebrow mb-2">Around campus</p>
              <h2 className="!text-2xl !font-semibold tracking-tight sm:!text-3xl">
                Recently reported
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Something familiar might be waiting here.
              </p>
            </div>
            <Link className="text-link" href="/browse">
              Explore all items
              <Icon name="arrowRight" />
            </Link>
          </div>
          {recentListings.items.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentListings.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recentListings.error ? "info" : "browse"}
              error={Boolean(recentListings.error)}
              title={
                recentListings.error
                  ? "Recent reports are unavailable"
                  : "No recently reported items yet"
              }
              description={
                recentListings.error ||
                "Be the first to help something find its way back."
              }
              href="/report-found"
              action="Report an item"
            />
          )}
        </section>
        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-brand-50"
        >
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="max-w-xl">
              <p className="eyebrow">Simple by design</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                A better way back.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                From the first report to the final verification, you always know
                what comes next.
              </p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(([n, title, copy, icon]) => (
                <article key={n} className="surface-card p-7">
                  <div className="flex items-center justify-between">
                    <Icon name={icon} className="size-6 text-teal-700" />
                    <span className="text-xs font-medium text-slate-500">
                      {n} / 03
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] brand-panel p-7 text-white sm:p-12 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-semibold text-teal-300">
                Small actions. Meaningful returns.
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-.04em] sm:text-4xl">
                Be someone’s good news.
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Your next report could make someone’s day.
              </p>
            </div>
            <Link
              href="/register"
              className="btn-secondary min-h-12 shrink-0 border-transparent px-6"
            >
              Join Findmatch
              <Icon name="arrowRight" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

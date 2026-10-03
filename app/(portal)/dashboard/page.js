import Link from "next/link";
import Icon from "@/components/Icon";
import ItemCard from "@/components/ItemCard";
import ItemImage from "@/components/ItemImage";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { getClaimsWorkspace } from "@/lib/data/claims";
import { getRecentListings } from "@/lib/data/items";
import { getPossibleMatches } from "@/lib/data/matches";
import { getCurrentProfile, getUserDisplay, requireUser } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = getUserDisplay(await requireUser(), await getCurrentProfile());
  const [matchData, claimData, recentListings] = await Promise.all([
    getPossibleMatches(),
    getClaimsWorkspace(),
    getRecentListings(),
  ]);
  const bestMatch = matchData.matches[0];
  const openClaims = claimData.claims.filter((claim) =>
    ["pending", "under_review"].includes(claim.status),
  );
  const stats = [
    {
      label: "Active lost reports",
      value: matchData.error ? "—" : matchData.lostItemCount,
      note: "Your reports in the matching pool",
      icon: "lost",
      href: "/profile#lost-reports",
    },
    {
      label: "Possible Matches",
      value: matchData.error ? "—" : matchData.matches.length,
      note: `Similarity Scores of ${matchData.minimumScore}% or higher`,
      icon: "matches",
      href: "/matches",
    },
    {
      label: "Open claims",
      value: claimData.error ? "—" : openClaims.length,
      note: "Pending or under verification",
      icon: "claims",
      href: "/claims",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Your campus workspace"
        title={`Welcome back, ${user.firstName}.`}
        description="A little clarity on your reports, matches, and next steps."
      />
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/report-lost"
          className="group flex items-center gap-4 rounded-2xl bg-navy p-5 text-white sm:p-6"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
            <Icon name="search" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">
              Lost something?
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-300">
              Let your campus help you find it.
            </span>
          </span>
          <Icon
            name="arrowRight"
            className="size-5 shrink-0 text-brand-300 transition group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/report-found"
          className="surface-card group flex items-center gap-4 p-5 transition hover:border-brand-200 sm:p-6"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name="found" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-slate-900">
              Found something?
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Help it get back to the right person.
            </span>
          </span>
          <Icon
            name="arrowRight"
            className="size-5 shrink-0 text-brand-600 transition group-hover:translate-x-1"
          />
        </Link>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="surface-card p-5 sm:p-6">
          <div className="section-heading">
            <div>
              <h2>Active lost reports</h2>
              <p className="mt-1 text-xs text-slate-500">
                Keep an eye on the things you’re looking for.
              </p>
            </div>
            <Link href="/profile#lost-reports" className="text-link">
              My reports
              <Icon name="arrowRight" />
            </Link>
          </div>
          {matchData.lostReports.length ? (
            <div className="divide-y divide-slate-100">
              {matchData.lostReports.slice(0, 3).map((item) => (
                <Link
                  href={`/items/lost/${item.reportId}`}
                  key={item.id}
                  className="flex items-center gap-3 py-4"
                >
                  <ItemImage
                    src={item.imageUrl}
                    name={item.title}
                    className="size-14 shrink-0 rounded-xl"
                    compact
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.location} · {item.date}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">
              <Icon name="lost" className="mx-auto size-7 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                {matchData.error || "No active lost reports."}
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                Your submitted lost reports will appear here.
              </p>
            </div>
          )}
        </div>
        <div className="surface-card flex flex-col p-5 sm:p-6">
          <div className="section-heading">
            <h2>Matching spotlight</h2>
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name="matches" />
            </span>
          </div>
          {bestMatch ? (
            <>
              <div className="flex items-center gap-4 rounded-xl bg-brand-50 p-4">
                <div className="text-3xl font-semibold tracking-tight text-brand-700">
                  {bestMatch.score}
                  <span className="text-base">%</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-900">
                    Similarity Score
                  </p>
                  <p className="mt-1 text-xs text-brand-700">
                    Your strongest Possible Match
                  </p>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {bestMatch.foundItem.itemName}
              </h3>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                Compared with your lost {bestMatch.lostItem.itemName}.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-600">
                {bestMatch.reasons.slice(0, 2).join(" · ")}
              </p>
              <Link className="btn-primary mt-5" href="/matches">
                Compare items
                <Icon name="arrowRight" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                The search continues.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {matchData.error ||
                  "New found reports are compared with your active lost reports. Check here for connections worth a closer look."}
              </p>
              <Link className="btn-secondary mt-5" href="/matches">
                Open Possible Matches
                <Icon name="arrowRight" />
              </Link>
            </>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-[11px] leading-5 text-slate-500">
            <Icon name="info" className="size-3.5 shrink-0" />
            Similarity is not proof of ownership.
          </p>
        </div>
      </section>
      <section className="mt-9">
        <div className="section-heading">
          <div>
            <h2>Recently reported</h2>
            <p className="mt-1 text-xs text-slate-500">
              The latest from your campus community.
            </p>
          </div>
          <Link href="/browse" className="text-link">
            Browse all
            <Icon name="arrowRight" />
          </Link>
        </div>
        {recentListings.items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recentListings.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              recentListings.error
                ? "Recent reports are unavailable"
                : "No recently reported items yet"
            }
            description={
              recentListings.error ||
              "New lost and found reports will appear here."
            }
            error={Boolean(recentListings.error)}
          />
        )}
      </section>
    </>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "@/components/Icon";
import ItemCard from "@/components/ItemCard";
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
  const matchedLostItems = new Set(matchData.matches.map((match) => match.lostItem.id)).size;
  const openClaims = claimData.claims.filter((claim) => claim.status === "pending" || claim.status === "under_review");
  const dashboardStats = [
    {
      label: "Active lost reports",
      value: String(matchData.lostItemCount),
      note: matchData.lostItemCount === 1 ? "1 report being compared" : `${matchData.lostItemCount} reports being compared`,
      icon: "lost",
    },
    {
      label: "Possible Matches",
      value: String(matchData.matches.length),
      note: matchData.error
        ? "Weighted Similarity Matching is temporarily unavailable"
        : matchedLostItems > 0
          ? `Across ${matchedLostItems} lost ${matchedLostItems === 1 ? "report" : "reports"}`
          : `No Similarity Scores at or above ${matchData.minimumScore}% yet`,
      icon: "matches",
    },
    {
      label: "Open claims",
      value: claimData.error ? "—" : String(openClaims.length),
      note: claimData.error
        ? "Claims are temporarily unavailable"
        : openClaims.length === 1
          ? "1 claim awaiting a decision"
          : `${openClaims.length} claims awaiting decisions`,
      icon: "claims",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Your overview"
        title={`Good morning, ${user.firstName}`}
        description="Here’s what is happening with your reports, Similarity Scores, and Possible Matches."
        action={(
          <div className="flex gap-2">
            <Link className="btn-secondary" href="/report-found"><Icon name="found" />Report found</Link>
            <Link className="btn-primary" href="/report-lost"><Icon name="lost" />Report lost</Link>
          </div>
        )}
      />

      <section className="grid gap-3 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <article className="surface-card p-4 sm:p-5" key={stat.label}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name={stat.icon} className="size-[18px]" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold tracking-[-0.03em] text-slate-950">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="surface-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Your recent reports</h2>
              <p className="mt-1 text-xs text-slate-500">Track updates to items you posted.</p>
            </div>
            <Link className="text-sm font-bold text-teal-700" href="/browse">View all →</Link>
          </div>
          <div className="space-y-3">
            {matchData.lostReports.length > 0 ? matchData.lostReports.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                {item.imageUrl ? <img className="size-12 shrink-0 rounded-xl object-cover" src={item.imageUrl} alt={`${item.title} lost item`} /> : <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${item.color} text-xs font-bold text-white`}>{item.mark}</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{item.location} · {item.date}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold capitalize text-amber-700">{item.status}</span>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {matchData.error || "You have no active lost reports yet."}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 text-white shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/20"><Icon name="matches" className="size-5" /></span>
          {bestMatch ? (
            <>
              <p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-300">Top Possible Match · Similarity Score {bestMatch.score}%</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Your lost {bestMatch.lostItem.itemName} may match {bestMatch.foundItem.itemName}.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{bestMatch.reasons.slice(0, 2).join(" · ")}</p>
              <Link href="/matches" className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-slate-950">Review Possible Match</Link>
            </>
          ) : (
            <>
              <p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-300">Weighted Similarity Matching</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">No Possible Matches yet.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {matchData.error || `FindMatch will show a Possible Match when its Similarity Score reaches the ${matchData.minimumScore}% minimum.`}
              </p>
              <Link href="/matches" className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-slate-950">Open Possible Matches</Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold">Recently reported</h2>
            <p className="mt-1 text-xs text-slate-500">Latest items shared by the campus community.</p>
          </div>
          <Link className="text-sm font-bold text-teal-700" href="/browse">Browse all →</Link>
        </div>
        {recentListings.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentListings.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="empty-state py-12">
            <p className="font-semibold text-slate-700">{recentListings.error || "No recently reported items yet."}</p>
            <p className="mt-2 text-sm text-slate-500">New lost and found reports will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}

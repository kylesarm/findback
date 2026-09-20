/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { getPossibleMatches } from "@/lib/data/matches";

export const metadata = { title: "Possible Matches" };

const categoryGradients = {
  Electronics: "from-slate-400 to-slate-700",
  "ID & cards": "from-sky-500 to-blue-700",
  Bags: "from-emerald-500 to-teal-800",
  Clothing: "from-violet-500 to-purple-700",
  "Books & notes": "from-amber-400 to-orange-600",
  Accessories: "from-rose-400 to-violet-600",
  Bottles: "from-cyan-500 to-teal-800",
  Other: "from-slate-500 to-slate-800",
};

function itemMark(name) {
  return String(name || "Item").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function formatDate(value) {
  if (!value) return "Date not provided";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function EmptyMatches({ lostItemCount, minimumScore }) {
  const hasLostItems = lostItemCount > 0;

  return (
    <section className="empty-state">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name="matches" className="size-5" /></span>
      <h2 className="mt-5 text-lg font-bold text-slate-900">{hasLostItems ? "No Possible Matches yet" : "Report a lost item to begin Weighted Similarity Matching"}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{hasLostItems ? `No available found item currently reaches the minimum Similarity Score of ${minimumScore}%. New reports will be evaluated automatically.` : "FindMatch needs at least one active lost-item report before Weighted Similarity Matching can begin."}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link className="btn-primary" href="/report-lost">Report a lost item</Link><Link className="btn-secondary" href="/browse">Browse items</Link></div>
    </section>
  );
}

export default async function MatchesPage() {
  const { matches, lostItemCount, minimumScore, error } = await getPossibleMatches();

  return (
    <>
      <PageHeader eyebrow="Weighted Similarity Matching" title="Possible Matches" description="FindMatch calculates a Similarity Score by comparing category, brand, color, location, date, and description keywords." />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[#0b1220] px-3 py-2 text-xs font-bold text-white">{matches.length} {matches.length === 1 ? "Possible Match" : "Possible Matches"}</span>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">Minimum Similarity Score: {minimumScore}%</span>
      </div>

      {error ? (
        <section className="surface-card border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><div className="flex gap-3"><Icon name="info" className="mt-0.5 size-5 shrink-0" /><div><h2 className="font-bold">Weighted Similarity Matching is temporarily unavailable</h2><p className="mt-1 leading-6">{error}</p></div></div></section>
      ) : matches.length === 0 ? (
        <EmptyMatches lostItemCount={lostItemCount} minimumScore={minimumScore} />
      ) : (
        <section className="space-y-4">
          {matches.map((match, index) => (
            <article key={match.id} className="surface-card overflow-hidden transition hover:border-slate-300 hover:shadow-md">
              <div className="grid lg:grid-cols-[150px_1fr_190px]">
                <Link href={`/items/found/${match.foundItem.id}`} className={`group relative grid min-h-36 place-items-center overflow-hidden bg-gradient-to-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${categoryGradients[match.foundItem.category] || categoryGradients.Other}`} aria-label={`View found item: ${match.foundItem.itemName}`}>
                  {match.foundItem.imageUrl ? <img className="absolute inset-0 size-full object-cover" src={match.foundItem.imageUrl} alt={`${match.foundItem.itemName} found item`} /> : <span className="grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold text-white shadow-sm">{itemMark(match.foundItem.itemName)}</span>}
                  <div className="absolute inset-0 bg-slate-950/10" />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm">Found</span>
                </Link>

                <Link href={`/items/found/${match.foundItem.id}`} className="block p-5 transition hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">{match.foundItem.category}</span>{index === 0 && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">Top Possible Match</span>}</div>
                  <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-950">{match.foundItem.itemName}</h2>
                  <p className="mt-1 text-sm text-slate-500">Compared with your lost <span className="font-semibold text-slate-700">{match.lostItem.itemName}</span></p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Icon name="location" className="size-3.5" />{match.foundItem.location}</span><span className="flex items-center gap-1.5"><Icon name="calendar" className="size-3.5" />{formatDate(match.foundItem.itemDate)}</span></div>
                  <div className="mt-4 flex flex-wrap gap-2" aria-label="Similarity Score contributors">{match.reasons.map((reason) => <span key={reason} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-semibold text-teal-800"><Icon name="check" className="size-3" />{reason}</span>)}</div>
                </Link>

                <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
                  <Link href={`/items/found/${match.foundItem.id}`} className="-m-2 block rounded-xl p-2 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Similarity Score</p><div className="mt-2 flex items-end gap-1"><span className="text-4xl font-bold tracking-[-0.05em] text-slate-950">{match.score}</span><span className="mb-1 text-sm font-bold text-teal-700">%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-600" style={{ width: `${match.score}%` }} /></div></Link>
                  <div className="mt-6 grid gap-2"><Link href={`/matches/${match.foundItem.id}/claim?lost=${match.lostItem.id}`} className="btn-primary text-xs">Review Possible Match</Link><Link href={`/items/found/${match.foundItem.id}`} className="btn-secondary min-h-9 text-xs">View item</Link></div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

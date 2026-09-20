/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import ClaimForm from "@/components/ClaimForm";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { getPossibleMatches } from "@/lib/data/matches";

export const metadata = { title: "Claim Verification" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ClaimMatchPage({ params, searchParams }) {
  const { foundItemId } = await params;
  const query = await searchParams;
  const lostItemId = typeof query.lost === "string" ? query.lost : "";

  if (!UUID_PATTERN.test(foundItemId) || !UUID_PATTERN.test(lostItemId)) {
    notFound();
  }

  const matchData = await getPossibleMatches();
  const match = matchData.matches.find((candidate) => (
    candidate.foundItem.id === foundItemId && candidate.lostItem.id === lostItemId
  ));

  if (!match) {
    return (
      <>
        <PageHeader eyebrow="Claim Verification" title="Possible Match unavailable" description="This Possible Match may no longer meet the minimum Similarity Score, or the found item may no longer be available." />
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
          <p>{matchData.error || "Return to Possible Matches to review the latest results."}</p>
          <Link className="mt-5 inline-block rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white" href="/matches">Back to Possible Matches</Link>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Claim Verification" title="Submit an ownership claim" description="Review this Possible Match, then provide private ownership information for Claim Verification." />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <aside className="space-y-4">
          <section className="surface-card p-5">
            {match.foundItem.imageUrl && <img className="mb-5 aspect-[16/9] w-full rounded-xl object-cover" src={match.foundItem.imageUrl} alt={`${match.foundItem.itemName} found item`} />}
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Similarity Score</p><p className="mt-0.5 text-2xl font-bold tracking-[-0.04em] text-teal-700">{match.score}%</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{match.foundItem.category}</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{match.foundItem.itemName}</h2>
            <p className="mt-2 text-sm text-slate-500">Found at {match.foundItem.location} · {formatDate(match.foundItem.itemDate)}</p>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-500">Compared with your lost report</p>
              <p className="mt-1 font-bold text-slate-800">{match.lostItem.itemName}</p>
            </div>
            <ul className="mt-5 space-y-2 text-xs leading-5 text-slate-600">
              {match.reasons.map((reason) => <li className="flex items-center gap-2" key={reason}><span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700"><Icon name="check" className="size-3" /></span>{reason}</li>)}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <p className="font-bold">Keep proof specific and private.</p>
            <p className="mt-2">Do not rely only on details already visible in the public listing. Administrators will compare your proof with finder-only verification information when available.</p>
          </section>
        </aside>

        <ClaimForm match={match} />
      </div>
    </>
  );
}

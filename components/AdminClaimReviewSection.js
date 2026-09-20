import Icon from "@/components/Icon";
import ClaimReviewForm from "@/components/ClaimReviewForm";
import ClaimStatusBadge from "@/components/ClaimStatusBadge";

function formatDate(value) {
  if (!value) return "Not reviewed";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function AdminClaimReviewSection({ claims, error }) {
  if (error) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm"><h2 className="font-bold">Review queue unavailable</h2><p className="mt-2">{error}</p></div>;
  }

  if (claims.length === 0) {
    return <div className="empty-state"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name="check" className="size-5" /></span><h2 className="mt-5 text-lg font-bold">No claims to review</h2><p className="mt-2 text-sm text-slate-500">Submitted ownership claims will appear here.</p></div>;
  }

  return (
    <div className="space-y-5">
      {claims.map((claim) => {
        const active = claim.status === "pending" || claim.status === "under_review";

        return (
          <article key={claim.id} className="surface-card p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-700">{claim.foundItem.category}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{claim.foundItem.itemName}</h2>
                <p className="mt-1 text-xs text-slate-500">Claimant: {claim.claimant?.name || "Claimant"} · {claim.claimant?.email || "Email unavailable"}</p>
                <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(claim.createdAt)} · Found at {claim.foundItem.location}</p>
              </div>
              <ClaimStatusBadge status={claim.status} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"><Icon name="profile" className="size-3.5" />Claimant proof</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{claim.proofDescription}</p>
              </section>
              <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700"><Icon name="lock" className="size-3.5" />Finder-only verification details</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">{claim.privateDetails || "The finder did not provide private verification details for this report."}</p>
              </section>
            </div>

            <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-xs font-bold text-slate-700">View public found-item description</summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{claim.foundItem.description}</p>
            </details>

            {claim.adminResponse && <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-sky-700">Current administrator response</p><p className="mt-2 text-sm text-sky-900">{claim.adminResponse}</p><p className="mt-2 text-xs text-sky-700">Updated {formatDate(claim.reviewedAt)}</p></div>}
            {active && <ClaimReviewForm claimId={claim.id} />}
          </article>
        );
      })}
    </div>
  );
}

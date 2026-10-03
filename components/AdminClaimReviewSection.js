import Link from "next/link";
import Icon from "./Icon";
import EmptyState from "./EmptyState";
import ClaimReviewForm from "./ClaimReviewForm";
import ClaimStatusBadge from "./ClaimStatusBadge";

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Not reviewed";
}
export default function AdminClaimReviewSection({ claims, error }) {
  if (error)
    return (
      <EmptyState
        title="Review queue unavailable"
        description={error}
        icon="info"
        error
      />
    );
  if (!claims.length)
    return (
      <EmptyState
        title="Your review queue is clear."
        description="New ownership claims will appear here for careful verification."
        icon="check"
      />
    );
  return (
    <div className="space-y-6">
      {claims.map((claim) => {
        const active = ["pending", "under_review"].includes(claim.status);
        return (
          <article key={claim.id} className="surface-card overflow-hidden">
            <header className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:p-6">
              <div className="min-w-0">
                <p className="eyebrow">{claim.foundItem.category}</p>
                <h2 className="mt-2 break-words text-xl font-semibold tracking-tight">
                  <Link
                    href={`/items/found/${claim.foundItem.id}`}
                    className="hover:text-brand-600"
                  >
                    {claim.foundItem.itemName}
                  </Link>
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Icon name="location" className="size-3.5" />
                    {claim.foundItem.location}
                  </span>
                  <span>Submitted {formatDate(claim.createdAt)}</span>
                </div>
              </div>
              <ClaimStatusBadge status={claim.status} />
            </header>
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500">
                  <Icon name="profile" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Submitted by
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {claim.claimant?.name || "Claimant"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {claim.claimant?.email || "Email unavailable"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                    <Icon name="claims" />
                    Claimant’s ownership proof
                  </div>
                  <p className="whitespace-pre-wrap break-words p-4 text-sm leading-7 text-slate-600">
                    {claim.proofDescription}
                  </p>
                </section>
                <section className="min-w-0 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/30">
                  <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                    <Icon name="lock" />
                    Private verification reference
                  </div>
                  <p className="whitespace-pre-wrap break-words p-4 text-sm leading-7 text-amber-950">
                    {claim.privateDetails ||
                      "The finder did not provide private verification details for this report."}
                  </p>
                  <p className="px-4 pb-4 text-[11px] leading-6 text-amber-800">
                    Restricted to the finder and administrators. Never copy
                    these details into the claimant response.
                  </p>
                </section>
              </div>
              <details className="group mt-4 rounded-xl border border-slate-200">
                <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-4 text-xs font-semibold text-slate-600">
                  Public report details
                  <Icon
                    name="chevronDown"
                    className="size-4 group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-slate-100 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {claim.foundItem.description}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <dt className="text-slate-500">Brand</dt>
                      <dd className="mt-1 font-medium">
                        {claim.foundItem.brand || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Color</dt>
                      <dd className="mt-1 font-medium">
                        {claim.foundItem.color || "Not provided"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </details>
              {claim.adminResponse && (
                <section className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-semibold text-sky-900">
                    Recorded response
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-sky-900">
                    {claim.adminResponse}
                  </p>
                  <p className="mt-2 text-[11px] text-sky-700">
                    Reviewed {formatDate(claim.reviewedAt)}
                  </p>
                </section>
              )}
              {active ? (
                <ClaimReviewForm claimId={claim.id} />
              ) : (
                <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                  <Icon name="lock" className="size-3.5" />
                  This claim is closed. Its decision is preserved in the record.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

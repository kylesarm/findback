import Link from "next/link";
import Icon from "@/components/Icon";
import ClaimCancelForm from "@/components/ClaimCancelForm";
import ClaimStatusBadge, { getClaimStatusMeta } from "@/components/ClaimStatusBadge";
import PageHeader from "@/components/PageHeader";
import { getClaimsWorkspace } from "@/lib/data/claims";

export const metadata = { title: "Claims" };

function formatDate(value) {
  if (!value) return "Not yet reviewed";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function relationshipLabel(role) {
  if (role === "finder") return "Someone is claiming your found item";
  if (role === "admin") return "Administrator access";
  return "You submitted this ownership claim";
}

export default async function ClaimsPage() {
  const { claims, error } = await getClaimsWorkspace();
  const actionNeeded = claims.filter((claim) => claim.status === "pending" || claim.status === "under_review").length;
  const completed = claims.filter((claim) => claim.status === "approved" || claim.status === "rejected" || claim.status === "cancelled").length;

  return (
    <>
      <PageHeader eyebrow="Claim center" title="Claims" description="Track private ownership verification for claims you submitted or claims related to items you found." />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">All claims · {claims.length}</span>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Active · {actionNeeded}</span>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Completed · {completed}</span>
      </div>

      {error ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
          <h2 className="font-bold">Claims are temporarily unavailable</h2>
          <p className="mt-2 leading-6">{error}</p>
        </section>
      ) : claims.length === 0 ? (
        <section className="empty-state">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name="claims" className="size-5" /></span>
          <h2 className="mt-5 text-xl font-bold text-slate-900">No claims yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Claims you submit—and claims other users submit for your found items—will appear here.</p>
          <Link className="mt-6 inline-block rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white" href="/matches">Review possible matches</Link>
        </section>
      ) : (
        <section className="space-y-4">
          {claims.map((claim) => {
            const statusMeta = getClaimStatusMeta(claim.status);
            const canCancel = claim.viewerRole === "claimant" && ["pending", "under_review"].includes(claim.status);

            return (
              <article key={claim.id} className="surface-card p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name="claims" className="size-[18px]" /></div>
                    <div>
                      <p className="text-xs text-slate-500">{relationshipLabel(claim.viewerRole)}</p>
                      <h2 className="mt-1 font-bold text-slate-900">{claim.foundItem.itemName}</h2>
                      <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(claim.createdAt)} · {claim.foundItem.location}</p>
                    </div>
                  </div>
                  <ClaimStatusBadge status={claim.status} />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2" aria-label={`Claim progress: ${statusMeta.label}`}>
                  <div className={`h-1.5 rounded-full ${statusMeta.step >= 1 ? "bg-teal-600" : "bg-slate-200"}`} />
                  <div className={`h-1.5 rounded-full ${statusMeta.step >= 2 ? "bg-teal-600" : "bg-slate-200"}`} />
                  <div className={`h-1.5 rounded-full ${statusMeta.step >= 3 ? "bg-teal-600" : "bg-slate-200"}`} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Submitted</span><span>Verification</span><span>Resolved</span></div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"><Icon name="profile" className="size-3.5" />Claimant proof</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{claim.proofDescription}</p>
                  </section>

                  {claim.privateDetails ? (
                    <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700"><Icon name="lock" className="size-3.5" />Finder-only verification reference</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">{claim.privateDetails}</p>
                    </section>
                  ) : (
                    <section className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Found item</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{claim.foundItem.description}</p>
                    </section>
                  )}
                </div>

                {claim.adminResponse && (
                  <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Administrator response</p>
                    <p className="mt-2 text-sm leading-6 text-sky-900">{claim.adminResponse}</p>
                    <p className="mt-2 text-xs text-sky-700">Reviewed {formatDate(claim.reviewedAt)}</p>
                  </div>
                )}

                {canCancel && <div className="mt-5 border-t border-slate-100 pt-4"><ClaimCancelForm claimId={claim.id} /></div>}
                {claim.viewerRole === "admin" && <div className="mt-5 text-right"><Link className="text-xs font-bold text-teal-700" href="/admin#claims">Review in admin dashboard →</Link></div>}
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

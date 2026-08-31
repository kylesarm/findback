import Link from "next/link";
import Avatar from "@/components/Avatar";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";
import ClaimReviewForm from "@/components/ClaimReviewForm";
import ClaimStatusBadge from "@/components/ClaimStatusBadge";
import PageHeader from "@/components/PageHeader";
import { getCurrentProfile, getUserDisplay, requireAdmin } from "@/lib/auth";
import { getClaimsWorkspace } from "@/lib/data/claims";

export const metadata = { title: "Admin dashboard" };

function formatDate(value) {
  if (!value) return "Not reviewed";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const administrator = getUserDisplay(await requireAdmin(), await getCurrentProfile());
  const { claims, error } = await getClaimsWorkspace();
  const counts = claims.reduce((totals, claim) => {
    totals[claim.status] = (totals[claim.status] || 0) + 1;
    return totals;
  }, {});
  const stats = [
    ["Pending claims", counts.pending || 0, "Awaiting initial review", "◇"],
    ["Under review", counts.under_review || 0, "Verification in progress", "⌁"],
    ["Approved", counts.approved || 0, "Found items resolved", "✓"],
    ["Rejected", counts.rejected || 0, "Ownership not verified", "×"],
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-5 sm:px-8">
          <div className="rounded-xl bg-white p-1"><Brand /></div>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <Link className="font-bold text-white" href="/admin">Claim review</Link>
            <Link href="/dashboard">User dashboard</Link>
            <Link href="/claims">My claims</Link>
          </nav>
          <div className="flex items-center gap-2.5"><span className="hidden text-right sm:block"><span className="block text-xs font-semibold text-white">{administrator.name}</span><span className="block text-[10px] text-slate-400">System administrator</span></span><Avatar src={administrator.avatarUrl} initials={administrator.initials} className="size-9 rounded-xl text-xs" /></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">
        <PageHeader eyebrow="Administration" title="Claim verification" description="Compare claimant proof with finder-only details, then record a secure decision." />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, note, mark]) => (
            <article className="surface-card p-4 sm:p-5" key={label}>
              <div className="flex items-center justify-between"><p className="text-xs font-medium text-slate-500">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600">{mark}</span></div>
              <p className="mt-3 text-2xl font-bold tracking-[-0.03em]">{value}</p>
              <p className="mt-1 text-[11px] font-medium text-teal-700">{note}</p>
            </article>
          ))}
        </section>

        <section id="claims" className="mt-6">
          <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Claim review queue</h2><p className="mt-1 text-xs text-slate-500">Only administrators can save under-review, approved, or rejected decisions.</p></div>

          {error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm"><h3 className="font-bold">Review queue unavailable</h3><p className="mt-2">{error}</p></div>
          ) : claims.length === 0 ? (
            <div className="empty-state"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name="check" className="size-5" /></span><h3 className="mt-5 text-lg font-bold">No claims to review</h3><p className="mt-2 text-sm text-slate-500">Submitted ownership claims will appear here.</p></div>
          ) : (
            <div className="space-y-5">
              {claims.map((claim) => {
                const active = claim.status === "pending" || claim.status === "under_review";

                return (
                  <article key={claim.id} className="surface-card p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">{claim.foundItem.category}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{claim.foundItem.itemName}</h3>
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
          )}
        </section>
      </main>
    </div>
  );
}

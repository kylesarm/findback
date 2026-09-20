import Link from "next/link";
import ActivityReportCard from "@/components/ActivityReportCard";
import Avatar from "@/components/Avatar";
import AvatarForm from "@/components/AvatarForm";
import ClaimStatusBadge from "@/components/ClaimStatusBadge";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import ProfileInformationForm from "@/components/ProfileInformationForm";
import { getCurrentProfile, getUserDisplay, requireUser } from "@/lib/auth";
import { getUserActivity } from "@/lib/data/activity";

export const metadata = { title: "Profile & activity" };

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function EmptyActivity({ icon, title, description, href, action }) {
  return (
    <div className="empty-state py-10">
      <span className="mx-auto grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><Icon name={icon} className="size-[18px]" /></span>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      <Link className="btn-secondary mt-5" href={href}>{action}</Link>
    </div>
  );
}

function ReportSection({ id, title, description, reports, type, error }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>
        <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">{reports.length} {reports.length === 1 ? "report" : "reports"}</span>
      </div>
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">{error}</div>
      ) : reports.length ? (
        <div className="grid gap-4 2xl:grid-cols-2">{reports.map((report) => <ActivityReportCard key={`${report.type}:${report.id}`} report={report} />)}</div>
      ) : type === "lost" ? (
        <EmptyActivity icon="lost" title="You haven’t reported any lost items yet." description="Create a lost-item report to start receiving Possible Matches from Weighted Similarity Matching." href="/report-lost" action="Report a lost item" />
      ) : (
        <EmptyActivity icon="found" title="You haven’t reported any found items yet." description="Create a found-item report so its owner can discover and securely claim it." href="/report-found" action="Report a found item" />
      )}
    </section>
  );
}

export default async function ProfilePage() {
  const authUser = await requireUser();
  const [profile, activity] = await Promise.all([getCurrentProfile(), getUserActivity()]);
  const user = getUserDisplay(authUser, profile);
  const totalReports = activity.lostReports.length + activity.foundReports.length;
  const activeClaims = activity.claims.filter((claim) => ["pending", "under_review"].includes(claim.status)).length;

  return (
    <>
      <PageHeader eyebrow="Account & activity" title="Profile workspace" description="Manage your account, review everything you have reported, and follow Claim Verification activity." />

      <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="surface-card p-6 text-center">
            <Avatar src={user.avatarUrl} initials={user.initials} alt={`${user.name} avatar`} className="mx-auto size-20 rounded-2xl text-2xl" />
            <h2 className="mt-4 font-bold text-slate-950">{user.name}</h2>
            <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[11px] font-bold text-teal-700"><Icon name="check" className="size-3" />Authenticated account</span>
          </div>

          <nav className="surface-card p-3" aria-label="Profile sections">
            {[["lost-reports", "lost", "My Lost Reports"], ["found-reports", "found", "My Found Reports"], ["my-claims", "claims", "My Claims"], ["account-information", "profile", "Account Information"]].map(([href, icon, label]) => <a key={href} className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-teal-700" href={`#${href}`}><Icon name={icon} className="size-4" />{label}</a>)}
          </nav>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-teal-500/15 text-teal-300"><Icon name="lock" className="size-[18px]" /></span>
            <p className="mt-4 text-sm font-bold">Ownership protected</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Report management remains tied to your authenticated account and enforced by Supabase RLS.</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="grid gap-3 sm:grid-cols-3">
            {[["Owned reports", totalReports, "lost"], ["Claims submitted", activity.claims.length, "claims"], ["Active claims", activeClaims, "matches"]].map(([label, value, icon]) => <article className="surface-card p-4" key={label}><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-teal-700"><Icon name={icon} className="size-4" /></span></div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p></article>)}
          </section>

          <AvatarForm avatarUrl={user.avatarUrl} initials={user.initials} hasAvatar={Boolean(user.avatarPath)} />

          <ProfileInformationForm
            firstName={profile?.first_name || user.firstName}
            lastName={profile?.last_name || user.lastName}
            displayName={profile?.display_name}
            department={profile?.department}
            phone={profile?.phone}
            email={user.email}
            campusId={user.campusId}
          />
        </div>
      </section>

      <div className="my-9 border-t border-slate-200" />

      <section className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">Your history</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Reports and claims</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Open a report to view it, update owner-editable information, or delete it when no claim history must be preserved.</p>
      </section>

      <div className="space-y-10">
        <ReportSection id="lost-reports" title="My Lost Reports" description="Items you reported missing." reports={activity.lostReports} type="lost" error={activity.reportsError} />
        <ReportSection id="found-reports" title="My Found Reports" description="Items you reported finding on campus." reports={activity.foundReports} type="found" error={activity.reportsError} />

        <section id="my-claims" className="scroll-mt-24">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-bold text-slate-950">My Claims</h2><p className="mt-1 text-xs leading-5 text-slate-500">Claim Verification records submitted from your account.</p></div><Link className="text-xs font-bold text-teal-700" href="/claims">Open Claim Verification center →</Link></div>
          {activity.claimsError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">{activity.claimsError}</div>
          ) : activity.claims.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {activity.claims.map((claim) => (
                <article className="surface-card p-5" key={claim.id}>
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">Ownership claim</p><h3 className="mt-1.5 truncate font-bold text-slate-950">{claim.itemName}</h3><p className="mt-1 text-xs text-slate-500">Submitted {formatDate(claim.createdAt)}</p></div><ClaimStatusBadge status={claim.status} /></div>
                  {claim.adminResponse && <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Administrator response</p><p className="mt-1.5 text-xs leading-5 text-sky-900">{claim.adminResponse}</p></div>}
                  <div className="mt-4 border-t border-slate-100 pt-4"><Link className="text-xs font-bold text-teal-700" href={`/items/found/${claim.foundItemId}`}>View item details →</Link></div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyActivity icon="claims" title="You haven’t submitted any claims yet." description="When a found item looks like yours, submit private ownership proof from its item page." href="/browse" action="Browse found items" />
          )}
        </section>
      </div>
    </>
  );
}

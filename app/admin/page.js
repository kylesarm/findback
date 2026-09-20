import Link from "next/link";
import Avatar from "@/components/Avatar";
import AdminClaimReviewSection from "@/components/AdminClaimReviewSection";
import AdminReportCard from "@/components/AdminReportCard";
import AdminRoleForm from "@/components/AdminRoleForm";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import { getCurrentProfile, getUserDisplay, requireAdmin } from "@/lib/auth";
import { ADMIN_LIST_LIMIT, getAdminOverview, getAdminReports, getAdminUsers } from "@/lib/data/admin";
import { getClaimsWorkspace } from "@/lib/data/claims";
import { getNotificationSummary } from "@/lib/data/notifications";

export const metadata = { title: "Administrator Dashboard" };

const ADMIN_SECTIONS = [
  ["overview", "Overview", "dashboard"],
  ["claims", "Claims", "claims"],
  ["reports", "Reports", "browse"],
  ["users", "Users", "profile"],
];
const SECTION_NAMES = new Set(ADMIN_SECTIONS.map(([section]) => section));
const REPORT_TYPES = new Set(["all", "lost", "found"]);
const REPORT_STATUSES = new Set(["all", "open", "matched", "resolved"]);
const USER_ROLES = new Set(["all", "user", "admin"]);

function parameter(params, name, maximumLength = 100) {
  const raw = Array.isArray(params?.[name]) ? params[name][0] : params?.[name];
  return typeof raw === "string" ? raw.trim().slice(0, maximumLength) : "";
}

function formatDate(value) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function metric(value) {
  return value === null ? "—" : String(value);
}

function matchesText(values, query) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return values.some((value) => String(value || "").toLowerCase().includes(needle));
}

function OverviewSection({ overview }) {
  const { stats } = overview;
  const cards = [
    ["Total users", stats.totalUsers, "Registered FindMatch profiles", "profile"],
    ["Lost reports", stats.totalLost, `${metric(stats.openLost)} currently open`, "lost"],
    ["Found reports", stats.totalFound, `${metric(stats.openFound)} currently open`, "found"],
    ["Pending claims", stats.pendingClaims, "Awaiting initial review", "claims"],
    ["Under review", stats.underReviewClaims, "Verification in progress", "search"],
    ["Approved claims", stats.approvedClaims, "Ownership verified", "check"],
    ["Resolved items", stats.resolvedItems, "Completed report workflows", "matches"],
  ];

  return (
    <>
      <PageHeader eyebrow="System administration" title="Administrator overview" description="Monitor FindMatch users, reports, claims, and resolved-item activity from one protected workspace." />
      {overview.error && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">{overview.error}</p>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, note, icon]) => (
          <article className="surface-card p-4 sm:p-5" key={label}>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon name={icon} className="size-4" /></span></div>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">{metric(value)}</p>
            <p className="mt-1 text-[11px] font-medium text-teal-700">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-3">
        <Link className="surface-card group p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md" href="/admin?section=claims">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon name="claims" /></span><h2 className="mt-4 font-bold text-slate-950">Review ownership claims</h2><p className="mt-2 text-sm leading-6 text-slate-500">Compare claimant proof with finder-only verification details and record secure decisions.</p><span className="mt-4 inline-block text-xs font-bold text-teal-700">Open Claims →</span>
        </Link>
        <Link className="surface-card group p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md" href="/admin?section=reports">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon name="browse" /></span><h2 className="mt-4 font-bold text-slate-950">Moderate item reports</h2><p className="mt-2 text-sm leading-6 text-slate-500">Search lost and found reports, inspect their public data, and remove inappropriate reports safely.</p><span className="mt-4 inline-block text-xs font-bold text-teal-700">Open Reports →</span>
        </Link>
        <Link className="surface-card group p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md" href="/admin?section=users">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon name="profile" /></span><h2 className="mt-4 font-bold text-slate-950">Manage registered users</h2><p className="mt-2 text-sm leading-6 text-slate-500">View safe profile information and manage protected administrator roles.</p><span className="mt-4 inline-block text-xs font-bold text-teal-700">Open Users →</span>
        </Link>
      </section>
    </>
  );
}

function ClaimsSection({ claimData }) {
  return (
    <>
      <PageHeader eyebrow="Claim Verification" title="Ownership claim review" description="Review claimant proof and finder-only details independently from the Similarity Score, then record a secure decision." />
      <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Claim review queue</h2><p className="mt-1 text-xs text-slate-500">Only administrators can save under-review, approved, or rejected decisions.</p></div>
      <AdminClaimReviewSection claims={claimData.claims} error={claimData.error} />
    </>
  );
}

function ReportsSection({ reportData, filters }) {
  const reports = reportData.reports.filter((report) => (
    (filters.type === "all" || report.type === filters.type)
    && (filters.status === "all" || report.status === filters.status)
    && matchesText([report.itemName, report.category, report.brand, report.color, report.description, report.location], filters.query)
  ));
  const hasFilters = Boolean(filters.query || filters.type !== "all" || filters.status !== "all");

  return (
    <>
      <PageHeader eyebrow="Report moderation" title="Lost and found reports" description="Search and inspect report data without exposing reporter IDs or finder-only verification details." />
      <form action="/admin" className="surface-card mb-6 p-4 sm:p-5" method="get">
        <input name="section" type="hidden" value="reports" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end">
          <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Search reports</span><span className="relative block"><Icon name="search" className="absolute left-3 top-3 size-4 text-slate-400" /><input className="field-control pl-9" defaultValue={filters.query} maxLength={100} name="q" placeholder="Name, category, brand, color, or location" /></span></label>
          <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Report type</span><select className="field-control" defaultValue={filters.type} name="type"><option value="all">Lost and found</option><option value="lost">Lost</option><option value="found">Found</option></select></label>
          <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</span><select className="field-control" defaultValue={filters.status} name="status"><option value="all">All statuses</option><option value="open">Open</option><option value="matched">Matched</option><option value="resolved">Resolved</option></select></label>
          <div className="flex gap-2">{hasFilters && <Link className="btn-secondary" href="/admin?section=reports">Clear</Link>}<button className="btn-primary" type="submit">Filter</button></div>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-500"><span className="font-bold text-slate-800">{reports.length}</span> matching {reports.length === 1 ? "report" : "reports"}</p><p className="text-xs text-slate-400">Newest first · Up to {ADMIN_LIST_LIMIT} per report type</p></div>
      {reportData.error ? <section className="empty-state"><h2 className="font-bold text-slate-800">Reports unavailable</h2><p className="mt-2 text-sm text-slate-500">{reportData.error}</p></section> : reports.length ? <section className="grid gap-4 xl:grid-cols-2">{reports.map((report) => <AdminReportCard key={`${report.type}:${report.id}`} report={report} />)}</section> : <section className="empty-state"><Icon name="browse" className="mx-auto size-6 text-slate-400" /><h2 className="mt-4 font-bold text-slate-800">No reports match these filters</h2><p className="mt-2 text-sm text-slate-500">Try broader keywords or clear a report filter.</p></section>}
    </>
  );
}

function UsersSection({ userData, filters, currentAdminId }) {
  const users = userData.users.filter((user) => (
    (filters.role === "all" || user.role === filters.role)
    && matchesText([user.name, user.email, user.campusId, user.department], filters.query)
  ));
  const hasFilters = Boolean(filters.query || filters.role !== "all");

  return (
    <>
      <PageHeader eyebrow="Account administration" title="Registered users" description="View safe profile information and manage roles through existing administrator-only authorization controls." />
      <form action="/admin" className="surface-card mb-6 p-4 sm:p-5" method="get">
        <input name="section" type="hidden" value="users" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_auto] lg:items-end">
          <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Search users</span><span className="relative block"><Icon name="search" className="absolute left-3 top-3 size-4 text-slate-400" /><input className="field-control pl-9" defaultValue={filters.query} maxLength={100} name="q" placeholder="Name, email, campus ID, or department" /></span></label>
          <label><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Role</span><select className="field-control" defaultValue={filters.role} name="role"><option value="all">All roles</option><option value="user">Users</option><option value="admin">Administrators</option></select></label>
          <div className="flex gap-2">{hasFilters && <Link className="btn-secondary" href="/admin?section=users">Clear</Link>}<button className="btn-primary" type="submit">Filter</button></div>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-500"><span className="font-bold text-slate-800">{users.length}</span> matching {users.length === 1 ? "user" : "users"}</p><p className="text-xs text-slate-400">Latest {ADMIN_LIST_LIMIT} profiles · No auth secrets displayed</p></div>
      {userData.error ? <section className="empty-state"><h2 className="font-bold text-slate-800">Users unavailable</h2><p className="mt-2 text-sm text-slate-500">{userData.error}</p></section> : users.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <article className="surface-card p-5" key={user.id}>
              <div className="flex items-start gap-3"><Avatar className="size-11 rounded-xl text-xs" initials={user.initials} src={user.avatarUrl} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-slate-950">{user.name}</h2><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{user.role}</span></div><p className="mt-1 truncate text-xs text-slate-500">{user.email}</p></div></div>
              <dl className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-400">Campus ID</dt><dd className="truncate font-semibold text-slate-700">{user.campusId || "Not provided"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Department</dt><dd className="truncate font-semibold text-slate-700">{user.department || "Not provided"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Joined</dt><dd className="font-semibold text-slate-700">{formatDate(user.createdAt)}</dd></div></dl>
              <AdminRoleForm currentRole={user.role} isCurrentAdmin={user.id === currentAdminId} userId={user.id} />
            </article>
          ))}
        </section>
      ) : <section className="empty-state"><Icon name="profile" className="mx-auto size-6 text-slate-400" /><h2 className="mt-4 font-bold text-slate-800">No users match these filters</h2><p className="mt-2 text-sm text-slate-500">Try another name, email, department, or role.</p></section>}
    </>
  );
}

export default async function AdminPage({ searchParams }) {
  const adminUser = await requireAdmin();
  const params = await searchParams;
  const requestedSection = parameter(params, "section", 20).toLowerCase();
  const section = SECTION_NAMES.has(requestedSection) ? requestedSection : "overview";
  const query = parameter(params, "q");
  const requestedType = parameter(params, "type", 10).toLowerCase();
  const requestedStatus = parameter(params, "status", 20).toLowerCase();
  const requestedRole = parameter(params, "role", 10).toLowerCase();
  const reportFilters = {
    query,
    type: REPORT_TYPES.has(requestedType) ? requestedType : "all",
    status: REPORT_STATUSES.has(requestedStatus) ? requestedStatus : "all",
  };
  const userFilters = { query, role: USER_ROLES.has(requestedRole) ? requestedRole : "all" };
  const sectionPromise = section === "claims"
    ? getClaimsWorkspace()
    : section === "reports"
      ? getAdminReports()
      : section === "users"
        ? getAdminUsers()
        : Promise.resolve(null);
  const [profile, notificationSummary, overview, sectionData] = await Promise.all([
    getCurrentProfile(),
    getNotificationSummary(),
    getAdminOverview(),
    sectionPromise,
  ]);
  const administrator = getUserDisplay(adminUser, profile);

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex min-h-18 max-w-[1500px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link className="rounded-xl bg-white p-1" href="/admin"><Brand /></Link>
          <div className="flex items-center gap-2.5"><Link className="hidden text-xs font-semibold text-slate-300 hover:text-white sm:block" href="/dashboard">User dashboard</Link><Link href="/notifications" className="relative grid size-9 place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label={`${notificationSummary.unreadCount} unread ${notificationSummary.unreadCount === 1 ? "notification" : "notifications"}`}><Icon name="bell" className="size-[18px]" />{notificationSummary.unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{notificationSummary.unreadCount > 99 ? "99+" : notificationSummary.unreadCount}</span>}</Link><span className="hidden text-right md:block"><span className="block text-xs font-semibold text-white">{administrator.name}</span><span className="block text-[10px] text-slate-400">System administrator</span></span><Avatar src={administrator.avatarUrl} initials={administrator.initials} className="size-9 rounded-xl text-xs" /></div>
        </div>
        <nav className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-4 pb-3 sm:px-8" aria-label="Administrator dashboard sections">
          {ADMIN_SECTIONS.map(([key, label, icon]) => <Link className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${section === key ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/10 hover:text-white"}`} href={key === "overview" ? "/admin" : `/admin?section=${key}`} key={key}><Icon name={icon} className="size-3.5" />{label}</Link>)}
        </nav>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">
        {section === "overview" && <OverviewSection overview={overview} />}
        {section === "claims" && <ClaimsSection claimData={sectionData} />}
        {section === "reports" && <ReportsSection reportData={sectionData} filters={reportFilters} />}
        {section === "users" && <UsersSection currentAdminId={adminUser.sub} filters={userFilters} userData={sectionData} />}
      </main>
    </div>
  );
}

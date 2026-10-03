import Link from "next/link";
import ActivityReportCard from "@/components/ActivityReportCard";
import Avatar from "@/components/Avatar";
import AvatarForm from "@/components/AvatarForm";
import ClaimStatusBadge from "@/components/ClaimStatusBadge";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ProfileInformationForm from "@/components/ProfileInformationForm";
import { getCurrentProfile, getUserDisplay, requireUser } from "@/lib/auth";
import { getUserActivity } from "@/lib/data/activity";

export const metadata = { title: "Profile & activity" };

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function EmptyActivity({ icon, title, description, href, action }) {
  return (
    <div className="empty-state py-10">
      <span className="mx-auto grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
        <Icon name={icon} className="size-[18px]" />
      </span>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {description}
      </p>
      <Link className="btn-secondary mt-5" href={href}>
        {action}
      </Link>
    </div>
  );
}

function ReportSection({ id, title, description, reports, type, error }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
          {reports.length} {reports.length === 1 ? "report" : "reports"}
        </span>
      </div>
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          {error}
        </div>
      ) : reports.length ? (
        <div className="grid gap-4 2xl:grid-cols-2">
          {reports.map((report) => (
            <ActivityReportCard
              key={`${report.type}:${report.id}`}
              report={report}
            />
          ))}
        </div>
      ) : type === "lost" ? (
        <EmptyActivity
          icon="lost"
          title="You haven’t reported any lost items yet."
          description="Create a lost-item report to start receiving Possible Matches from Weighted Similarity Matching."
          href="/report-lost"
          action="Report a lost item"
        />
      ) : (
        <EmptyActivity
          icon="found"
          title="You haven’t reported any found items yet."
          description="Create a found-item report so its owner can discover and securely claim it."
          href="/report-found"
          action="Report a found item"
        />
      )}
    </section>
  );
}

export default async function ProfilePage() {
  const authUser = await requireUser();
  const [profile, activity] = await Promise.all([
    getCurrentProfile(),
    getUserActivity(),
  ]);
  const user = getUserDisplay(authUser, profile);
  const totalReports =
    activity.lostReports.length + activity.foundReports.length;
  const activeClaims = activity.claims.filter((claim) =>
    ["pending", "under_review"].includes(claim.status),
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Your personal workspace"
        title="Profile & activity"
        description="Your reports, your claims, and the details that make this account yours."
      />
      <section className="surface-card overflow-hidden">
        <div className="h-2 bg-brand-500" />
        <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              src={user.avatarUrl}
              initials={user.initials}
              alt={`${user.name} avatar`}
              className="size-16 rounded-2xl text-xl"
            />
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold tracking-tight text-slate-950">
                {user.name}
              </h2>
              <p className="mt-1 break-all text-xs text-slate-500">
                {user.email}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <Icon name="check" className="size-3" />
                Campus member
              </span>
            </div>
          </div>
          <a href="#account-settings" className="btn-secondary">
            <Icon name="profile" />
            Account settings
          </a>
        </div>
      </section>
      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ["My reports", activity.reportsError ? "—" : totalReports, "lost"],
          [
            "Claims submitted",
            activity.claimsError ? "—" : activity.claims.length,
            "claims",
          ],
          [
            "Active claims",
            activity.claimsError ? "—" : activeClaims,
            "matches",
          ],
        ].map(([label, value, icon]) => (
          <StatCard key={label} label={label} value={value} icon={icon} />
        ))}
      </section>
      <nav
        className="my-7 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 sm:grid-cols-4"
        aria-label="Profile sections"
      >
        {[
          ["lost-reports", "lost", "Lost reports"],
          ["found-reports", "found", "Found reports"],
          ["my-claims", "claims", "My claims"],
          ["account-settings", "profile", "Settings"],
        ].map(([href, icon, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <Icon name={icon} />
            {label}
          </a>
        ))}
      </nav>
      <div className="space-y-9">
        <ReportSection
          id="lost-reports"
          title="My lost reports"
          description="Everything you’re looking for, all in one place."
          reports={activity.lostReports}
          type="lost"
          error={activity.reportsError}
        />
        <ReportSection
          id="found-reports"
          title="My found reports"
          description="The items you’re helping find their way home."
          reports={activity.foundReports}
          type="found"
          error={activity.reportsError}
        />
        <section id="my-claims" className="scroll-mt-24">
          <div className="section-heading">
            <div>
              <h2>My claims</h2>
              <p className="mt-1 text-xs text-slate-500">
                A record of your ownership verification requests.
              </p>
            </div>
            <Link className="text-link" href="/claims">
              Claim Verification center
              <Icon name="arrowRight" />
            </Link>
          </div>
          {activity.claimsError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              {activity.claimsError}
            </div>
          ) : activity.claims.length ? (
            <div className="surface-card divide-y divide-slate-100">
              {activity.claims.map((claim) => (
                <article key={claim.id} className="p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <Link
                        href={`/items/found/${claim.foundItemId}`}
                        className="font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {claim.itemName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        Submitted {formatDate(claim.createdAt)}
                      </p>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                  {claim.adminResponse && (
                    <div className="mt-4 border-l-2 border-brand-200 pl-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                        Administrator response
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {claim.adminResponse}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyActivity
              icon="claims"
              title="You haven’t submitted any claims yet."
              description="Recognize a found item? Submit private proof from its details page to begin verification."
              href="/browse"
              action="Browse found items"
            />
          )}
        </section>
        <section id="account-settings" className="scroll-mt-24">
          <div className="section-heading">
            <div>
              <h2>Account settings</h2>
              <p className="mt-1 text-xs text-slate-500">
                Keep your profile and photo up to date.
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Icon name="lock" className="size-3.5" />
              Only you can edit these details
            </span>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
            <AvatarForm
              avatarUrl={user.avatarUrl}
              initials={user.initials}
              hasAvatar={Boolean(user.avatarPath)}
            />
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
      </div>
    </>
  );
}

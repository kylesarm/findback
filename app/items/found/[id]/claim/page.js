import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import ClaimForm from "@/components/ClaimForm";
import Icon from "@/components/Icon";
import ItemImage from "@/components/ItemImage";
import PageHeader from "@/components/PageHeader";
import {
  getCurrentProfile,
  getCurrentUserRole,
  getUserDisplay,
  requireUser,
} from "@/lib/auth";
import { getItemDetail } from "@/lib/data/item-details";
import { getNotificationSummary } from "@/lib/data/notifications";

export const metadata = { title: "Claim Verification" };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value) {
  if (!value) return "Date not provided";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function StateCard({ title, description, tone = "slate", children }) {
  const colors =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-slate-200 bg-white text-slate-950";

  return (
    <section
      className={`rounded-2xl border p-6 text-center shadow-sm sm:p-9 ${colors}`}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white/80 shadow-sm">
        <Icon name="info" className="size-5" />
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 opacity-80">
        {description}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {children}
      </div>
    </section>
  );
}

export default async function DirectClaimPage({ params }) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const user = await requireUser();
  const [{ item, error }, profile, role, notificationSummary] =
    await Promise.all([
      getItemDetail("found", id),
      getCurrentProfile(),
      getCurrentUserRole(),
      getNotificationSummary(),
    ]);

  if (!item && !error) notFound();
  const itemHref = `/items/found/${id}`;

  let content;

  if (error) {
    content = (
      <StateCard
        title="Claim form unavailable"
        description={error}
        tone="amber"
      >
        <Link className="btn-secondary" href="/browse">
          Back to browse
        </Link>
      </StateCard>
    );
  } else if (item.hasActiveClaim) {
    content = (
      <StateCard
        title="You already claimed this item"
        description="Your active claim is already in the verification workflow. You can follow its current status from the Claims page."
        tone="amber"
      >
        <Link className="btn-primary" href="/claims">
          View my claims
        </Link>
        <Link className="btn-secondary" href={itemHref}>
          Back to item
        </Link>
      </StateCard>
    );
  } else if (item.isOwnReport) {
    content = (
      <StateCard
        title="You cannot claim your own found report"
        description="Findmatch prevents finders from submitting ownership claims for items they reported."
      >
        <Link className="btn-secondary" href={itemHref}>
          Back to item
        </Link>
      </StateCard>
    );
  } else if (!item.isClaimable) {
    content = (
      <StateCard
        title="This item is not accepting claims"
        description="The report may have been resolved or is otherwise no longer available for a new ownership claim."
        tone="amber"
      >
        <Link className="btn-secondary" href={itemHref}>
          Back to item
        </Link>
      </StateCard>
    );
  } else {
    content = (
      <>
        <PageHeader
          eyebrow="Claim Verification"
          title="Submit an ownership claim"
          description="Provide private ownership information for Claim Verification. These details are separate from the Similarity Score."
        />
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="surface-card overflow-hidden">
              <ItemImage
                src={item.imageUrl}
                name={item.itemName}
                className="aspect-[4/3]"
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
                    {item.category}
                  </p>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold capitalize text-brand-800">
                    {item.status}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  {item.itemName}
                </h2>
                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500">
                  <Icon name="location" className="mt-1 size-4 shrink-0" />
                  {item.location}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Icon name="calendar" className="size-4 shrink-0" />
                  {formatDate(item.itemDate)}
                </p>
                <Link className="btn-secondary mt-5 w-full" href={itemHref}>
                  Review public details
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <p className="font-bold">Keep your proof specific and private.</p>
              <p className="mt-2">
                Do not copy the public description. Administrators compare your
                answers with finder-only verification details that are never
                shown here.
              </p>
            </section>
          </aside>

          <ClaimForm foundItem={item} backHref={itemHref} />
        </div>
      </>
    );
  }

  return (
    <AppShell
      user={getUserDisplay(user, profile)}
      role={role}
      unreadNotificationCount={notificationSummary.unreadCount}
    >
      {content}
    </AppShell>
  );
}

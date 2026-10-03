import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Icon from "@/components/Icon";
import ItemImage from "@/components/ItemImage";
import StatusBadge from "@/components/StatusBadge";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import {
  getCurrentProfile,
  getCurrentUser,
  getCurrentUserRole,
  getUserDisplay,
} from "@/lib/auth";
import { getItemDetail } from "@/lib/data/item-details";
import { getNotificationSummary } from "@/lib/data/notifications";

const ITEM_TYPES = new Set(["lost", "found"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value, includeTime = false) {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? { hour: "numeric", minute: "2-digit" }
      : { timeZone: "UTC" }),
  }).format(includeTime ? new Date(value) : new Date(`${value}T00:00:00Z`));
}

function DetailValue({ label, children, icon }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
        <Icon name={icon} className="size-3.5" />
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {children || "Not specified"}
      </p>
    </div>
  );
}

function ClaimAction({ item, isLoggedIn }) {
  const itemHref = `/items/found/${item.id}`;

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="font-bold text-brand-950">Think this item is yours?</h2>
        <p className="mt-2 text-sm leading-6 text-brand-800">
          Log in to submit private ownership proof for verification.
        </p>
        <Link
          className="btn-primary mt-5 w-full"
          href={`/login?next=${encodeURIComponent(`${itemHref}/claim`)}`}
        >
          Log in to claim
        </Link>
      </div>
    );
  }

  if (item.isOwnReport) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-bold text-slate-900">This is your found report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You cannot submit an ownership claim for an item you reported as
          found.
        </p>
      </div>
    );
  }

  if (item.hasActiveClaim) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-950">
          You already claimed this item
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Your active claim is already in the verification workflow.
        </p>
        <Link
          className="btn-secondary mt-5 w-full border-amber-300 bg-white text-amber-900"
          href="/claims"
        >
          View claim status
        </Link>
      </div>
    );
  }

  if (!item.isClaimable) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-bold text-slate-900">
          Claims are no longer available
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This item is not currently accepting new ownership claims.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 shadow-sm">
      <h2 className="font-bold text-brand-950">Recognize this item?</h2>
      <p className="mt-2 text-sm leading-6 text-brand-800">
        Submit details only the owner would know. Your proof stays private
        during verification.
      </p>
      <Link className="btn-primary mt-5 w-full" href={`${itemHref}/claim`}>
        Claim this item
      </Link>
    </div>
  );
}

function ItemDetails({ item, isLoggedIn }) {
  const isFound = item.type === "found";
  return (
    <>
      <nav
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link className="text-link" href={isLoggedIn ? "/browse" : "/"}>
          <Icon name="arrowLeft" className="size-3.5" />
          {isLoggedIn ? "Back to browse" : "Back to home"}
        </Link>
        <span className="mx-1 text-slate-300">/</span>
        <span>{item.category}</span>
      </nav>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="surface-card min-w-0 overflow-hidden">
          <div className="relative">
            <ItemImage
              src={item.imageUrl}
              name={item.itemName}
              className={
                item.imageUrl
                  ? "aspect-[4/3] max-h-[460px] w-full"
                  : "h-56 w-full sm:h-64"
              }
              fit="contain"
              priority
            />
            <div className="absolute left-5 top-5">
              <StatusBadge status={item.type} />
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">{item.category}</p>
                <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-.04em] text-slate-950 sm:text-4xl">
                  {item.itemName}
                </h1>
              </div>
              <StatusBadge status={item.status} dot />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailValue label="Location" icon="location">
                {item.location}
              </DetailValue>
              <DetailValue
                label={isFound ? "Date found" : "Date lost"}
                icon="calendar"
              >
                {formatDate(item.itemDate)}
              </DetailValue>
              <DetailValue label="Brand" icon="info">
                {item.brand}
              </DetailValue>
              <DetailValue label="Color" icon="info">
                {item.color}
              </DetailValue>
            </div>
            <section className="mt-7 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                About this item
              </h2>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </section>
          </div>
        </article>
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {isFound ? (
            <ClaimAction item={item} isLoggedIn={isLoggedIn} />
          ) : (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-600">
                <Icon name="found" className="size-5" />
              </span>
              <h2 className="mt-4 font-semibold text-brand-950">
                Found something similar?
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-900">
                Share a found-item report to help connect this item with its
                owner.
              </p>
              <Link className="btn-primary mt-5 w-full" href="/report-found">
                Report a found item
              </Link>
            </div>
          )}
          <section className="surface-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Behind the report
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Reported by</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {item.reporterLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Posted</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {formatDate(item.createdAt, true)}
                </dd>
              </div>
            </dl>
            {item.isOwnReport && (
              <Link
                className="btn-secondary mt-5 w-full"
                href={`/items/${item.type}/${item.id}/edit`}
              >
                Edit your report
              </Link>
            )}
            <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
              <Icon name="lock" className="mt-1 size-4 shrink-0" />
              <p>
                Contact information and private verification details stay
                protected.
              </p>
            </div>
          </section>
          {isFound && (
            <div className="px-1 text-xs leading-6 text-slate-500">
              <p className="font-semibold text-slate-700">
                A thoughtful return starts with proof.
              </p>
              <p className="mt-1">
                An administrator reviews ownership claims. A Similarity Score
                alone does not confirm ownership.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export async function generateMetadata({ params }) {
  const { type, id } = await params;
  if (!ITEM_TYPES.has(type) || !UUID_PATTERN.test(id))
    return { title: "Item details" };

  const { item } = await getItemDetail(type, id);
  if (!item) return { title: "Item details" };

  const title = `${item.itemName} — ${item.type === "found" ? "Found" : "Lost"} item`;
  const description = `${item.category} reported ${item.type} at ${item.location}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
    },
    twitter: {
      title,
      description,
      images: item.imageUrl ? [item.imageUrl] : [],
    },
  };
}

export default async function ItemDetailsPage({ params }) {
  const { type, id } = await params;
  if (!ITEM_TYPES.has(type) || !UUID_PATTERN.test(id)) notFound();

  const [{ item, error }, user] = await Promise.all([
    getItemDetail(type, id),
    getCurrentUser(),
  ]);
  if (!item && !error) notFound();

  const content = error ? (
    <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center sm:p-9">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
        <Icon name="info" className="size-5" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-amber-950">
        Item details are unavailable
      </h1>
      <p className="mt-2 text-sm leading-6 text-amber-800">{error}</p>
      <Link className="btn-secondary mt-6" href="/browse">
        Back to browse
      </Link>
    </section>
  ) : (
    <ItemDetails item={item} isLoggedIn={Boolean(user)} />
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main
          id="main-content"
          className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"
        >
          {content}
        </main>
        <PublicFooter />
      </div>
    );
  }

  const [profile, role, notificationSummary] = await Promise.all([
    getCurrentProfile(),
    getCurrentUserRole(),
    getNotificationSummary(),
  ]);
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

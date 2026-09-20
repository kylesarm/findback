/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Icon from "@/components/Icon";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { getCurrentProfile, getCurrentUser, getCurrentUserRole, getUserDisplay } from "@/lib/auth";
import { getItemDetail } from "@/lib/data/item-details";
import { getNotificationSummary } from "@/lib/data/notifications";

const ITEM_TYPES = new Set(["lost", "found"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value, includeTime = false) {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : { timeZone: "UTC" }),
  }).format(includeTime ? new Date(value) : new Date(`${value}T00:00:00Z`));
}

function initials(name) {
  return String(name || "Item").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function statusClass(status) {
  if (status === "resolved") return "border-slate-200 bg-slate-100 text-slate-700";
  if (status === "matched") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-teal-200 bg-teal-50 text-teal-800";
}

function DetailValue({ label, children, icon }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400"><Icon name={icon} className="size-3.5" />{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">{children || "Not specified"}</p>
    </div>
  );
}

function ClaimAction({ item, isLoggedIn }) {
  const itemHref = `/items/found/${item.id}`;

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <h2 className="font-bold text-teal-950">Think this item is yours?</h2>
        <p className="mt-2 text-sm leading-6 text-teal-800">Log in to submit private ownership proof for verification.</p>
        <Link className="btn-primary mt-5 w-full" href={`/login?next=${encodeURIComponent(`${itemHref}/claim`)}`}>Log in to claim</Link>
      </div>
    );
  }

  if (item.isOwnReport) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-bold text-slate-900">This is your found report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">You cannot submit an ownership claim for an item you reported as found.</p>
      </div>
    );
  }

  if (item.hasActiveClaim) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-950">You already claimed this item</h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">Your active claim is already in the verification workflow.</p>
        <Link className="btn-secondary mt-5 w-full border-amber-300 bg-white text-amber-900" href="/claims">View claim status</Link>
      </div>
    );
  }

  if (!item.isClaimable) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="font-bold text-slate-900">Claims are no longer available</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">This item is not currently accepting new ownership claims.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
      <h2 className="font-bold text-teal-950">Recognize this item?</h2>
      <p className="mt-2 text-sm leading-6 text-teal-800">Submit details only the owner would know. Your proof stays private during verification.</p>
      <Link className="btn-primary mt-5 w-full" href={`${itemHref}/claim`}>Claim this item</Link>
    </div>
  );
}

function ItemDetails({ item, isLoggedIn }) {
  const isFound = item.type === "found";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link className="font-semibold transition hover:text-teal-700" href={isLoggedIn ? "/browse" : "/"}>FindMatch</Link>
        <span aria-hidden="true">/</span>
        <Link className="font-semibold transition hover:text-teal-700" href="/browse">Browse items</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">{item.itemName}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="surface-card overflow-hidden">
            <div className="relative grid min-h-72 place-items-center overflow-hidden bg-slate-900 sm:min-h-[430px]">
              {item.imageUrl ? (
                <img className="absolute inset-0 size-full object-contain" src={item.imageUrl} alt={`${item.itemName} ${item.type} item`} />
              ) : (
                <div className="text-center text-white">
                  <span className="mx-auto grid size-24 place-items-center rounded-3xl border border-white/15 bg-white/10 text-3xl font-bold shadow-sm">{initials(item.itemName)}</span>
                  <p className="mt-4 text-sm text-slate-300">No item photo provided</p>
                </div>
              )}
              <span className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] shadow-sm ${isFound ? "border-teal-100 bg-teal-50 text-teal-800" : "border-rose-100 bg-rose-50 text-rose-700"}`}>{item.type}</span>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">{item.category}</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">{item.itemName}</h1>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${statusClass(item.status)}`}>{item.status}</span>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-sm font-bold text-slate-900">Public description</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.description}</p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <DetailValue label="Brand" icon="info">{item.brand}</DetailValue>
                <DetailValue label="Color" icon="info">{item.color}</DetailValue>
                <DetailValue label="Location" icon="location">{item.location}</DetailValue>
                <DetailValue label={isFound ? "Date found" : "Date lost"} icon="calendar">{formatDate(item.itemDate)}</DetailValue>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {isFound ? (
            <ClaimAction item={item} isLoggedIn={isLoggedIn} />
          ) : (
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <h2 className="font-bold text-teal-950">Found something similar?</h2>
              <p className="mt-2 text-sm leading-6 text-teal-800">Create a found-item report so FindMatch can evaluate it through Weighted Similarity Matching.</p>
              <Link className="btn-primary mt-5 w-full" href="/report-found">Report a found item</Link>
            </div>
          )}

          <section className="surface-card p-5">
            <h2 className="text-sm font-bold text-slate-900">Report information</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-xs font-semibold text-slate-400">Reported by</dt><dd className="mt-1 font-semibold text-slate-700">{item.reporterLabel}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">Created</dt><dd className="mt-1 font-semibold text-slate-700">{formatDate(item.createdAt, true)}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-400">Current status</dt><dd className="mt-1 font-semibold capitalize text-slate-700">{item.status}</dd></div>
            </dl>
            <div className="mt-5 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><Icon name="lock" className="mt-0.5 size-4 shrink-0" /><p>Contact information and private verification details are never shown on public item pages.</p></div>
            {item.isOwnReport && <Link className="btn-secondary mt-4 w-full" href={`/items/${item.type}/${item.id}/edit`}>Edit this report</Link>}
          </section>
        </aside>
      </div>
    </>
  );
}

export async function generateMetadata({ params }) {
  const { type, id } = await params;
  if (!ITEM_TYPES.has(type) || !UUID_PATTERN.test(id)) return { title: "Item details" };

  const { item } = await getItemDetail(type, id);
  if (!item) return { title: "Item details" };

  const title = `${item.itemName} — ${item.type === "found" ? "Found" : "Lost"} item`;
  const description = `${item.category} reported ${item.type} at ${item.location}.`;

  return {
    title,
    description,
    openGraph: { title, description, images: item.imageUrl ? [{ url: item.imageUrl }] : [] },
    twitter: { title, description, images: item.imageUrl ? [item.imageUrl] : [] },
  };
}

export default async function ItemDetailsPage({ params }) {
  const { type, id } = await params;
  if (!ITEM_TYPES.has(type) || !UUID_PATTERN.test(id)) notFound();

  const [{ item, error }, user] = await Promise.all([getItemDetail(type, id), getCurrentUser()]);
  if (!item && !error) notFound();

  const content = error ? (
    <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center sm:p-9">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-amber-700 shadow-sm"><Icon name="info" className="size-5" /></span>
      <h1 className="mt-5 text-2xl font-bold text-amber-950">Item details are unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-amber-800">{error}</p>
      <Link className="btn-secondary mt-6" href="/browse">Back to browse</Link>
    </section>
  ) : <ItemDetails item={item} isLoggedIn={Boolean(user)} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f8fa]">
        <PublicHeader />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">{content}</main>
        <PublicFooter />
      </div>
    );
  }

  const [profile, role, notificationSummary] = await Promise.all([getCurrentProfile(), getCurrentUserRole(), getNotificationSummary()]);
  return <AppShell user={getUserDisplay(user, profile)} role={role} unreadNotificationCount={notificationSummary.unreadCount}>{content}</AppShell>;
}

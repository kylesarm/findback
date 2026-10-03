import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import {
  markAllNotificationsRead,
  markNotificationRead,
  openNotification,
} from "@/app/actions/notifications";
import {
  getNotifications,
  getNotificationSummary,
} from "@/lib/data/notifications";
import { getPossibleMatches } from "@/lib/data/matches";

export const metadata = { title: "Notifications" };

const TYPE_LABELS = {
  possible_match: "Possible Match",
  new_claim: "New ownership claim",
  claim_under_review: "Claim under review",
  claim_approved: "Claim approved",
  claim_rejected: "Claim rejected",
  found_item_resolved: "Found item resolved",
};

function formatTimestamp(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function NotificationsPage() {
  // Matching runs in application code. Synchronize current matches before the
  // feed is loaded; the database RPC keeps repeated events idempotent.
  await getPossibleMatches();
  const [{ notifications, error }, summary] = await Promise.all([
    getNotifications(),
    getNotificationSummary(),
  ]);
  const unreadCount = summary.unreadCount;

  return (
    <>
      <PageHeader
        eyebrow="Activity updates"
        title="Your updates, in one place."
        description="Stay close to your reports. Follow new connections and every step of Claim Verification."
        action={
          unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <button className="btn-secondary" type="submit">
                Mark all as read
              </button>
            </form>
          ) : null
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">
          {notifications.length} recent
        </span>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          {unreadCount} unread
        </span>
      </div>

      {error ? (
        <section className="surface-card border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <h2 className="font-bold">
            Notifications are temporarily unavailable
          </h2>
          <p className="mt-2">{error}</p>
        </section>
      ) : notifications.length === 0 ? (
        <section className="empty-state">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
            <Icon name="bell" className="size-5" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No notifications yet
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            New Possible Matches and Claim Verification updates will appear
            here.
          </p>
        </section>
      ) : (
        <section className="surface-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notification) => (
            <article
              className={`relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6 ${notification.isRead ? "bg-white" : "bg-brand-50/40"}`}
              key={notification.id}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${notification.isRead ? "bg-slate-100 text-slate-500" : "bg-brand-100 text-brand-800"}`}
              >
                <Icon
                  name={notificationIcons[notification.type] || "bell"}
                  className="size-[18px]"
                />
              </span>
              <form action={openNotification} className="min-w-0 flex-1">
                <input
                  name="notificationId"
                  type="hidden"
                  value={notification.id}
                />
                <button
                  className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  type="submit"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">
                      {TYPE_LABELS[notification.type] || "Findmatch update"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${notification.isRead ? "bg-slate-100 text-slate-500" : "bg-brand-700 text-white"}`}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-sm font-medium leading-6 text-slate-800">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {formatTimestamp(notification.createdAt)} · Open update →
                  </span>
                </button>
              </form>
              {!notification.isRead && (
                <form action={markNotificationRead} className="shrink-0">
                  <input
                    name="notificationId"
                    type="hidden"
                    value={notification.id}
                  />
                  <button
                    className="btn-secondary min-h-9 px-3 py-2 text-xs"
                    type="submit"
                  >
                    Mark as read
                  </button>
                </form>
              )}
            </article>
          ))}
        </section>
      )}
    </>
  );
}

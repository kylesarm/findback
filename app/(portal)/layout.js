import AppShell from "@/components/AppShell";
import { getCurrentProfile, getCurrentUserRole, getUserDisplay, requireUser } from "@/lib/auth";
import { getNotificationSummary } from "@/lib/data/notifications";

export default async function PortalLayout({ children }) {
  const [claims, role, profile, notificationSummary] = await Promise.all([requireUser(), getCurrentUserRole(), getCurrentProfile(), getNotificationSummary()]);
  return <AppShell user={getUserDisplay(claims, profile)} role={role} unreadNotificationCount={notificationSummary.unreadCount}>{children}</AppShell>;
}

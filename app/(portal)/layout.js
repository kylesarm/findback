import AppShell from "@/components/AppShell";
import { getCurrentProfile, getCurrentUserRole, getUserDisplay, requireUser } from "@/lib/auth";

export default async function PortalLayout({ children }) {
  const [claims, role, profile] = await Promise.all([requireUser(), getCurrentUserRole(), getCurrentProfile()]);
  return <AppShell user={getUserDisplay(claims, profile)} role={role}>{children}</AppShell>;
}

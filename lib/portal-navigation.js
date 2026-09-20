const userNavigation = Object.freeze([
  ["/dashboard", "Overview", "dashboard"],
  ["/report-lost", "Report lost", "lost"],
  ["/report-found", "Report found", "found"],
  ["/browse", "Browse items", "browse"],
  ["/matches", "Possible Matches", "matches"],
  ["/claims", "Claims", "claims"],
  ["/notifications", "Notifications", "bell"],
  ["/profile", "Profile", "profile"],
]);

const adminNavigationItem = Object.freeze(["/admin", "Admin Dashboard", "admin"]);

export function getPortalNavigation(role) {
  return role === "admin" ? [...userNavigation, adminNavigationItem] : [...userNavigation];
}

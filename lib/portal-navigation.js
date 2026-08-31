const userNavigation = Object.freeze([
  ["/dashboard", "Overview", "dashboard"],
  ["/report-lost", "Report lost", "lost"],
  ["/report-found", "Report found", "found"],
  ["/browse", "Browse items", "browse"],
  ["/matches", "Possible matches", "matches"],
  ["/claims", "Claims", "claims"],
  ["/profile", "Profile", "profile"],
]);

const adminNavigationItem = Object.freeze(["/admin", "Admin Dashboard", "admin"]);

export function getPortalNavigation(role) {
  return role === "admin" ? [...userNavigation, adminNavigationItem] : [...userNavigation];
}

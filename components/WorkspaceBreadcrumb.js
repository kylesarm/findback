"use client";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
const labels = {
  dashboard: "Overview",
  browse: "Browse items",
  matches: "Possible Matches",
  claims: "Claim Verification",
  notifications: "Notifications",
  profile: "Profile & activity",
  "report-lost": "Report lost item",
  "report-found": "Report found item",
  items: "Item details",
  admin: "Administration",
};
export default function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  return (
    <div className="hidden items-center gap-3 text-xs sm:flex">
      <span className="text-slate-500">Workspace</span>
      <Icon name="chevronDown" className="size-3 -rotate-90 text-slate-300" />
      <span className="font-medium text-slate-700">
        {labels[pathname.split("/")[1]] || "Findmatch"}
      </span>
    </div>
  );
}

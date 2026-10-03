"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortalNavigation } from "@/lib/portal-navigation";
import Icon from "./Icon";

export default function PortalNav({ role, mobile = false, onNavigate }) {
  const pathname = usePathname();
  const items = getPortalNavigation(role);
  const groups = [
    [
      "Workspace",
      items.filter(([href]) =>
        [
          "/dashboard",
          "/browse",
          "/matches",
          "/claims",
          "/notifications",
        ].includes(href),
      ),
    ],
    [
      "Your reports",
      items.filter(([href]) =>
        ["/report-lost", "/report-found"].includes(href),
      ),
    ],
    [
      "Account",
      items.filter(([href]) => ["/profile", "/admin"].includes(href)),
    ],
  ];
  return (
    <div className={mobile ? "space-y-5" : "space-y-6"}>
      {groups.map(([title, links]) => (
        <div key={title}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400">
            {title}
          </p>
          <div className="space-y-1">
            {links.map(([href, label, icon]) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(`${href}/`));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition ${active ? "bg-brand-500/25 text-white ring-1 ring-inset ring-brand-300/25" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon
                    name={icon}
                    className={`size-[18px] shrink-0 ${active ? "text-teal-300" : "text-slate-400 group-hover:text-slate-300"}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {active && (
                    <span className="size-1.5 rounded-full bg-teal-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

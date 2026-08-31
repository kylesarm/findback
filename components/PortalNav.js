"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortalNavigation } from "@/lib/portal-navigation";
import Icon from "./Icon";

export default function PortalNav({ role, mobile = false }) {
  const pathname = usePathname();
  const items = getPortalNavigation(role);
  const mainItems = items.filter(([href]) => !["/profile", "/admin"].includes(href));
  const accountItems = items.filter(([href]) => ["/profile", "/admin"].includes(href));

  const renderLinks = (links) => links.map(([href, label, icon]) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${active ? "bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${active ? "bg-teal-700 text-white shadow-sm" : "text-slate-400 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm"}`}>
          <Icon name={icon} className="size-[18px]" />
        </span>
        <span className="truncate">{label}</span>
      </Link>
    );
  });

  if (mobile) return <div className="grid gap-1 sm:grid-cols-2">{renderLinks(items)}</div>;

  return (
    <>
      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      <div className="mt-2 space-y-1">{renderLinks(mainItems)}</div>
      {accountItems.length > 0 && <><p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Account</p><div className="mt-2 space-y-1">{renderLinks(accountItems)}</div></>}
    </>
  );
}

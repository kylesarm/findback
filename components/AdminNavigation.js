import Link from "next/link";
import Icon from "./Icon";

export const ADMIN_SECTIONS = [
  ["overview", "Overview", "dashboard"],
  ["claims", "Claims", "claims"],
  ["reports", "Reports", "browse"],
  ["users", "Users", "profile"],
];

export default function AdminNavigation({ section, onNavigate }) {
  return (
    <>
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400">
        Administration
      </p>
      <div className="space-y-1">
        {ADMIN_SECTIONS.map(([key, label, icon]) => (
          <Link
            key={key}
            href={key === "overview" ? "/admin" : `/admin?section=${key}`}
            onClick={onNavigate}
            aria-current={section === key ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition ${section === key ? "bg-brand-500/20 text-white ring-1 ring-inset ring-brand-400/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
          >
            <Icon
              name={icon}
              className={`size-[18px] ${section === key ? "text-brand-300" : "text-slate-400"}`}
            />
            <span className="flex-1">{label}</span>
            {section === key && (
              <span className="size-1.5 rounded-full bg-brand-400" />
            )}
          </Link>
        ))}
      </div>
      <div className="mt-7 border-t border-white/10 pt-5">
        <Link
          href="/notifications"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] text-slate-300 hover:bg-white/5"
        >
          <Icon name="bell" className="size-[18px] text-slate-400" />
          Notifications
        </Link>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] text-slate-300 hover:bg-white/5"
        >
          <Icon name="arrowLeft" className="size-[18px] text-slate-400" />
          User workspace
        </Link>
      </div>
    </>
  );
}

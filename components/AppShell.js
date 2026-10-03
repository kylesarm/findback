import Link from "next/link";
import { logout } from "@/app/auth/actions";
import Avatar from "./Avatar";
import Brand from "./Brand";
import Icon from "./Icon";
import PortalNav from "./PortalNav";
import MobileNavigation from "./MobileNavigation";
import WorkspaceBreadcrumb from "./WorkspaceBreadcrumb";
import AdminNavigation from "./AdminNavigation";

export default function AppShell({
  children,
  user,
  role,
  unreadNotificationCount = 0,
  adminSection,
}) {
  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="brand-panel fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col px-4 py-6 lg:flex">
        <div className="px-3">
          <Brand dark href="/dashboard" />
          <p className="mt-2 pl-[50px] text-[10px] tracking-wide text-slate-300">
            The campus lost & found
          </p>
        </div>
        <nav
          className="mt-9 min-h-0 flex-1 overflow-y-auto"
          aria-label={
            adminSection ? "Administrator navigation" : "Dashboard navigation"
          }
        >
          {adminSection ? (
            <AdminNavigation section={adminSection} />
          ) : (
            <PortalNav role={role} />
          )}
        </nav>
        <div className="mt-6 rounded-2xl border border-teal-300/20 bg-teal-300/5 p-4">
          <Icon name="admin" className="size-5 text-teal-300" />
          <p className="mt-2 text-xs font-semibold text-slate-200">
            A safer way back.
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Similarity helps you find it. Private verification helps return it.
          </p>
        </div>
        <Link
          href="/profile"
          className="mt-5 flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5"
        >
          <Avatar
            src={user.avatarUrl}
            initials={user.initials}
            className="size-9 rounded-lg text-xs"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">
              {user.name}
            </span>
            <span className="mt-0.5 block text-[10px] text-slate-400">
              {role === "admin" ? "Administrator" : "Campus member"}
            </span>
          </span>
          <Icon
            name="chevronDown"
            className="size-3 -rotate-90 text-slate-400"
          />
        </Link>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex h-[72px] items-center gap-2 px-3 sm:gap-4 sm:px-7 lg:px-8">
            <MobileNavigation role={role} adminSection={adminSection} />
            <div className="sm:hidden">
              <Brand compact />
            </div>
            <WorkspaceBreadcrumb />
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                className="icon-button"
                href="/browse"
                aria-label="Search items"
              >
                <Icon name="search" className="size-[18px]" />
              </Link>
              <Link
                href="/notifications"
                className="icon-button relative"
                aria-label={`${unreadNotificationCount} unread notifications`}
              >
                <Icon name="bell" className="size-[18px]" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </Link>
              <span className="mx-2 hidden h-6 w-px bg-slate-200 sm:block" />
              <Link
                href="/profile"
                className="rounded-lg p-1.5"
                aria-label="Open your profile"
              >
                <Avatar
                  src={user.avatarUrl}
                  initials={user.initials}
                  className="size-8 rounded-lg text-[11px]"
                />
              </Link>
              <form action={logout}>
                <button
                  className="icon-button"
                  type="submit"
                  aria-label="Log out"
                  title="Log out"
                >
                  <Icon name="logout" className="size-[18px]" />
                </button>
              </form>
            </div>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-[1440px] px-4 py-7 outline-none sm:px-7 lg:px-8 lg:py-9 xl:px-10"
        >
          {children}
        </main>
        <footer className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 pb-6 pt-4 text-[10px] text-slate-500 sm:px-7 lg:px-10">
          <span>Findmatch · Made for the campus community</span>
          <span>Weighted Similarity Matching & Claim Verification</span>
        </footer>
      </div>
    </div>
  );
}

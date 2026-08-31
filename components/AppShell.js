import Link from "next/link";
import { logout } from "@/app/auth/actions";
import Avatar from "./Avatar";
import Brand from "./Brand";
import Icon from "./Icon";
import PortalNav from "./PortalNav";

export default function AppShell({ children, user, role }) {
  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 lg:flex">
        <div className="px-2"><Brand /></div>
        <nav className="mt-9" aria-label="Dashboard navigation"><PortalNav role={role} /></nav>
        <Link href="/profile" className="mt-auto mb-3 flex items-center gap-3 rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-50">
          <Avatar src={user.avatarUrl} initials={user.initials} className="size-9 rounded-xl text-xs" />
          <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-800">{user.name}</span><span className="block truncate text-[10px] text-slate-500">View profile</span></span>
        </Link>
        <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-teal-500/15 text-teal-300"><Icon name="info" /></span>Campus support</div>
          <p className="mt-3 text-xs leading-5 text-slate-400">For urgent concerns, contact the campus security office directly.</p>
          <p className="mt-3 text-[11px] font-semibold text-teal-300">Available 8:00 AM–5:00 PM</p>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-7 lg:px-8">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-800">FindBack workspace</p>
              <p className="text-[11px] text-slate-400">Campus Lost & Found</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Link href="/matches" className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-teal-700" aria-label="Possible matches"><Icon name="matches" className="size-[19px]" /></Link>
              <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
              <Link href="/profile" className="flex min-w-0 items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100">
                <Avatar src={user.avatarUrl} initials={user.initials} className="size-9 rounded-xl text-xs" />
                <span className="hidden max-w-40 text-left sm:block"><span className="block truncate text-xs font-semibold text-slate-800">{user.name}</span><span className="block truncate text-[10px] text-slate-500">{role === "admin" ? "Administrator" : user.email}</span></span>
              </Link>
              <form action={logout}><button className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700" type="submit">Log out</button></form>
            </div>
          </div>
        </header>

        <details className="group border-b border-slate-200 bg-white lg:hidden">
          <summary className="flex min-h-12 list-none items-center justify-between px-4 text-sm font-semibold text-slate-700 sm:px-7">
            <span className="flex items-center gap-2"><Icon name="menu" className="size-[18px] text-slate-400" />Navigation</span>
            <Icon name="chevronDown" className="size-4 transition group-open:rotate-180" />
          </summary>
          <nav className="border-t border-slate-100 p-3 sm:px-6" aria-label="Mobile dashboard navigation"><PortalNav role={role} mobile /></nav>
        </details>

        <main className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-8 xl:p-10">{children}</main>
      </div>
    </div>
  );
}

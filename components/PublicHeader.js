import Link from "next/link";
import Brand from "./Brand";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex" aria-label="Main navigation">
          <Link className="rounded-lg px-3 py-2 transition hover:bg-slate-50 hover:text-teal-700" href="/browse">Browse items</Link>
          <a className="rounded-lg px-3 py-2 transition hover:bg-slate-50 hover:text-teal-700" href="#how-it-works">How it works</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block" href="/login">Log in</Link>
          <Link className="btn-primary min-h-9 px-4 py-2" href="/register">Get started</Link>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import Brand from "./Brand";
import Icon from "./Icon";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Brand />
        <nav
          className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 md:flex"
          aria-label="Main navigation"
        >
          <Link className="hover:text-brand-600" href="/browse">
            Explore items
          </Link>
          <Link className="hover:text-brand-600" href="/#how-it-works">
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            className="hidden text-[13px] font-semibold text-slate-700 hover:text-brand-600 sm:block"
            href="/login"
          >
            Log in
          </Link>
          <Link className="btn-primary" href="/register">
            Get started
            <Icon name="arrowRight" className="hidden size-4 sm:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}

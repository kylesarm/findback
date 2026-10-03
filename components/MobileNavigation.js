"use client";

import Link from "next/link";
import { useRef } from "react";
import Brand from "./Brand";
import Icon from "./Icon";
import PortalNav from "./PortalNav";
import AdminNavigation from "./AdminNavigation";

export default function MobileNavigation({ role, adminSection }) {
  const dialog = useRef(null);
  return (
    <>
      <button
        type="button"
        className="icon-button lg:hidden"
        onClick={() => dialog.current?.showModal()}
        aria-label="Open navigation"
      >
        <Icon name="menu" className="size-5" />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="mobile-navigation-title"
        className="mobile-navigation-dialog m-0 h-dvh w-[min(320px,calc(100%-2rem))] max-w-none border-0 bg-navy p-0 text-white"
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-center justify-between">
            <Brand dark href="/dashboard" />
            <button
              autoFocus
              type="button"
              className="icon-button text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Close navigation"
              onClick={() => dialog.current?.close()}
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>
          <h2 id="mobile-navigation-title" className="sr-only">
            Workspace navigation
          </h2>
          <nav
            className="min-h-0 flex-1 overflow-y-auto"
            aria-label="Mobile dashboard navigation"
          >
            {adminSection ? (
              <AdminNavigation
                section={adminSection}
                onNavigate={() => dialog.current?.close()}
              />
            ) : (
              <PortalNav
                role={role}
                mobile
                onNavigate={() => dialog.current?.close()}
              />
            )}
          </nav>
          <Link
            href="/profile#lost-reports"
            onClick={() => dialog.current?.close()}
            className="mt-6 rounded-lg border border-white/10 p-3 text-sm text-slate-300"
          >
            My reports & activity <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </dialog>
    </>
  );
}

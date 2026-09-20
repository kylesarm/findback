import Link from "next/link";
import Brand from "./Brand";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto_auto]">
        <div><Brand /><p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">Campus lost-and-found management with Weighted Similarity Matching and secure Claim Verification.</p></div>
        <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Explore</p><div className="mt-3 space-y-2 text-sm text-slate-600"><p><Link href="/browse">Browse items</Link></p><p><Link href="/report-lost">Report lost</Link></p><p><Link href="/report-found">Report found</Link></p></div></div>
        <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</p><div className="mt-3 space-y-2 text-sm text-slate-600"><p><Link href="/login">Log in</Link></p><p><Link href="/register">Register</Link></p><p><Link href="/admin">Admin portal</Link></p></div></div>
      </div>
      <div className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-400">© 2026 FindMatch · Weighted Similarity Matching & Claim Verification</div>
    </footer>
  );
}

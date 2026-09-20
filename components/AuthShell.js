import Link from "next/link";
import Brand from "./Brand";

export default function AuthShell({ title, description, children, alternate }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[.92fr_1.08fr]">
      <section className="flex min-h-screen flex-col p-5 sm:p-8 lg:p-10 xl:p-12">
        <Brand />
        <div className="mx-auto my-auto w-full max-w-[430px] py-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Welcome to FindMatch</p>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-7 text-center text-sm text-slate-500">{alternate.text} <Link className="font-bold text-teal-700 hover:underline" href={alternate.href}>{alternate.label}</Link></p>
        </div>
        <p className="text-xs text-slate-400">© 2026 FindMatch · Matching & Claim Verification</p>
      </section>
      <section className="relative hidden overflow-hidden bg-[#0b1220] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="hero-grid absolute inset-0 opacity-20" />
        <div className="relative ml-auto rounded-full bg-teal-500/15 px-4 py-2 text-xs font-semibold text-teal-200">Secure Claim Verification</div>
        <div className="relative max-w-xl">
          <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-teal-500 text-2xl">⌁</div>
          <p className="text-4xl font-bold leading-tight tracking-tight">Every item has a story. Help the right person finish it.</p>
          <p className="mt-5 max-w-lg leading-7 text-slate-400">A focused campus space for reporting belongings, reviewing Possible Matches through Weighted Similarity Matching, and completing Claim Verification securely.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[["Report", "lost or found"], ["Compare", "Similarity Scores"], ["Verify", "ownership claims"]].map(([value, label]) => <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
        </div>
      </section>
    </main>
  );
}

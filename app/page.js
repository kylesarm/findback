import Link from "next/link";
import ItemCard from "@/components/ItemCard";
import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import { getRecentListings } from "@/lib/data/items";

export default async function Home() {
  const recentListings = await getRecentListings();

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-950">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200">
          <div className="hero-grid absolute inset-0 opacity-50" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                <span className="size-1.5 rounded-full bg-teal-600" /> Campus community powered
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Lost something? Let&apos;s help it find its way <span className="text-teal-700">back.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Report missing belongings, share what you found, and discover possible matches through one safe, organized campus hub.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="rounded-xl bg-teal-700 px-5 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:-translate-y-0.5 hover:bg-teal-800" href="/report-lost">I lost an item <span aria-hidden="true">→</span></Link>
                <Link className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-center text-sm font-bold text-slate-800 transition hover:border-teal-300 hover:text-teal-800" href="/report-found">I found an item</Link>
              </div>
              <p className="mt-5 text-sm text-slate-500">Free to use · Secure claim verification · Built for our campus</p>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-4 rotate-2 rounded-[2rem] bg-teal-100" />
              <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">A safer return</p><p className="mt-1 text-xl font-bold">Simple reports. Clear next steps.</p></div>
                  <span className="grid size-11 place-items-center rounded-full bg-amber-100 text-xl" aria-hidden="true">✓</span>
                </div>
                <div className="rounded-2xl bg-slate-950 p-6 text-white">
                  <div className="mb-10 flex items-start justify-between"><span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold">Community powered</span><span className="text-2xl" aria-hidden="true">⌁</span></div>
                  <p className="text-2xl font-semibold tracking-tight">Report. Match. Verify.</p>
                  <p className="mt-2 text-sm text-slate-300">A clear process for returning campus belongings safely.</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[["01", "Public reports"], ["02", "Private proof"], ["03", "Admin review"]].map(([value, label]) => (
                    <div className="rounded-xl bg-slate-50 px-2 py-3" key={label}><p className="font-bold text-slate-950">{value}</p><p className="mt-0.5 text-[10px] leading-4 text-slate-500">{label}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">How it works</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Three clear steps to a safer return.</h2><p className="mt-4 leading-7 text-slate-500">FindBack keeps public reporting simple while protecting the private details needed to verify a claim.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{[["01", "Report the item", "Describe what was lost or found, including the location and date."], ["02", "Review possible matches", "Compare reports that share similar details, timing, and campus areas."], ["03", "Verify and return", "Answer private ownership questions before arranging a safe handover."]].map(([number, title, copy]) => <article className="surface-card p-6" key={number}><span className="text-3xl font-bold text-teal-100">{number}</span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}</div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Community board</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Recently reported items</h2></div>
              <Link className="text-sm font-bold text-teal-700" href="/browse">Browse all items →</Link>
            </div>
            {recentListings.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentListings.items.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="empty-state bg-slate-50 py-12">
                <p className="font-semibold text-slate-700">{recentListings.error || "No recently reported items yet."}</p>
                <p className="mt-2 text-sm text-slate-500">New lost and found reports will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24"><div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-12"><div className="hero-grid absolute inset-0 opacity-20" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Start today</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">One report could be the reason an item gets home.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">Join the campus community making lost-and-found simpler, safer, and more transparent.</p><Link className="mt-7 inline-block rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950" href="/register">Create your account</Link></div></div></section>
      </main>
      <PublicFooter />
    </div>
  );
}

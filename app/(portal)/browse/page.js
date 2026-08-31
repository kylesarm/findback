import Icon from "@/components/Icon";
import ItemCard from "@/components/ItemCard";
import PageHeader from "@/components/PageHeader";
import { getListings } from "@/lib/data/items";

export const metadata = { title: "Browse items" };

export default async function BrowsePage() {
  const listings = await getListings();

  return (
    <>
      <PageHeader eyebrow="Community reports" title="Browse items" description="Search recent lost and found reports shared across campus." />
      <section className="surface-card mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative"><span className="sr-only">Search items</span><Icon name="search" className="absolute left-3 top-3 size-4 text-slate-400" /><input className="field-control pl-9" placeholder="Search by item name or description" /></label>
          <select aria-label="Filter by category" className="field-control"><option>All categories</option><option>Electronics</option><option>Bags</option><option>ID & cards</option></select>
          <select aria-label="Filter by report type" className="field-control"><option>Lost & found</option><option>Lost items</option><option>Found items</option></select>
          <button className="btn-primary">Search</button>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm text-slate-500"><span className="font-bold text-slate-800">{listings.items.length} {listings.items.length === 1 ? "item" : "items"}</span> currently listed</p><span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500">Newest first</span></div>

      {listings.items.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{listings.items.map((item) => <ItemCard key={item.id} item={item} />)}</section>
      ) : (
        <section className="empty-state"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name="browse" className="size-5" /></span><p className="mt-4 font-semibold text-slate-700">{listings.error || "No recently reported items yet."}</p><p className="mt-2 text-sm text-slate-500">Lost and found reports will appear here after they are submitted.</p></section>
      )}
    </>
  );
}

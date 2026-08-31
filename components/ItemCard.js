/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "./Icon";

export default function ItemCard({ item }) {
  const href = `/items/${item.type.toLowerCase()}/${item.reportId}`;

  return (
    <Link href={href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2" aria-label={`View ${item.type.toLowerCase()} item: ${item.title}`}>
      <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)] transition duration-200 group-hover:border-slate-300 group-hover:shadow-[0_12px_28px_rgba(15,23,42,.08)]">
        <div className={`relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br ${item.color}`}>
          {item.imageUrl ? <img className="absolute inset-0 size-full object-cover" src={item.imageUrl} alt={`${item.title} ${item.type.toLowerCase()} item`} /> : <span className="relative grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold tracking-tight text-white shadow-sm backdrop-blur-sm">{item.mark}</span>}
          <div className="absolute inset-0 bg-slate-950/10" />
          <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm ${item.type === "Lost" ? "border-rose-100 bg-rose-50 text-rose-700" : "border-teal-100 bg-teal-50 text-teal-700"}`}>{item.type}</span>
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold capitalize text-white backdrop-blur-sm">{item.status || "open"}</span>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700">{item.category}</p>
          <h2 className="mt-1.5 line-clamp-1 text-[15px] font-bold text-slate-900">{item.title}</h2>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Icon name="location" className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{item.location}</span></p>
            <p className="flex items-center gap-2"><Icon name="calendar" className="size-3.5 shrink-0 text-slate-400" />{item.date}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

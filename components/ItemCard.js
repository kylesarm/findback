import Link from "next/link";
import Icon from "./Icon";
import ItemImage from "./ItemImage";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }) {
  return (
    <Link
      href={`/items/${item.type.toLowerCase()}/${item.reportId}`}
      className="item-card group block min-w-0 rounded-2xl"
      aria-label={`View ${item.type.toLowerCase()} item: ${item.title}`}
    >
      <article className="surface-card h-full overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-lg group-hover:shadow-slate-900/5">
        <div className="relative">
          <ItemImage
            src={item.imageUrl}
            name={item.title}
            className="aspect-[16/10]"
          />
          <div className="absolute left-3 top-3">
            <StatusBadge status={item.type} />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {item.category}
            </p>
            <StatusBadge status={item.status} dot />
          </div>
          <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-6 tracking-tight text-slate-900">
            {item.title}
          </h2>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="location" className="size-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="size-3.5" />
              {item.date}
            </span>
            <Icon
              name="arrowRight"
              className="item-card-arrow size-4 transition"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

import Link from "next/link";
import Icon from "./Icon";

export default function EmptyState({
  icon = "browse",
  title,
  description,
  href,
  action,
  error = false,
}) {
  return (
    <section className="empty-state" role={error ? "alert" : undefined}>
      <span
        className={`mx-auto grid size-14 place-items-center rounded-2xl border ${error ? "border-amber-200 bg-amber-50 text-amber-700" : "border-brand-100 bg-brand-50 text-brand-600"}`}
      >
        <Icon name={icon} className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {href && action && (
        <Link href={href} className="btn-secondary mt-6">
          {action}
          <Icon name="arrowRight" />
        </Link>
      )}
    </section>
  );
}

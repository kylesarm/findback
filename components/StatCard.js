import Link from "next/link";
import Icon from "./Icon";

export default function StatCard({ label, value, note, icon, href }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-.05em] text-slate-950 tabular-nums">
        {value}
      </p>
      {note && <p className="mt-3 text-xs leading-5 text-slate-500">{note}</p>}
    </>
  );
  const className =
    "surface-card block min-w-0 p-5 transition hover:border-brand-200";
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

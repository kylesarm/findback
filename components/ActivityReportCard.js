/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Icon from "./Icon";
import ReportDeleteButton from "./ReportDeleteButton";

function formatItemDate(value) {
  if (!value) return "Date not provided";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatCreatedDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function initials(value) {
  return String(value || "Item").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function ActivityReportCard({ report }) {
  const detailsHref = `/items/${report.type}/${report.id}`;
  const editHref = `${detailsHref}/edit`;

  return (
    <article className="surface-card overflow-hidden">
      <div className="grid sm:grid-cols-[160px_minmax(0,1fr)]">
        <Link href={detailsHref} className="relative grid min-h-40 place-items-center overflow-hidden bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500">
          {report.imageUrl ? <img className="absolute inset-0 size-full object-cover" src={report.imageUrl} alt={`${report.itemName} ${report.type} item`} /> : <span className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/10 text-xl font-bold text-white">{initials(report.itemName)}</span>}
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${report.type === "lost" ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700"}`}>{report.type}</span>
        </Link>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">{report.category}</p><h3 className="mt-1.5 truncate text-lg font-bold tracking-tight text-slate-950">{report.itemName}</h3></div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600">{report.status}</span>
          </div>

          <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <p className="flex items-center gap-2"><Icon name="location" className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{report.location}</span></p>
            <p className="flex items-center gap-2"><Icon name="calendar" className="size-3.5 shrink-0 text-slate-400" />{report.type === "lost" ? "Lost" : "Found"} {formatItemDate(report.itemDate)}</p>
            <p className="flex items-center gap-2 sm:col-span-2"><Icon name="info" className="size-3.5 shrink-0 text-slate-400" />Created {formatCreatedDate(report.createdAt)}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-2 border-t border-slate-100 pt-4">
            <Link className="btn-secondary min-h-9 px-3 py-2 text-xs" href={detailsHref}>View details</Link>
            <Link className="btn-secondary min-h-9 px-3 py-2 text-xs" href={editHref}>Edit</Link>
            <ReportDeleteButton report={report} />
          </div>
        </div>
      </div>
    </article>
  );
}

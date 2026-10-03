import Link from "next/link";
import ItemImage from "./ItemImage";
import StatusBadge from "./StatusBadge";
import Icon from "@/components/Icon";
import ReportDeleteButton from "@/components/ReportDeleteButton";

function formatDate(value, dateOnly = false) {
  if (!value) return "Not provided";
  const date = dateOnly ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : undefined,
  }).format(date);
}

function initials(value) {
  return String(value || "Item")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function AdminReportCard({ report }) {
  const detailsHref = `/items/${report.type}/${report.id}`;

  return (
    <article className="surface-card overflow-hidden">
      <div className="grid sm:grid-cols-[132px_minmax(0,1fr)]">
        <Link
          className="relative grid min-h-36 place-items-center overflow-hidden bg-slate-900"
          href={detailsHref}
        >
          <ItemImage
            src={report.imageUrl}
            name={report.itemName}
            className="absolute inset-0"
          />
          <span className="absolute left-3 top-3">
            <StatusBadge status={report.type} />
          </span>
        </Link>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-brand-700">
                {report.category}
              </p>
              <h2 className="mt-1 truncate text-base font-bold text-slate-950">
                {report.itemName}
              </h2>
            </div>
            <StatusBadge status={report.status} dot />
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {report.description}
          </p>
          <div className="mt-3 grid gap-1.5 text-[11px] text-slate-500">
            <p className="flex items-center gap-1.5">
              <Icon name="location" className="size-3.5 text-slate-500" />
              <span className="truncate">{report.location}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Icon name="calendar" className="size-3.5 text-slate-500" />
              Item date {formatDate(report.itemDate, true)} · Created{" "}
              {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            <Link
              className="btn-secondary min-h-9 px-3 py-2 text-xs"
              href={detailsHref}
            >
              View details
            </Link>
            <ReportDeleteButton adminModeration report={report} />
          </div>
        </div>
      </div>
    </article>
  );
}

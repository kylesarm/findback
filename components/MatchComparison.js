import Link from "next/link";
import Icon from "./Icon";
import ItemImage from "./ItemImage";
import { MATCH_WEIGHTS } from "@/lib/matching";

function formatDate(value) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
const fields = [
  ["category", "Category"],
  ["brand", "Brand"],
  ["color", "Color"],
  ["location", "Location"],
  ["date", "Date"],
  ["description", "Description"],
];
function itemValue(item, field) {
  return field === "date"
    ? formatDate(item.itemDate)
    : item[field] || "Not provided";
}
function ComparedItem({ item, type, label }) {
  return (
    <Link
      href={`/items/${type}/${item.id}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
    >
      <ItemImage
        src={item.imageUrl}
        name={item.itemName}
        className="size-16 shrink-0 rounded-lg"
        compact
      />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900 group-hover:text-brand-600">
          {item.itemName}
        </h3>
        <p className="mt-1 truncate text-xs text-slate-500">{item.location}</p>
      </div>
    </Link>
  );
}

export default function MatchComparison({
  match,
  top = false,
  showAction = true,
}) {
  return (
    <article className="surface-card min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Icon name="matches" className="size-4 text-brand-600" />
          Possible Match
          {top && (
            <span className="ml-1 rounded-md bg-brand-50 px-2 py-1 text-[10px] text-brand-700">
              Highest score
            </span>
          )}
        </p>
        <span className="text-[11px] text-slate-500">
          Weighted Similarity Matching
        </span>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 p-3 sm:p-5">
          <div className="grid items-center gap-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <ComparedItem
              item={match.lostItem}
              type="lost"
              label="Your lost item"
            />
            <span className="mx-auto grid size-8 place-items-center rounded-full border border-slate-200 text-slate-400">
              <Icon name="matches" />
            </span>
            <ComparedItem
              item={match.foundItem}
              type="found"
              label="Possible found item"
            />
          </div>
          <div
            className="mt-4 flex flex-wrap gap-2 px-3"
            aria-label="Matching attributes"
          >
            {match.reasons.map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-50/80 px-2.5 py-1.5 text-[11px] font-medium text-brand-800"
              >
                <Icon name="check" className="size-3" />
                {reason}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-slate-100 bg-brand-50 p-5 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500">
            Similarity Score
          </p>
          <p className="mt-2 text-4xl font-semibold leading-none tracking-[-.05em] text-brand-700 tabular-nums">
            {match.score}
            <span className="ml-0.5 text-xl">%</span>
          </p>
          <div
            role="meter"
            aria-label="Similarity Score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={match.score}
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-100"
          >
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${match.score}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Similarity between records.
            <br />
            Not proof of ownership.
          </p>
          {showAction && (
            <Link
              href={`/matches/${match.foundItem.id}/claim?lost=${match.lostItem.id}`}
              className="btn-primary mt-4 text-xs"
            >
              Review & claim
              <Icon name="arrowRight" />
            </Link>
          )}
        </div>
      </div>
      <details className="group border-t border-slate-200">
        <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <span>Compare all six attributes</span>
          <Icon
            name="chevronDown"
            className="size-4 transition group-open:rotate-180"
          />
        </summary>
        <div className="border-t border-slate-100 px-4 pb-4 sm:px-6">
          <div className="hidden grid-cols-[110px_1fr_1fr_160px] gap-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 lg:grid">
            <span>Attribute</span>
            <span>Your lost report</span>
            <span>Found report</span>
            <span>Contribution</span>
          </div>
          {fields.map(([key, label]) => {
            const reason = match.reasons.find((reason) =>
              reason.toLowerCase().includes(key === "date" ? "dates" : key),
            );
            return (
              <div
                key={key}
                className="grid gap-2 border-t border-slate-100 py-4 text-xs lg:grid-cols-[110px_1fr_1fr_160px] lg:gap-4"
              >
                <p className="font-semibold text-slate-700">
                  {label}
                  <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                    {MATCH_WEIGHTS[key]}%
                  </span>
                </p>
                <p className="min-w-0 break-words leading-6 text-slate-600">
                  <span className="mr-2 text-[10px] font-semibold text-slate-400 lg:hidden">
                    LOST
                  </span>
                  {itemValue(match.lostItem, key)}
                </p>
                <p className="min-w-0 break-words leading-6 text-slate-600">
                  <span className="mr-2 text-[10px] font-semibold text-slate-400 lg:hidden">
                    FOUND
                  </span>
                  {itemValue(match.foundItem, key)}
                </p>
                <p
                  className={`flex items-start gap-1.5 text-[11px] leading-5 ${reason ? "text-brand-700" : "text-slate-500"}`}
                >
                  <Icon
                    name={reason ? "check" : "info"}
                    className="mt-0.5 size-3.5 shrink-0"
                  />
                  {reason || "Different or not provided"}
                </p>
              </div>
            );
          })}
          <p className="border-t border-slate-100 pt-4 text-[11px] leading-6 text-slate-500">
            Only the same normalized category enters scoring. Missing or
            dissimilar attributes contribute no points. Private verification
            details are never included.
          </p>
        </div>
      </details>
    </article>
  );
}

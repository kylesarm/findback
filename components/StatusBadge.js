const tones = {
  lost: "border-amber-200 bg-amber-50 text-amber-800",
  found: "border-emerald-200 bg-emerald-50 text-emerald-800",
  open: "border-brand-200 bg-brand-50 text-brand-700",
  matched: "border-sky-200 bg-sky-50 text-sky-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export default function StatusBadge({ status, dot = false }) {
  return (
    <span
      className={`status-badge ${tones[String(status).toLowerCase()] || "border-slate-200 bg-slate-50 text-slate-600"}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {String(status || "Unknown").replaceAll("_", " ")}
    </span>
  );
}

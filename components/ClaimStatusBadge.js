const statusStyles = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    step: 1,
  },
  under_review: {
    label: "Under review",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    step: 2,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-600",
    step: 3,
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    step: 1,
  },
};

export function getClaimStatusMeta(status) {
  return (
    statusStyles[status] || {
      label: "Unknown",
      className: "border-slate-200 bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
      step: 1,
    }
  );
}

export default function ClaimStatusBadge({ status }) {
  const meta = getClaimStatusMeta(status);
  return (
    <span className={`status-badge ${meta.className}`}>
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

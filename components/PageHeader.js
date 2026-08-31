export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

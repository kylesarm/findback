export default function FormField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] font-semibold text-slate-700">
        {label}
        {hint && (
          <span className="text-[11px] font-normal text-slate-500">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

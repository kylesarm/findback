export default function FormField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-[13px] font-semibold text-slate-700">{label}{hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}</span>
      {children}
    </label>
  );
}

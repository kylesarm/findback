import Link from "next/link";

export default function Brand({ compact = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="FindBack home">
      <span className="grid size-9 place-items-center rounded-[11px] bg-[#0b1220] text-sm font-extrabold text-teal-300 shadow-sm ring-1 ring-slate-900/10">F</span>
      {!compact && <span className="text-[17px] font-extrabold tracking-[-0.025em] text-slate-950">Find<span className="text-teal-700">Back</span></span>}
    </Link>
  );
}

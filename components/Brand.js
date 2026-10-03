import Link from "next/link";
import Image from "next/image";

export default function Brand({ compact = false, dark = false, href = "/" }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-2.5"
      aria-label="Findmatch home"
    >
      <span className="grid h-11 w-10 shrink-0 place-items-center">
        <Image src="/logo.svg" alt="" width={34} height={40} className="h-10 w-auto object-contain" />
      </span>
      {!compact && (
        <span
          className={`text-lg font-bold tracking-[-.045em] ${dark ? "text-white" : "text-slate-950"}`}
        >
          Find<span className={dark ? "text-teal-300" : "text-brand-700"}>match</span><span className="text-teal-500">.</span>
        </span>
      )}
    </Link>
  );
}

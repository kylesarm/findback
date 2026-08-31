/* eslint-disable @next/next/no-img-element */

export default function Avatar({ src, initials, alt = "", className = "size-9 rounded-xl text-xs" }) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden bg-teal-700 font-bold text-white shadow-sm ${className}`}>
      {src ? <img className="size-full object-cover" src={src} alt={alt} /> : initials}
    </span>
  );
}

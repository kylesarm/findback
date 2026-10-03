"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export default function Avatar({
  src,
  initials,
  alt = "",
  className = "size-9 rounded-xl text-xs",
}) {
  const [failedSource, setFailedSource] = useState(null);
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden bg-brand-100 font-semibold text-brand-800 ring-1 ring-inset ring-brand-200/50 ${className}`}
    >
      {src && failedSource !== src ? (
        <img
          className="size-full object-cover"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSource(src)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

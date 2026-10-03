"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Icon from "./Icon";

export default function ItemImage({
  src,
  name = "Item",
  className = "",
  fit = "cover",
  priority = false,
  compact = false,
}) {
  const [failedSource, setFailedSource] = useState(null);
  const mark = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={`item-placeholder relative grid place-items-center overflow-hidden ${className}`}
    >
      {src && failedSource !== src ? (
        <img
          src={src}
          alt={name}
          className={`absolute inset-0 size-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedSource(src)}
        />
      ) : (
        <div
          className={`flex flex-col items-center gap-2 ${compact ? "" : "py-6"}`}
        >
          <span
            className={
              compact
                ? "text-sm font-semibold"
                : "grid size-16 place-items-center rounded-2xl border border-white bg-white/60 text-xl font-semibold tracking-tight shadow-sm"
            }
          >
            {mark || <Icon name="image" className="size-7" />}
          </span>
          {!compact && (
            <span className="text-[10px] font-medium tracking-wide">
              {src ? "Photo unavailable" : "No photo provided"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

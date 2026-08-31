"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploadField({ name, label, help, maxBytes, initialUrl = null, initials = "IM", compact = false }) {
  const inputRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [error, setError] = useState(null);
  const previewUrl = objectUrl || initialUrl;

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    setObjectUrl(null);
    setError(null);
  }

  function handleChange(event) {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setObjectUrl(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      event.target.value = "";
      setObjectUrl(null);
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > maxBytes) {
      event.target.value = "";
      setObjectUrl(null);
      setError(`Choose an image no larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }

    setObjectUrl(URL.createObjectURL(file));
  }

  return (
    <div>
      <div className={`flex gap-4 ${compact ? "items-center" : "flex-col sm:flex-row sm:items-center"}`}>
        <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-lg font-bold text-slate-500 ${compact ? "size-20" : "h-40 w-full sm:w-52"}`}>
          {previewUrl ? <img className="size-full object-cover" src={previewUrl} alt={`${label} preview`} /> : <><Icon name="profile" className="mb-1 size-6 text-slate-400" /><span>{initials}</span></>}
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-[13px] font-semibold text-slate-700" htmlFor={`${name}-input`}>{label}</label>
          <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="btn-secondary min-h-9 cursor-pointer py-2 text-xs" htmlFor={`${name}-input`}>{previewUrl ? "Choose another" : "Choose image"}</label>
            {objectUrl && <button className="min-h-9 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100" type="button" onClick={clearSelection}>Clear selection</button>}
          </div>
          <input ref={inputRef} className="sr-only" id={`${name}-input`} name={name} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} aria-describedby={`${name}-help`} />
          <p className="sr-only" id={`${name}-help`}>{help}</p>
          {error && <p className="mt-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}

const paths = {
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  filter: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="17" r="2" fill="currentColor" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1" />
      <path d="m3 16 5-5 4 4 3-3 6 6" />
    </>
  ),
  upload: (
    <path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
  ),
  logout: <path d="M9 5H4v14h5m4-7h8m-4-4 4 4-4 4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3l7 3v5c0 4.4-2.9 8.4-7 10-4.1-1.6-7-5.6-7-10V6l7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.7-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  browse: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  calendar: (
    <>
      <path d="M6 2v4M18 2v4M3 9h18" />
      <rect x="3" y="4" width="18" height="17" rx="2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  claims: (
    <>
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6M9 12h4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  found: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  lost: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </>
  ),
  matches: (
    <>
      <path d="M8 7h11l-3-3M16 17H5l3 3" />
      <path d="M19 7l-3 3M5 17l3-3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
};

export default function Icon({ name, className = "size-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  );
}

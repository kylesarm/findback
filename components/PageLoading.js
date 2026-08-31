export default function PageLoading({ cards = 3 }) {
  return (
    <div aria-busy="true" aria-label="Loading page" role="status">
      <span className="sr-only">Loading…</span>
      <div className="mb-7 border-b border-slate-200 pb-6">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton mt-3 h-8 w-64 max-w-full rounded-lg" />
        <div className="skeleton mt-3 h-4 w-[420px] max-w-full rounded-md" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => <div className="surface-card p-5" key={index}><div className="flex items-center gap-3"><div className="skeleton size-10 rounded-xl" /><div className="flex-1"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton mt-2 h-6 w-16 rounded" /></div></div><div className="skeleton mt-4 h-3 w-full rounded" /></div>)}
      </div>
      <div className="surface-card mt-6 p-6"><div className="skeleton h-5 w-44 rounded" /><div className="mt-5 space-y-3">{Array.from({ length: 3 }, (_, index) => <div className="skeleton h-16 w-full rounded-xl" key={index} />)}</div></div>
    </div>
  );
}

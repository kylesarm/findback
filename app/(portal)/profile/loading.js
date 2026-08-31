export default function ProfileLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading profile activity">
      <div className="mb-7 border-b border-slate-200 pb-6"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton mt-3 h-9 w-64 rounded" /><div className="skeleton mt-3 h-4 max-w-xl rounded" /></div>
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="space-y-4"><div className="grid grid-cols-3 gap-3"><div className="skeleton h-28 rounded-2xl" /><div className="skeleton h-28 rounded-2xl" /><div className="skeleton h-28 rounded-2xl" /></div><div className="skeleton h-64 rounded-2xl" /></div>
      </div>
      <div className="skeleton mt-10 h-80 rounded-2xl" />
    </div>
  );
}

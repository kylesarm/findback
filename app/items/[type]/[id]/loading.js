export default function ItemDetailsLoading() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse px-5 py-8 sm:px-8 sm:py-12" aria-label="Loading item details">
      <div className="mb-6 h-5 w-64 rounded bg-slate-200" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="min-h-72 bg-slate-200 sm:min-h-[430px]" />
          <div className="space-y-4 p-6"><div className="h-4 w-28 rounded bg-slate-200" /><div className="h-9 w-2/3 rounded bg-slate-200" /><div className="h-24 rounded bg-slate-100" /></div>
        </div>
        <div className="h-52 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </main>
  );
}

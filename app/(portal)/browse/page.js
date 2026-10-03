import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import ItemCard from "@/components/ItemCard";
import PageHeader from "@/components/PageHeader";
import {
  getListings,
  LISTING_CATEGORIES,
  LISTING_PAGE_SIZE,
  normalizeListingFilters,
} from "@/lib/data/items";

export const metadata = { title: "Browse and search items" };

function browseHref(filters, page) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.reportType !== "all") params.set("type", filters.reportType);
  if (filters.location) params.set("location", filters.location);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort === "oldest") params.set("sort", "oldest");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}

function FilterLabel({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.11em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Pagination({ filters, page, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row"
      aria-label="Browse results pagination"
    >
      {page > 1 ? (
        <Link
          className="btn-secondary w-full sm:w-auto"
          href={browseHref(filters, page - 1)}
        >
          ← Previous
        </Link>
      ) : (
        <span
          className="btn-secondary w-full cursor-not-allowed opacity-50 sm:w-auto"
          aria-disabled="true"
        >
          ← Previous
        </span>
      )}
      <p className="text-xs font-semibold text-slate-500">
        Page <span className="text-slate-900">{page}</span> of{" "}
        <span className="text-slate-900">{totalPages}</span>
      </p>
      {page < totalPages ? (
        <Link
          className="btn-secondary w-full sm:w-auto"
          href={browseHref(filters, page + 1)}
        >
          Next →
        </Link>
      ) : (
        <span
          className="btn-secondary w-full cursor-not-allowed opacity-50 sm:w-auto"
          aria-disabled="true"
        >
          Next →
        </span>
      )}
    </nav>
  );
}

export default async function BrowsePage({ searchParams }) {
  const filters = normalizeListingFilters(await searchParams);
  const listings = await getListings(filters);
  const hasActiveFilters = Boolean(
    filters.query ||
    filters.category ||
    filters.reportType !== "all" ||
    filters.location ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.status ||
    filters.sort === "oldest",
  );

  if (
    !listings.error &&
    !listings.filterError &&
    listings.totalPages > 0 &&
    listings.page > listings.totalPages
  ) {
    redirect(browseHref(filters, listings.totalPages));
  }

  const firstResult = listings.items.length
    ? (listings.page - 1) * LISTING_PAGE_SIZE + 1
    : 0;
  const lastResult = listings.items.length
    ? firstResult + listings.items.length - 1
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="The campus community board"
        title="Find something familiar."
        description="Search lost and found reports. A small detail could be the connection you need."
        action={
          <Link className="btn-secondary" href="/report-found">
            <Icon name="found" />
            Report an item
          </Link>
        }
      />

      <form
        action="/browse"
        method="get"
        className="surface-card mb-6 p-4 sm:p-5"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_200px_180px]">
          <FilterLabel label="Keywords">
            <span className="relative block">
              <Icon
                name="search"
                className="absolute left-3.5 top-3.5 size-[18px] text-brand-500"
              />
              <input
                className="field-control pl-11"
                name="q"
                defaultValue={filters.query}
                maxLength={100}
                placeholder="Search names, brands, colors, or details…"
              />
            </span>
          </FilterLabel>
          <FilterLabel label="Category">
            <select
              className="field-control"
              name="category"
              defaultValue={filters.category}
            >
              <option value="">All categories</option>
              {LISTING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FilterLabel>
          <FilterLabel label="Report type">
            <select
              className="field-control"
              name="type"
              defaultValue={filters.reportType}
            >
              <option value="all">Lost and found</option>
              <option value="lost">Lost items</option>
              <option value="found">Found items</option>
            </select>
          </FilterLabel>
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-3">
          <FilterLabel label="Location">
            <span className="relative block">
              <Icon
                name="location"
                className="absolute left-3 top-3 size-4 text-slate-500"
              />
              <input
                className="field-control pl-9"
                name="location"
                defaultValue={filters.location}
                maxLength={100}
                placeholder="Building or campus area"
              />
            </span>
          </FilterLabel>
          <FilterLabel label="From date">
            <input
              className="field-control"
              name="from"
              type="date"
              defaultValue={filters.dateFrom}
            />
          </FilterLabel>
          <FilterLabel label="To date">
            <input
              className="field-control"
              name="to"
              type="date"
              defaultValue={filters.dateTo}
            />
          </FilterLabel>
          <FilterLabel label="Status">
            <select
              className="field-control"
              name="status"
              defaultValue={filters.status}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
            </select>
          </FilterLabel>
          <FilterLabel label="Sort by">
            <select
              className="field-control"
              name="sort"
              defaultValue={filters.sort}
            >
              <option value="newest">Newest reports first</option>
              <option value="oldest">Oldest reports first</option>
            </select>
          </FilterLabel>
          <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
            {hasActiveFilters && (
              <Link
                className="btn-secondary flex-1 xl:flex-none"
                href="/browse"
              >
                Clear
              </Link>
            )}
            <button className="btn-primary flex-1 xl:min-w-28" type="submit">
              Search
            </button>
          </div>
        </div>

        {listings.filterError && (
          <p
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
            role="alert"
          >
            {listings.filterError}
          </p>
        )}
      </form>

      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          {listings.totalCount > 0 ? (
            <>
              <span className="font-bold text-slate-800">
                Showing {firstResult}–{lastResult}
              </span>{" "}
              of {listings.totalCount}{" "}
              {listings.totalCount === 1 ? "item" : "items"}
            </>
          ) : (
            <span className="font-bold text-slate-800">0 items</span>
          )}
          {hasActiveFilters ? " matching your filters" : " currently listed"}
        </p>
        <span className="text-xs text-slate-500">
          {filters.sort === "oldest" ? "Oldest first" : "Newest first"}
        </span>
      </div>

      {listings.error ? (
        <section className="empty-state">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Icon name="info" className="size-5" />
          </span>
          <p className="mt-4 font-semibold text-slate-700">
            Browse results are unavailable
          </p>
          <p className="mt-2 text-sm text-slate-500">{listings.error}</p>
        </section>
      ) : listings.items.length > 0 ? (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {listings.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </section>
          <Pagination
            filters={filters}
            page={listings.page}
            totalPages={listings.totalPages}
          />
        </>
      ) : (
        <section className="empty-state">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <Icon name="browse" className="size-5" />
          </span>
          <p className="mt-4 font-semibold text-slate-700">
            {hasActiveFilters
              ? "No items match your search."
              : "No recently reported items yet."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {hasActiveFilters
              ? "Try broader keywords, remove a filter, or adjust the date range."
              : "Lost and found reports will appear here after they are submitted."}
          </p>
          {hasActiveFilters && (
            <Link className="btn-secondary mt-5" href="/browse">
              Clear all filters
            </Link>
          )}
        </section>
      )}
    </>
  );
}

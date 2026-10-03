import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";

const LISTING_COLUMNS =
  "id,item_name,category,brand,color,description,location,item_date,image_path,status,created_at,updated_at";
const UNIFIED_LISTING_COLUMNS = `report_type,${LISTING_COLUMNS}`;
const SEARCHABLE_LISTING_COLUMNS = [
  "item_name",
  "category",
  "brand",
  "color",
  "description",
  "location",
];
const MISSING_UNIFIED_VIEW_CODES = new Set(["42P01", "PGRST205"]);

export const LISTING_PAGE_SIZE = 12;
export const LISTING_CATEGORIES = Object.freeze([
  "Electronics",
  "ID & cards",
  "Bags",
  "Clothing",
  "Books & notes",
  "Accessories",
  "Bottles",
  "Other",
]);

const LISTING_CATEGORY_SET = new Set(LISTING_CATEGORIES);
const REPORT_TYPES = new Set(["all", "lost", "found"]);
const MAX_FILTER_LENGTH = 100;

const categoryGradients = {
  accessories: "from-violet-400 to-purple-700",
  bags: "from-emerald-500 to-teal-800",
  bottles: "from-cyan-500 to-teal-800",
  "books & notes": "from-amber-400 to-orange-600",
  clothing: "from-pink-400 to-rose-700",
  electronics: "from-slate-500 to-slate-900",
  "id & cards": "from-sky-500 to-blue-800",
};

function formatDate(value) {
  if (!value) return "Date not provided";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function getMark(itemName) {
  const words = itemName.trim().split(/\s+/).filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function toListingItem(row, type) {
  return {
    id: `${type.toLowerCase()}:${row.id}`,
    reportId: row.id,
    title: row.item_name,
    category: row.category,
    type,
    location: row.location,
    date: formatDate(row.item_date),
    color:
      categoryGradients[row.category?.toLowerCase()] ||
      "from-teal-500 to-slate-800",
    mark: getMark(row.item_name),
    status: row.status,
    createdAt: row.created_at,
    imagePath: row.image_path,
    imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, row.image_path),
  };
}

function stringParam(value) {
  return typeof value === "string" ? value.trim() : "";
}

function searchableTokens(value) {
  return stringParam(value)
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function ilikePattern(value) {
  const tokens = searchableTokens(value);
  return tokens.length ? `%${tokens.join("%")}%` : null;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : "";
}

export function normalizeListingFilters(params = {}) {
  const query = stringParam(params.q).slice(0, MAX_FILTER_LENGTH);
  const location = stringParam(params.location).slice(0, MAX_FILTER_LENGTH);
  const categoryValue = stringParam(params.category);
  const reportTypeValue = stringParam(params.type).toLowerCase();
  const dateFrom = validDate(stringParam(params.from));
  const dateTo = validDate(stringParam(params.to));
  const requestedPage = Number.parseInt(stringParam(params.page), 10);

  return {
    query,
    location,
    category: LISTING_CATEGORY_SET.has(categoryValue) ? categoryValue : "",
    reportType: REPORT_TYPES.has(reportTypeValue) ? reportTypeValue : "all",
    status: ["open", "matched", "resolved"].includes(params.status)
      ? params.status
      : "",
    sort: params.sort === "oldest" ? "oldest" : "newest",
    dateFrom,
    dateTo,
    page: Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1,
    validationError:
      dateFrom && dateTo && dateFrom > dateTo
        ? "The start date must be on or before the end date."
        : null,
  };
}

function applyListingFilters(query, filters) {
  const searchPattern = ilikePattern(filters.query);
  const locationPattern = ilikePattern(filters.location);
  let filteredQuery = query;

  if (searchPattern) {
    const searchExpression = SEARCHABLE_LISTING_COLUMNS.map(
      (column) => `${column}.ilike.${searchPattern}`,
    ).join(",");
    filteredQuery = filteredQuery.or(searchExpression);
  }

  if (filters.category)
    filteredQuery = filteredQuery.eq("category", filters.category);
  if (filters.status)
    filteredQuery = filteredQuery.eq("status", filters.status);
  if (locationPattern)
    filteredQuery = filteredQuery.ilike("location", locationPattern);
  if (filters.dateFrom)
    filteredQuery = filteredQuery.gte("item_date", filters.dateFrom);
  if (filters.dateTo)
    filteredQuery = filteredQuery.lte("item_date", filters.dateTo);

  return filteredQuery;
}

function listingQuery(supabase, view, filters, fetchLimit) {
  const query = supabase
    .from(view)
    .select(LISTING_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: filters.sort === "oldest" })
    .order("id", { ascending: true })
    .range(0, fetchLimit - 1);

  return applyListingFilters(query, filters);
}

async function getListingsFromSafeViews(supabase, filters) {
  const fetchLimit = filters.page * LISTING_PAGE_SIZE;
  const includeLost = filters.reportType !== "found";
  const includeFound = filters.reportType !== "lost";
  const emptyResult = Promise.resolve({ data: [], count: 0, error: null });
  const [lostResult, foundResult] = await Promise.all([
    includeLost
      ? listingQuery(supabase, "lost_item_listings", filters, fetchLimit)
      : emptyResult,
    includeFound
      ? listingQuery(supabase, "found_item_listings", filters, fetchLimit)
      : emptyResult,
  ]);

  if (lostResult.error || foundResult.error) return null;

  const combinedItems = [
    ...(lostResult.data || []).map((item) => toListingItem(item, "Lost")),
    ...(foundResult.data || []).map((item) => toListingItem(item, "Found")),
  ].sort(
    (a, b) =>
      (filters.sort === "oldest" ? 1 : -1) *
        (new Date(a.createdAt) - new Date(b.createdAt)) ||
      a.type.localeCompare(b.type) ||
      a.reportId.localeCompare(b.reportId),
  );
  const offset = (filters.page - 1) * LISTING_PAGE_SIZE;
  const totalCount = (lostResult.count || 0) + (foundResult.count || 0);

  return {
    items: combinedItems.slice(offset, offset + LISTING_PAGE_SIZE),
    totalCount,
    totalPages:
      totalCount === 0 ? 0 : Math.ceil(totalCount / LISTING_PAGE_SIZE),
    page: filters.page,
    error: null,
    filterError: null,
  };
}

export async function getListings(filters = normalizeListingFilters()) {
  if (filters.validationError) {
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      page: filters.page,
      error: null,
      filterError: filters.validationError,
    };
  }

  const supabase = await createClient();
  const offset = (filters.page - 1) * LISTING_PAGE_SIZE;
  let query = supabase
    .from("item_listings")
    .select(UNIFIED_LISTING_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: filters.sort === "oldest" })
    .order("report_type", { ascending: true })
    .order("id", { ascending: true })
    .range(offset, offset + LISTING_PAGE_SIZE - 1);

  query = applyListingFilters(query, filters);
  if (filters.reportType !== "all")
    query = query.eq("report_type", filters.reportType);

  const result = await query;

  if (result.error && MISSING_UNIFIED_VIEW_CODES.has(result.error.code)) {
    const fallback = await getListingsFromSafeViews(supabase, filters);
    if (fallback) return fallback;
  }

  if (result.error) {
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      page: filters.page,
      error:
        "Recently reported items could not be loaded. Please try again shortly.",
      filterError: null,
    };
  }

  const totalCount = result.count || 0;
  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / LISTING_PAGE_SIZE);

  return {
    items: (result.data || []).map((item) =>
      toListingItem(item, item.report_type === "lost" ? "Lost" : "Found"),
    ),
    totalCount,
    totalPages,
    page: filters.page,
    error: null,
    filterError: null,
  };
}

const loadRecentListings = cache(async (limit) => {
  const supabase = await createClient();
  const filters = normalizeListingFilters();
  const [lostResult, foundResult] = await Promise.all([
    applyListingFilters(
      supabase
        .from("lost_item_listings")
        .select(LISTING_COLUMNS)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .limit(limit),
      filters,
    ),
    applyListingFilters(
      supabase
        .from("found_item_listings")
        .select(LISTING_COLUMNS)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .limit(limit),
      filters,
    ),
  ]);

  if (lostResult.error || foundResult.error) {
    return {
      items: [],
      error:
        "Recently reported items could not be loaded. Please try again shortly.",
    };
  }

  const items = [
    ...(lostResult.data || []).map((item) => toListingItem(item, "Lost")),
    ...(foundResult.data || []).map((item) => toListingItem(item, "Found")),
  ].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt) ||
      a.type.localeCompare(b.type) ||
      a.reportId.localeCompare(b.reportId),
  );

  return { items: items.slice(0, limit), error: null };
});

export async function getRecentListings(limit = 3) {
  return loadRecentListings(limit);
}

import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";

const LISTING_COLUMNS = "id,item_name,category,brand,color,description,location,item_date,image_path,status,created_at,updated_at";

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

  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
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
    color: categoryGradients[row.category?.toLowerCase()] || "from-teal-500 to-slate-800",
    mark: getMark(row.item_name),
    status: row.status,
    createdAt: row.created_at,
    imagePath: row.image_path,
    imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, row.image_path),
  };
}

const loadListings = cache(async () => {
  const supabase = await createClient();
  const [lostResult, foundResult] = await Promise.all([
    supabase
      .from("lost_item_listings")
      .select(LISTING_COLUMNS)
      .order("created_at", { ascending: false }),
    supabase
      .from("found_item_listings")
      .select(LISTING_COLUMNS)
      .order("created_at", { ascending: false }),
  ]);

  if (lostResult.error || foundResult.error) {
    return {
      items: [],
      error: "Recently reported items could not be loaded. Please try again shortly.",
    };
  }

  const items = [
    ...(lostResult.data || []).map((item) => toListingItem(item, "Lost")),
    ...(foundResult.data || []).map((item) => toListingItem(item, "Found")),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { items, error: null };
});

export async function getListings() {
  return loadListings();
}

export async function getRecentListings(limit = 3) {
  const result = await loadListings();

  return { ...result, items: result.items.slice(0, limit) };
}

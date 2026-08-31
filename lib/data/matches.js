import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { toListingItem } from "@/lib/data/items";
import { findPossibleMatches, MINIMUM_MATCH_SCORE } from "@/lib/matching";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);

export const getPossibleMatches = cache(async () => {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_item_matching_candidates");

  if (error) {
    return {
      matches: [],
      lostReports: [],
      lostItemCount: 0,
      minimumScore: MINIMUM_MATCH_SCORE,
      error: MISSING_MIGRATION_CODES.has(error.code)
        ? "The Stage 4 database migration needs to be applied before matches can be calculated."
        : "Possible matches could not be loaded. Please try again shortly.",
    };
  }

  const candidates = Array.isArray(data) ? data : [];
  const lostItems = candidates.filter((item) => item.report_type === "lost");
  const foundItems = candidates.filter((item) => item.report_type === "found");

  const matches = findPossibleMatches(lostItems, foundItems).map((match) => ({
    ...match,
    lostItem: { ...match.lostItem, imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, match.lostItem.imagePath) },
    foundItem: { ...match.foundItem, imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, match.foundItem.imagePath) },
  }));

  return {
    matches,
    lostReports: lostItems.map((item) => toListingItem(item, "Lost")),
    lostItemCount: lostItems.length,
    minimumScore: MINIMUM_MATCH_SCORE,
    error: null,
  };
});

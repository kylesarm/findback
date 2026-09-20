import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { toListingItem } from "@/lib/data/items";
import { findPossibleMatches, MINIMUM_MATCH_SCORE } from "@/lib/matching";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);
const MATCH_NOTIFICATION_BATCH_SIZE = 100;

async function syncMatchNotifications(supabase, matches) {
  const events = matches.map((match) => ({
    lost_item_id: match.lostItem.id,
    found_item_id: match.foundItem.id,
  }));
  const authoritativeScores = new Map();

  for (let index = 0; index < events.length; index += MATCH_NOTIFICATION_BATCH_SIZE) {
    const { data, error } = await supabase.rpc("sync_match_notifications", {
      match_events: events.slice(index, index + MATCH_NOTIFICATION_BATCH_SIZE),
    });
    if (error) return null;

    for (const result of data || []) {
      authoritativeScores.set(
        `${result.lost_item_id}:${result.found_item_id}`,
        Number(result.similarity_score),
      );
    }
  }

  return authoritativeScores;
}

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
        ? "The Stage 4 database migration must be applied before Weighted Similarity Matching can calculate Possible Matches."
        : "Possible Matches could not be loaded. Please try again shortly.",
    };
  }

  const candidates = Array.isArray(data) ? data : [];
  const lostItems = candidates.filter((item) => item.report_type === "lost");
  const foundItems = candidates.filter((item) => item.report_type === "found");

  const calculatedMatches = findPossibleMatches(lostItems, foundItems).map((match) => ({
    ...match,
    lostItem: { ...match.lostItem, imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, match.lostItem.imagePath) },
    foundItem: { ...match.foundItem, imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, match.foundItem.imagePath) },
  }));

  // The Module 6 RPC recomputes scores from stored item data. When available,
  // its validated score is also the score shown by the Possible Matches UI.
  // Before the pending migration is applied, matching continues to use the
  // existing application result without breaking the current experience.
  const authoritativeScores = await syncMatchNotifications(supabase, calculatedMatches);
  const matches = authoritativeScores
    ? calculatedMatches
      .filter((match) => authoritativeScores.has(match.id))
      .map((match) => ({ ...match, score: authoritativeScores.get(match.id) }))
      .sort((left, right) => {
        const leftDateDifference = Number.isFinite(left.dateDifference) ? left.dateDifference : Number.POSITIVE_INFINITY;
        const rightDateDifference = Number.isFinite(right.dateDifference) ? right.dateDifference : Number.POSITIVE_INFINITY;

        return right.score - left.score
          || leftDateDifference - rightDateDifference
          || left.foundItem.itemName.localeCompare(right.foundItem.itemName);
      })
    : calculatedMatches;

  return {
    matches,
    lostReports: lostItems.map((item) => toListingItem(item, "Lost")),
    lostItemCount: lostItems.length,
    minimumScore: MINIMUM_MATCH_SCORE,
    error: null,
  };
});

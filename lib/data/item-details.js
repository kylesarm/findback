import "server-only";

import { cache } from "react";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);

export const getItemDetail = cache(async (type, id) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_item_detail", {
    target_type: type,
    target_id: id,
  });

  if (error) {
    return {
      item: null,
      error: MISSING_MIGRATION_CODES.has(error.code)
        ? "The Stage 7 item-details migration must be applied before this page can load."
        : "This item could not be loaded. Please try again shortly.",
    };
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { item: null, error: null };

  return {
    item: {
      type: row.report_type,
      id: row.item_id,
      itemName: row.item_name,
      category: row.category,
      brand: row.brand,
      color: row.color,
      description: row.description,
      location: row.location,
      itemDate: row.item_date,
      imagePath: row.image_path,
      imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, row.image_path),
      status: row.item_status,
      createdAt: row.item_created_at,
      updatedAt: row.item_updated_at,
      reporterLabel: row.reporter_label || "Campus community member",
      isOwnReport: Boolean(row.is_own_report),
      isClaimable: Boolean(row.is_claimable),
      hasActiveClaim: Boolean(row.has_active_claim),
    },
    error: null,
  };
});

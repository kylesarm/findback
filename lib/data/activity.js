import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { getPublicImageUrl, ITEM_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);

function migrationError(error, fallback) {
  return MISSING_MIGRATION_CODES.has(error?.code)
    ? "The Stage 8 user-activity migration must be applied before this information can load."
    : fallback;
}

function toReport(row) {
  return {
    type: row.report_type,
    id: row.report_id,
    itemName: row.item_name,
    category: row.category,
    brand: row.brand,
    color: row.color,
    description: row.description,
    location: row.location,
    itemDate: row.item_date,
    imagePath: row.image_path,
    imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, row.image_path),
    status: row.report_status,
    createdAt: row.report_created_at,
    updatedAt: row.report_updated_at,
  };
}

export const getUserActivity = cache(async () => {
  await requireUser();
  const supabase = await createClient();
  const [reportsResult, claimsResult] = await Promise.all([
    supabase.rpc("get_my_reports"),
    supabase.rpc("get_my_claim_activity"),
  ]);

  const reports = reportsResult.error ? [] : (reportsResult.data || []).map(toReport);

  return {
    lostReports: reports.filter((report) => report.type === "lost"),
    foundReports: reports.filter((report) => report.type === "found"),
    claims: claimsResult.error ? [] : (claimsResult.data || []).map((row) => ({
      id: row.claim_id,
      foundItemId: row.found_item_id,
      itemName: row.found_item_name,
      status: row.claim_status,
      createdAt: row.submitted_at,
      adminResponse: row.admin_response,
    })),
    reportsError: reportsResult.error
      ? migrationError(reportsResult.error, "Your reports could not be loaded. Please try again shortly.")
      : null,
    claimsError: claimsResult.error
      ? migrationError(claimsResult.error, "Your claim history could not be loaded. Please try again shortly.")
      : null,
  };
});

export const getManageableReport = cache(async (type, id) => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_manageable_report", {
    target_type: type,
    target_id: id,
  });

  if (error) {
    return {
      report: null,
      error: migrationError(error, "This report could not be loaded for editing."),
    };
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { report: null, error: null };

  return {
    report: {
      ...toReport(row),
      privateDetails: row.private_details,
      isOwner: Boolean(row.is_owner),
    },
    error: null,
  };
});

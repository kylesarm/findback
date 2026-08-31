import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);

function toClaimDTO(row) {
  const canVerify = row.viewer_role === "finder" || row.viewer_role === "admin";

  return {
    id: row.claim_id,
    proofDescription: row.proof_description,
    status: row.claim_status,
    adminResponse: row.admin_response,
    reviewedAt: row.reviewed_at,
    createdAt: row.claim_created_at,
    updatedAt: row.claim_updated_at,
    viewerRole: row.viewer_role,
    claimant: row.viewer_role === "admin"
      ? { name: row.claimant_name || "Claimant", email: row.claimant_email || "Email unavailable" }
      : null,
    foundItem: {
      id: row.found_item_id,
      itemName: row.found_item_name,
      category: row.found_category,
      brand: row.found_brand,
      color: row.found_color,
      description: row.found_description,
      location: row.found_location,
      itemDate: row.found_item_date,
      status: row.found_status,
    },
    privateDetails: canVerify && row.private_details ? row.private_details : null,
  };
}

export const getClaimsWorkspace = cache(async () => {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_claims_workspace");

  if (error) {
    return {
      claims: [],
      error: MISSING_MIGRATION_CODES.has(error.code)
        ? "The Stage 5 database migration needs to be applied before claims can be loaded."
        : "Claims could not be loaded. Please try again shortly.",
    };
  }

  return {
    claims: (Array.isArray(data) ? data : []).map(toClaimDTO),
    error: null,
  };
});

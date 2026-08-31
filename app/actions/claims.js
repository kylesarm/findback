"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { getPossibleMatches } from "@/lib/data/matches";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ADMIN_DECISIONS = new Set(["under_review", "approved", "rejected"]);
const MISSING_MIGRATION_CODES = new Set(["42883", "PGRST202"]);

function value(formData, name) {
  return String(formData.get(name) || "").trim();
}

function revalidateClaimViews(foundItemId = null) {
  revalidatePath("/admin");
  revalidatePath("/browse");
  revalidatePath("/claims");
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  if (foundItemId) revalidatePath(`/items/found/${foundItemId}`);
}

export async function submitClaim(previousState, formData) {
  const user = await requireUser();
  const foundItemId = value(formData, "foundItemId");
  const lostItemId = value(formData, "lostItemId");
  const legacyProof = value(formData, "proofDescription");
  const identifyingDetails = value(formData, "identifyingDetails");
  const distinguishingFeatures = value(formData, "distinguishingFeatures");
  const ownershipExplanation = value(formData, "ownershipExplanation");
  const hasStructuredProof = Boolean(identifyingDetails || distinguishingFeatures || ownershipExplanation);
  const proofDescription = hasStructuredProof
    ? [
        `Identifying details not shown publicly:\n${identifyingDetails}`,
        `Distinguishing marks, serial details, or contents:\n${distinguishingFeatures}`,
        `Why this item belongs to the claimant:\n${ownershipExplanation}`,
      ].join("\n\n")
    : legacyProof;
  const acceptedDeclaration = formData.get("declaration") === "on";

  if (!UUID_PATTERN.test(foundItemId) || (lostItemId && !UUID_PATTERN.test(lostItemId))) {
    return { error: "This found-item reference is invalid or no longer available." };
  }

  if (!user.sub) {
    return { error: "Your authenticated user ID is unavailable. Please log in again." };
  }

  if (hasStructuredProof && [identifyingDetails, distinguishingFeatures, ownershipExplanation].some((entry) => entry.length < 3)) {
    return { error: "Complete all three ownership verification fields." };
  }

  if (proofDescription.length < 10 || proofDescription.length > 3000) {
    return { error: "Verification proof must contain between 10 and 3,000 characters." };
  }

  if (!acceptedDeclaration) {
    return { error: "Confirm that the verification information is accurate before submitting." };
  }

  if (lostItemId) {
    const matchData = await getPossibleMatches();
    const selectedMatch = matchData.matches.find((match) => (
      match.foundItem.id === foundItemId && match.lostItem.id === lostItemId
    ));

    if (!selectedMatch) {
      return { error: "This item is no longer an available possible match." };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("claims").insert({
    claimant_id: user.sub,
    found_item_id: foundItemId,
    proof_description: proofDescription,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have an active claim for this found item." };
    }

    if (error.code === "42501") {
      return { error: "This item cannot be claimed. It may be unavailable or associated with your own found report." };
    }

    return { error: "The claim could not be submitted. Please review your proof and try again." };
  }

  revalidateClaimViews(foundItemId);
  return { success: "Your claim was submitted securely and is awaiting administrator review." };
}

export async function cancelClaim(previousState, formData) {
  await requireUser();
  const claimId = value(formData, "claimId");

  if (!UUID_PATTERN.test(claimId)) {
    return { error: "This claim reference is invalid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_claim", {
    target_claim_id: claimId,
  });

  if (error) {
    return {
      error: MISSING_MIGRATION_CODES.has(error.code)
        ? "The Stage 5 database migration must be applied before claims can be cancelled."
        : "This claim can no longer be cancelled.",
    };
  }

  revalidateClaimViews();
  return { success: "Claim cancelled." };
}

export async function reviewClaim(previousState, formData) {
  await requireAdmin();
  const claimId = value(formData, "claimId");
  const decision = value(formData, "decision");
  const response = value(formData, "response");

  if (!UUID_PATTERN.test(claimId) || !ADMIN_DECISIONS.has(decision)) {
    return { error: "Select a valid claim decision." };
  }

  if (response.length > 3000) {
    return { error: "The administrator response must contain 3,000 characters or fewer." };
  }

  if (decision === "rejected" && response.length < 3) {
    return { error: "Provide a short reason when rejecting a claim." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_claim", {
    target_claim_id: claimId,
    decision,
    response: response || null,
  });

  if (error) {
    if (MISSING_MIGRATION_CODES.has(error.code)) {
      return { error: "The Stage 5 database migration must be applied before decisions can be saved." };
    }

    if (error.code === "23505") {
      return { error: "Another claim has already been approved for this found item." };
    }

    if (error.code === "42501") {
      return { error: "Administrator authorization could not be verified." };
    }

    return { error: "This claim could not be updated. It may already be completed or the item may be unavailable." };
  }

  revalidateClaimViews();
  return { success: `Claim marked ${decision.replace("_", " ")}.` };
}

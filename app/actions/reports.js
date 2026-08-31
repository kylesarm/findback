"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getManageableReport } from "@/lib/data/activity";
import {
  createOwnedImagePath,
  ITEM_IMAGE_MAX_BYTES,
  ITEM_IMAGES_BUCKET,
  pathBelongsToUser,
  validateImageFile,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const categories = new Set([
  "Electronics",
  "ID & cards",
  "Bags",
  "Clothing",
  "Books & notes",
  "Accessories",
  "Bottles",
  "Other",
]);

function field(formData, name) {
  return String(formData.get(name) || "").trim();
}

function optionalField(formData, name) {
  return field(formData, name) || null;
}

function validateReport(formData, type) {
  const report = {
    item_name: field(formData, "itemName"),
    category: field(formData, "category"),
    brand: optionalField(formData, "brand"),
    color: optionalField(formData, "color"),
    description: field(formData, "description"),
    location: field(formData, "location"),
    item_date: field(formData, "itemDate"),
    ...(type === "found" ? { private_details: optionalField(formData, "privateDetails") } : {}),
  };

  if (report.item_name.length < 2 || report.item_name.length > 120) {
    return { error: "Item name must contain between 2 and 120 characters." };
  }

  if (!categories.has(report.category)) {
    return { error: "Select a valid item category." };
  }

  if (report.description.length < 10 || report.description.length > 2000) {
    return { error: "Description must contain between 10 and 2,000 characters." };
  }

  if (report.location.length < 2 || report.location.length > 200) {
    return { error: "Enter a valid campus location." };
  }

  const parsedDate = new Date(`${report.item_date}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(report.item_date)
    || Number.isNaN(parsedDate.getTime())
    || parsedDate.toISOString().slice(0, 10) !== report.item_date
    || parsedDate > today
  ) {
    return { error: "Choose the date the item was lost or found." };
  }

  if (report.brand?.length > 120 || report.color?.length > 80) {
    return { error: "Brand or color is longer than the allowed limit." };
  }

  if (report.private_details && (report.private_details.length < 3 || report.private_details.length > 3000)) {
    return { error: "Private verification details must contain between 3 and 3,000 characters." };
  }

  return { report };
}

async function createReport(type, formData) {
  const claims = await requireUser();
  const validation = validateReport(formData, type);

  if (validation.error) {
    return { error: validation.error };
  }

  if (!claims.sub) {
    return { error: "Your authenticated user ID is unavailable. Please log in again." };
  }

  const table = type === "lost" ? "lost_items" : "found_items";
  const supabase = await createClient();
  const reportId = crypto.randomUUID();
  const imageValidation = await validateImageFile(formData.get("itemImage"), ITEM_IMAGE_MAX_BYTES);

  if (imageValidation.error) {
    return { error: imageValidation.error };
  }

  let uploadedPath = null;

  if (imageValidation.file) {
    uploadedPath = createOwnedImagePath(claims.sub, imageValidation.extension, reportId);
    const { error: uploadError } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .upload(uploadedPath, imageValidation.bytes, {
        cacheControl: "3600",
        contentType: imageValidation.file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: "The image could not be uploaded. Review and run the Stage 6 Storage migration, then try again." };
    }
  }

  const { error } = await supabase.from(table).insert({
    id: reportId,
    ...validation.report,
    image_path: uploadedPath,
    reporter_id: claims.sub,
  });

  if (error) {
    if (uploadedPath) {
      await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([uploadedPath]);
    }
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { error: "The Stage 3 database migration has not been applied yet." };
    }

    if (error.code === "42501") {
      return { error: "Your session is not permitted to create this report. Please log in again." };
    }

    return { error: "We could not save the report. Please review the details and try again." };
  }

  return {
    success: `${type === "lost" ? "Lost" : "Found"} item report submitted successfully.`,
  };
}

export async function createLostItem(previousState, formData) {
  return createReport("lost", formData);
}

export async function createFoundItem(previousState, formData) {
  return createReport("found", formData);
}

function revalidateReportViews(type, reportId) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/claims");
  revalidatePath("/profile");
  revalidatePath("/browse");
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath(`/items/${type}/${reportId}`);
}

export async function updateReport(previousState, formData) {
  const claims = await requireUser();
  const type = field(formData, "reportType").toLowerCase();
  const reportId = field(formData, "reportId");

  if (!claims.sub || !["lost", "found"].includes(type) || !UUID_PATTERN.test(reportId)) {
    return { error: "This report reference is invalid or no longer available." };
  }

  const validation = validateReport(formData, type);
  if (validation.error) return { error: validation.error };

  const current = await getManageableReport(type, reportId);
  if (current.error) return { error: current.error };
  if (!current.report) return { error: "You are not permitted to edit this report, or it no longer exists." };

  const imageValidation = await validateImageFile(formData.get("itemImage"), ITEM_IMAGE_MAX_BYTES);
  if (imageValidation.error) return { error: imageValidation.error };

  const removeImage = formData.get("removeImage") === "on";
  if (!current.report.isOwner && (imageValidation.file || removeImage)) {
    return { error: "Only the original reporter can replace or remove the report's Storage image." };
  }

  const supabase = await createClient();
  let uploadedPath = null;

  if (imageValidation.file) {
    uploadedPath = createOwnedImagePath(claims.sub, imageValidation.extension, reportId);
    const { error: uploadError } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .upload(uploadedPath, imageValidation.bytes, {
        cacheControl: "3600",
        contentType: imageValidation.file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: "The replacement image could not be uploaded. Please try again." };
    }
  }

  const updates = {
    ...validation.report,
    ...(uploadedPath ? { image_path: uploadedPath } : {}),
    ...(!uploadedPath && removeImage ? { image_path: null } : {}),
  };
  const table = type === "lost" ? "lost_items" : "found_items";
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", reportId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (uploadedPath) await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([uploadedPath]);

    return {
      error: error?.code === "42501"
        ? "You are not permitted to edit this report."
        : "The report could not be updated. Please review the details and try again.",
    };
  }

  let warning = null;
  const shouldRemoveOldImage = Boolean(
    current.report.imagePath
    && (uploadedPath || removeImage)
    && pathBelongsToUser(current.report.imagePath, claims.sub)
  );

  if (shouldRemoveOldImage) {
    const { error: cleanupError } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .remove([current.report.imagePath]);
    if (cleanupError) warning = "The report was updated, but the previous image could not be removed from Storage.";
  }

  revalidateReportViews(type, reportId);
  return { success: "Report updated successfully.", warning };
}

export async function deleteReport(previousState, formData) {
  const claims = await requireUser();
  const type = field(formData, "reportType").toLowerCase();
  const reportId = field(formData, "reportId");

  if (!claims.sub || !["lost", "found"].includes(type) || !UUID_PATTERN.test(reportId)) {
    return { error: "This report reference is invalid or no longer available." };
  }

  const table = type === "lost" ? "lost_items" : "found_items";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", reportId)
    .select("id,image_path")
    .maybeSingle();

  if (error) {
    const claimHistoryBlocked = error.code === "P0001" || /claim history/i.test(error.message || "");
    return {
      error: claimHistoryBlocked
        ? "This found report cannot be deleted because it has claim history. Cancelled, rejected, active, and approved claims must remain available for auditing."
        : error.code === "42501"
          ? "You are not permitted to delete this report."
          : "The report could not be deleted. Please try again.",
    };
  }

  if (!data) return { error: "You are not permitted to delete this report, or it no longer exists." };

  let warning = null;
  if (pathBelongsToUser(data.image_path, claims.sub)) {
    const { error: removeError } = await supabase.storage
      .from(ITEM_IMAGES_BUCKET)
      .remove([data.image_path]);
    if (removeError) warning = "The report was deleted, but its image could not be removed from Storage.";
  } else if (data.image_path) {
    warning = "The report was deleted. Its reporter-owned image was left protected by Storage ownership rules.";
  }

  revalidateReportViews(type, reportId);
  return { success: "Report deleted.", warning };
}

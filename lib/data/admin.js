import "server-only";

import { cache } from "react";
import { requireAdmin } from "@/lib/auth";
import { getPublicImageUrl, AVATARS_BUCKET, ITEM_IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const REPORT_COLUMNS = "id,item_name,category,brand,color,description,location,item_date,image_path,status,created_at,updated_at";
const PROFILE_COLUMNS = "id,email,first_name,last_name,display_name,campus_id,department,avatar_path,role,created_at";
const ADMIN_LIST_LIMIT = 250;

function countValue(result) {
  return result.error ? null : (result.count || 0);
}

function addCounts(left, right) {
  return left === null || right === null ? null : left + right;
}

export const getAdminOverview = cache(async () => {
  await requireAdmin();
  const supabase = await createClient();
  const results = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("lost_items").select("id", { count: "exact", head: true }),
    supabase.from("lost_items").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("found_items").select("id", { count: "exact", head: true }),
    supabase.from("found_items").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("claims").select("id", { count: "exact", head: true }).eq("status", "under_review"),
    supabase.from("claims").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("lost_items").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("found_items").select("id", { count: "exact", head: true }).eq("status", "resolved"),
  ]);

  const values = results.map(countValue);
  return {
    stats: {
      totalUsers: values[0],
      totalLost: values[1],
      openLost: values[2],
      totalFound: values[3],
      openFound: values[4],
      pendingClaims: values[5],
      underReviewClaims: values[6],
      approvedClaims: values[7],
      resolvedItems: addCounts(values[8], values[9]),
    },
    error: results.some((result) => result.error)
      ? "Some administrator statistics could not be loaded. Existing RLS or migrations may need review."
      : null,
  };
});

function toAdminReport(row, type) {
  return {
    type,
    id: row.id,
    itemName: row.item_name,
    category: row.category,
    brand: row.brand,
    color: row.color,
    description: row.description,
    location: row.location,
    itemDate: row.item_date,
    imagePath: row.image_path,
    imageUrl: getPublicImageUrl(ITEM_IMAGES_BUCKET, row.image_path),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getAdminReports = cache(async () => {
  await requireAdmin();
  const supabase = await createClient();
  const [lostResult, foundResult] = await Promise.all([
    supabase.from("lost_items").select(REPORT_COLUMNS).order("created_at", { ascending: false }).limit(ADMIN_LIST_LIMIT),
    supabase.from("found_items").select(REPORT_COLUMNS).order("created_at", { ascending: false }).limit(ADMIN_LIST_LIMIT),
  ]);

  if (lostResult.error || foundResult.error) {
    return { reports: [], error: "Reports could not be loaded for moderation." };
  }

  const reports = [
    ...(lostResult.data || []).map((row) => toAdminReport(row, "lost")),
    ...(foundResult.data || []).map((row) => toAdminReport(row, "found")),
  ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  return { reports, error: null };
});

function toAdminUser(row) {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ");
  const name = row.display_name || fullName || row.email?.split("@")[0] || "Campus user";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return {
    id: row.id,
    name,
    email: row.email,
    campusId: row.campus_id,
    department: row.department,
    role: row.role,
    createdAt: row.created_at,
    initials: initials || "U",
    avatarUrl: getPublicImageUrl(AVATARS_BUCKET, row.avatar_path),
  };
}

export const getAdminUsers = cache(async () => {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIST_LIMIT);

  return error
    ? { users: [], error: "Registered users could not be loaded." }
    : { users: (data || []).map(toAdminUser), error: null };
});

export { ADMIN_LIST_LIMIT };

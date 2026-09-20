"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ROLES = new Set(["user", "admin"]);

export async function updateUserRole(previousState, formData) {
  const administrator = await requireAdmin();
  const targetUserId = String(formData.get("userId") || "").trim();
  const role = String(formData.get("role") || "").trim().toLowerCase();

  if (!UUID_PATTERN.test(targetUserId) || !ALLOWED_ROLES.has(role)) {
    return { error: "Select a valid user and role." };
  }

  if (targetUserId === administrator.sub) {
    return { error: "Your own administrator role cannot be changed from this dashboard." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId)
    .select("id,role")
    .maybeSingle();

  if (error || !data) {
    return {
      error: error?.code === "42501"
        ? "Administrator authorization could not be verified."
        : "The user role could not be updated.",
    };
  }

  revalidatePath("/admin");
  return { success: `Role updated to ${role}.` };
}

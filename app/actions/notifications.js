"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { safeTargetPath } from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);

function notificationId(formData) {
  const id = String(formData.get("notificationId") || "").trim();
  return UUID_PATTERN.test(id) ? id : null;
}

function revalidateNotificationViews() {
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

export async function markNotificationRead(formData) {
  const user = await requireUser();
  const id = notificationId(formData);
  if (!id || !user.sub) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_id", user.sub);

  revalidateNotificationViews();
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  if (!user.sub) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", user.sub)
    .eq("is_read", false);

  revalidateNotificationViews();
}

export async function openNotification(formData) {
  const user = await requireUser();
  const id = notificationId(formData);
  if (!id || !user.sub) redirect("/notifications");

  const supabase = await createClient();
  let result = await supabase
    .from("notifications")
    .select("id,target_path")
    .eq("id", id)
    .eq("recipient_id", user.sub)
    .maybeSingle();

  if (result.error && MISSING_COLUMN_CODES.has(result.error.code)) {
    result = await supabase
      .from("notifications")
      .select("id")
      .eq("id", id)
      .eq("recipient_id", user.sub)
      .maybeSingle();
  }

  if (!result.data) redirect("/notifications");

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_id", user.sub);

  revalidateNotificationViews();
  redirect(safeTargetPath(result.data.target_path));
}

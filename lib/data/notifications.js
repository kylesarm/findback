import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EXTENDED_COLUMNS = "id,message,notification_type,is_read,created_at,target_path";
const LEGACY_COLUMNS = "id,message,notification_type,is_read,created_at";
const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);

function safeTargetPath(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return "/notifications";
  return /^\/(matches|items|claims|notifications)(\/|\?|$)/.test(path) ? path : "/notifications";
}

function toNotification(row) {
  return {
    id: row.id,
    message: row.message,
    type: row.notification_type,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
    targetPath: safeTargetPath(row.target_path),
  };
}

export async function getNotificationSummary() {
  await requireUser();
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  return {
    unreadCount: error ? 0 : (count || 0),
    error: error ? "Notifications could not be counted." : null,
  };
}

export const getNotifications = cache(async () => {
  await requireUser();
  const supabase = await createClient();
  let result = await supabase
    .from("notifications")
    .select(EXTENDED_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(50);

  if (result.error && MISSING_COLUMN_CODES.has(result.error.code)) {
    result = await supabase
      .from("notifications")
      .select(LEGACY_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(50);
  }

  if (result.error) {
    return { notifications: [], unreadCount: 0, error: "Notifications could not be loaded. Please try again shortly." };
  }

  const notifications = (result.data || []).map(toNotification);
  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.isRead).length,
    error: null,
  };
});

export { safeTargetPath };

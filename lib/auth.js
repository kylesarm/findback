import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { AVATARS_BUCKET, getPublicImageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  return data.claims;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export const getCurrentUserRole = cache(async () => {
  const profile = await getCurrentProfile();

  return profile?.role === "admin" ? "admin" : "user";
});

export const getCurrentProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,display_name,campus_id,department,phone,avatar_path,role")
    .eq("id", user.sub)
    .maybeSingle();

  return error ? null : data;
});

export async function requireAdmin() {
  const user = await requireUser();
  const role = await getCurrentUserRole();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export function getUserDisplay(user, profile = null) {
  const metadata = user?.user_metadata || {};
  const email = profile?.email || (typeof user?.email === "string" ? user.email : "Campus user");
  const name = profile?.display_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || metadata.full_name || [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") || email.split("@")[0];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return {
    name,
    firstName: profile?.first_name || metadata.first_name || name.split(" ")[0],
    lastName: profile?.last_name || metadata.last_name || name.split(" ").slice(1).join(" "),
    email,
    campusId: profile?.campus_id || metadata.campus_id || "Not provided",
    initials: initials || "U",
    avatarPath: profile?.avatar_path || null,
    avatarUrl: getPublicImageUrl(AVATARS_BUCKET, profile?.avatar_path),
  };
}

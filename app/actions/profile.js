"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  AVATAR_MAX_BYTES,
  AVATARS_BUCKET,
  createOwnedImagePath,
  pathBelongsToUser,
  validateImageFile,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

async function getOwnedAvatar(supabase, userId) {
  const { data, error } = await supabase.from("profiles").select("avatar_path").eq("id", userId).single();
  return { path: data?.avatar_path || null, error };
}

export async function updateAvatar(previousState, formData) {
  const claims = await requireUser();

  if (!claims.sub) return { error: "Your authenticated user ID is unavailable. Please log in again." };

  const validation = await validateImageFile(formData.get("avatar"), AVATAR_MAX_BYTES);
  if (validation.error) return { error: validation.error };
  if (!validation.file) return { error: "Choose an image before saving your avatar." };

  const supabase = await createClient();
  const currentAvatar = await getOwnedAvatar(supabase, claims.sub);

  if (currentAvatar.error) return { error: "Your profile could not be loaded. Please try again." };

  const newPath = createOwnedImagePath(claims.sub, validation.extension);
  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(newPath, validation.bytes, {
    cacheControl: "3600",
    contentType: validation.file.type,
    upsert: false,
  });

  if (uploadError) {
    return { error: "The avatar could not be uploaded. Review and run the Stage 6 Storage migration, then try again." };
  }

  const { error: updateError } = await supabase.from("profiles").update({ avatar_path: newPath }).eq("id", claims.sub);

  if (updateError) {
    await supabase.storage.from(AVATARS_BUCKET).remove([newPath]);
    return { error: "The avatar path could not be saved to your profile." };
  }

  if (pathBelongsToUser(currentAvatar.path, claims.sub)) {
    await supabase.storage.from(AVATARS_BUCKET).remove([currentAvatar.path]);
  }

  revalidatePath("/", "layout");
  return { success: "Your avatar was updated." };
}

export async function removeAvatar() {
  const claims = await requireUser();

  if (!claims.sub) return { error: "Your authenticated user ID is unavailable. Please log in again." };

  const supabase = await createClient();
  const currentAvatar = await getOwnedAvatar(supabase, claims.sub);

  if (currentAvatar.error) return { error: "Your profile could not be loaded. Please try again." };
  if (!currentAvatar.path) return { success: "Your profile is already using initials." };
  if (!pathBelongsToUser(currentAvatar.path, claims.sub)) return { error: "The stored avatar path is not owned by your account." };

  const { error: updateError } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", claims.sub);
  if (updateError) return { error: "The avatar could not be removed from your profile." };

  const { error: removeError } = await supabase.storage.from(AVATARS_BUCKET).remove([currentAvatar.path]);

  if (removeError) {
    await supabase.from("profiles").update({ avatar_path: currentAvatar.path }).eq("id", claims.sub);
    return { error: "The avatar file could not be removed. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: "Your avatar was removed." };
}

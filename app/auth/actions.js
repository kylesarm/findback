"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function value(formData, field) {
  return String(formData.get(field) || "").trim();
}

function safeNextPath(path) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export async function login(previousState, formData) {
  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNextPath(value(formData, "next") || "/dashboard");

  if (!emailPattern.test(email) || !password) {
    return { error: "Enter a valid email address and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "The email or password you entered is incorrect." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(previousState, formData) {
  const firstName = value(formData, "firstName");
  const lastName = value(formData, "lastName");
  const email = value(formData, "email").toLowerCase();
  const campusId = value(formData, "campusId");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const acceptedTerms = formData.get("terms") === "on";

  if (!firstName || !lastName || !campusId || !emailPattern.test(email)) {
    return { error: "Complete all required campus account details." };
  }

  if (password.length < 8) {
    return { error: "Your password must contain at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (!acceptedTerms) {
    return { error: "You must agree to the campus item claim policy." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        campus_id: campusId,
      },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message || "We could not create your account." };
  }

  if (!data.session) {
    return {
      success: "Account created. Check your email to confirm your address, then log in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/login");
}

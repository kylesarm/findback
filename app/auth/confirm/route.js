import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createClient();

  let error = null;

  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = new Error("Missing confirmation token");
  }

  if (!error) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("message", "The confirmation link is invalid or has expired.");
  return NextResponse.redirect(loginUrl);
}

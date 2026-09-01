"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(invitationToken?: string) {
  const redirectTo = invitationToken
    ? `/invite/${encodeURIComponent(invitationToken)}`
    : "/dashboard";
  await signIn("google", { redirectTo });
}

"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(invitationToken?: string) {
  const callbackUrl = invitationToken
    ? `/invite/${encodeURIComponent(invitationToken)}`
    : "/";

  await signIn("google", { redirectTo: callbackUrl });
}

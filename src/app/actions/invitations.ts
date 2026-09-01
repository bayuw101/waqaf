"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { projectInvitations } from "@/db/schema";
import {
  invitationExpiry,
  invitationHash,
  newInvitationToken,
} from "@/lib/invitations";
import { currentUser, projectContext } from "@/lib/projects";

export async function createInvitation() {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengundang anggota");
  const token = newInvitationToken(),
    tokenHash = invitationHash(token),
    expiresAt = invitationExpiry();
  await sql.transaction((tx) => [
    tx`WITH created AS (
      INSERT INTO project_invitations (project_id, token_hash, created_by, expires_at)
      VALUES (${active.project.id}::uuid, ${tokenHash}::text, ${user.id}::uuid, ${expiresAt}::timestamptz)
      RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT ${active.project.id}::uuid, ${user.id}::uuid, 'invitation.created', 'invitation', id::text,
      jsonb_build_object('expiresAt', ${expiresAt.toISOString()}::text) FROM created`,
  ]);
  return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
}

export async function revokeInvitation(invitationId: string) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat membatalkan undangan");
  await sql.transaction((tx) => [
    tx`WITH revoked AS (
      UPDATE project_invitations SET revoked_at = now()
      WHERE id = ${invitationId}::uuid AND project_id = ${active.project.id}::uuid
        AND claimed_at IS NULL AND revoked_at IS NULL RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT ${active.project.id}::uuid, ${user.id}::uuid, 'invitation.revoked', 'invitation', id::text,
      '{}'::jsonb FROM revoked`,
  ]);
  revalidatePath("/settings/project");
}

export async function claimInvitation(token: string) {
  const user = await currentUser(),
    hash = invitationHash(token);
  const [result] = await sql.transaction((tx) => [
    tx`WITH claimed AS (
      UPDATE project_invitations SET claimed_at = now(), claimed_by = ${user.id}::uuid
      WHERE token_hash = ${hash}::text AND claimed_at IS NULL AND revoked_at IS NULL AND expires_at > now()
      RETURNING id, project_id
    ), membership AS (
      INSERT INTO project_members (project_id, user_id, role)
      SELECT project_id, ${user.id}::uuid, 'member'::project_role FROM claimed ON CONFLICT DO NOTHING
    ), preference AS (
      INSERT INTO user_preferences (user_id, active_project_id)
      SELECT ${user.id}::uuid, project_id FROM claimed
      ON CONFLICT (user_id) DO UPDATE SET active_project_id = EXCLUDED.active_project_id, updated_at = now()
    ), audit AS (
      INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
      SELECT project_id, ${user.id}::uuid, 'invitation.claimed', 'invitation', id::text, '{}'::jsonb FROM claimed
    )
    SELECT project_id FROM claimed`,
  ]);
  if (!result.length)
    redirect(`/invite/${encodeURIComponent(token)}?error=unavailable`);
  redirect("/dashboard");
}

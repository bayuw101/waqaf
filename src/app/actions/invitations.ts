"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql as neonSql } from "@/db";
import { projectInvitations } from "@/db/schema";
import {
  invitationExpiry,
  invitationHash,
  newInvitationToken,
} from "@/lib/invitations";
import { currentUser, projectContext } from "@/lib/projects";

export async function createInvitation() {
  const { user, active } = await projectContext();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengundang anggota");
  const token = newInvitationToken();
  await db.insert(projectInvitations).values({
    projectId: active.project.id,
    tokenHash: invitationHash(token),
    createdBy: user.id,
    expiresAt: invitationExpiry(),
  });
  return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
}

export async function revokeInvitation(invitationId: string) {
  const { active } = await projectContext();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat membatalkan undangan");
  await db
    .update(projectInvitations)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(projectInvitations.id, invitationId),
        eq(projectInvitations.projectId, active.project.id),
        isNull(projectInvitations.claimedAt),
        isNull(projectInvitations.revokedAt),
      ),
    );
  revalidatePath("/settings/project");
}

export async function claimInvitation(token: string) {
  const user = await currentUser();
  const hash = invitationHash(token);
  const [result] = await neonSql.transaction((tx) => [
    tx`WITH claimed AS (
      UPDATE project_invitations
      SET claimed_at = now(), claimed_by = ${user.id}
      WHERE token_hash = ${hash}
        AND claimed_at IS NULL
        AND revoked_at IS NULL
        AND expires_at > now()
      RETURNING project_id
    ), membership AS (
      INSERT INTO project_members (project_id, user_id, role)
      SELECT project_id, ${user.id}, 'member'::project_role FROM claimed
      ON CONFLICT DO NOTHING
    ), preference AS (
      INSERT INTO user_preferences (user_id, active_project_id)
      SELECT ${user.id}, project_id FROM claimed
      ON CONFLICT (user_id) DO UPDATE
      SET active_project_id = EXCLUDED.active_project_id, updated_at = now()
    )
    SELECT project_id FROM claimed`,
  ]);
  if (!result.length)
    redirect(`/invite/${encodeURIComponent(token)}?error=unavailable`);
  redirect("/dashboard");
}

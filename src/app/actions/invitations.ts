"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  projectInvitations,
  projectMembers,
  userPreferences,
} from "@/db/schema";
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
  redirect(`/settings/project?invitation=${encodeURIComponent(token)}`);
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
  const projectId = await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(projectInvitations)
      .set({ claimedAt: new Date(), claimedBy: user.id })
      .where(
        and(
          eq(projectInvitations.tokenHash, hash),
          isNull(projectInvitations.claimedAt),
          isNull(projectInvitations.revokedAt),
          gt(projectInvitations.expiresAt, new Date()),
        ),
      )
      .returning({ projectId: projectInvitations.projectId });
    if (!claimed) return null;
    await tx
      .insert(projectMembers)
      .values({ projectId: claimed.projectId, userId: user.id, role: "member" })
      .onConflictDoNothing();
    await tx
      .insert(userPreferences)
      .values({ userId: user.id, activeProjectId: claimed.projectId })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { activeProjectId: claimed.projectId, updatedAt: new Date() },
      });
    return claimed.projectId;
  });
  if (!projectId)
    redirect(`/invite/${encodeURIComponent(token)}?error=unavailable`);
  redirect("/");
}

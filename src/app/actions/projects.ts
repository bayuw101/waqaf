"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { projectMembers, projects, userPreferences } from "@/db/schema";
import { currentUser, projectContext } from "@/lib/projects";

export async function switchProject(projectId: string) {
  const user = await currentUser();
  const [membership] = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.userId, user.id),
        eq(projectMembers.projectId, projectId),
      ),
    )
    .limit(1);
  if (!membership) throw new Error("Project tidak dapat diakses");
  await db
    .insert(userPreferences)
    .values({ userId: user.id, activeProjectId: projectId })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { activeProjectId: projectId, updatedAt: new Date() },
    });
  revalidatePath("/", "layout");
}

export async function requireActiveProject() {
  const { active } = await projectContext();
  if (!active) redirect("/onboarding");
  return active;
}

export async function updateProject(formData: FormData) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengubah project");
  const name = String(formData.get("name") || "").trim();
  const organizationName = String(
    formData.get("organizationName") || "",
  ).trim();
  if (!name || !organizationName) redirect("/settings/project?error=required");
  const allowNegative = formData.get("allowNegativeBalance") === "on";
  await sql.transaction((tx) => [
    tx`WITH updated AS (
      UPDATE projects SET name = ${name}::text, organization_name = ${organizationName}::text,
        allow_negative_balance = ${allowNegative}, updated_at = now()
      WHERE id = ${active.project.id}::uuid RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT id, ${user.id}::uuid, 'project.updated', 'project', id::text,
      jsonb_build_object('name', ${name}::text, 'organizationName', ${organizationName}::text,
        'allowNegativeBalance', ${allowNegative}) FROM updated`,
  ]);
  revalidatePath("/", "layout");
  redirect("/settings/project?saved=1");
}

export async function archiveProject() {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengarsipkan project");
  await sql.transaction((tx) => [
    tx`WITH archived AS (
      UPDATE projects SET archived_at = now(), updated_at = now()
      WHERE id = ${active.project.id}::uuid RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT id, ${user.id}::uuid, 'project.archived', 'project', id::text, '{}'::jsonb FROM archived`,
  ]);
  redirect("/dashboard");
}

export async function removeMember(userId: string) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat menghapus anggota");
  if (userId === user.id)
    throw new Error("Owner tidak dapat menghapus dirinya sendiri");
  await sql.transaction((tx) => [
    tx`WITH removed AS (
      DELETE FROM project_members WHERE project_id = ${active.project.id}::uuid
        AND user_id = ${userId}::uuid AND role = 'member' RETURNING user_id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT ${active.project.id}::uuid, ${user.id}::uuid, 'member.removed', 'member', user_id::text,
      '{}'::jsonb FROM removed`,
  ]);
  revalidatePath("/settings/project");
}

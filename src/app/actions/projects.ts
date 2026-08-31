"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
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
  const active = await requireActiveProject();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengubah project");
  const name = String(formData.get("name") || "").trim();
  const organizationName = String(
    formData.get("organizationName") || "",
  ).trim();
  if (!name || !organizationName) redirect("/settings/project?error=required");
  await db
    .update(projects)
    .set({
      name,
      organizationName,
      allowNegativeBalance: formData.get("allowNegativeBalance") === "on",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, active.project.id));
  revalidatePath("/", "layout");
  redirect("/settings/project?saved=1");
}

export async function archiveProject() {
  const active = await requireActiveProject();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengarsipkan project");
  await db
    .update(projects)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, active.project.id));
  redirect("/dashboard");
}

export async function removeMember(userId: string) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat menghapus anggota");
  if (userId === user.id)
    throw new Error("Owner tidak dapat menghapus dirinya sendiri");
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, active.project.id),
        eq(projectMembers.userId, userId),
        eq(projectMembers.role, "member"),
      ),
    );
  revalidatePath("/settings/project");
}

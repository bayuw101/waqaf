"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { projectMembers, projects, userPreferences } from "@/db/schema";
import { currentUser } from "@/lib/projects";

export async function createProject(formData: FormData) {
  const user = await currentUser();
  const name = String(formData.get("name") || "").trim();
  const organizationName = String(
    formData.get("organizationName") || "",
  ).trim();
  if (!name || !organizationName) redirect("/onboarding?error=required");

  await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({ name, organizationName })
      .returning({ id: projects.id });
    await tx.insert(projectMembers).values({
      projectId: project.id,
      userId: user.id,
      role: "owner",
    });
    await tx
      .insert(userPreferences)
      .values({ userId: user.id, activeProjectId: project.id })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { activeProjectId: project.id, updatedAt: new Date() },
      });
  });
  redirect("/");
}

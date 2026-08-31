import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectMembers, projects, userPreferences, users } from "@/db/schema";

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);
  if (!user) redirect("/login");
  return user;
}

export async function projectContext() {
  const user = await currentUser();
  const memberships = await db
    .select({ project: projects, role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(
      and(eq(projectMembers.userId, user.id), isNull(projects.archivedAt)),
    );

  if (!memberships.length) redirect("/onboarding");

  const [preference] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);
  const active =
    memberships.find(
      ({ project }) => project.id === preference?.activeProjectId,
    ) || memberships[0];

  return { user, memberships, active };
}

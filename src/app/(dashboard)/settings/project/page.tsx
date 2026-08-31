import { desc, eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { projectInvitations, projectMembers, users } from "@/db/schema";
import { projectContext } from "@/lib/projects";
import { ProjectManager } from "@/components/projects/project-manager";

export default async function ProjectSettingsPage() {
  const { active } = await projectContext();
  const [members, invitations] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: projectMembers.role,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, active.project.id)),
    active.role === "owner"
      ? db
          .select({
            id: projectInvitations.id,
            expiresAt: projectInvitations.expiresAt,
          })
          .from(projectInvitations)
          .where(
            and(
              eq(projectInvitations.projectId, active.project.id),
              isNull(projectInvitations.claimedAt),
              isNull(projectInvitations.revokedAt),
            ),
          )
          .orderBy(desc(projectInvitations.createdAt))
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold">Kelola project</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Atur identitas, anggota, undangan, dan kebijakan keuangan project.
        </p>
      </div>
      <ProjectManager
        project={active.project}
        owner={active.role === "owner"}
        members={members}
        invitations={invitations.map((invitation) => ({
          ...invitation,
          expiresAt: invitation.expiresAt.toISOString(),
        }))}
      />
    </div>
  );
}

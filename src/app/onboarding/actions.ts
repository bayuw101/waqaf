"use server";

import { redirect } from "next/navigation";
import { sql } from "@/db";
import { currentUser } from "@/lib/projects";

export async function createProject(formData: FormData) {
  const user = await currentUser();
  const name = String(formData.get("name") || "").trim();
  const organizationName = String(
    formData.get("organizationName") || "",
  ).trim();
  if (!name || !organizationName) redirect("/onboarding?error=required");

  await sql.transaction((tx) => [
    tx`WITH new_project AS (
      INSERT INTO projects (name, organization_name)
      VALUES (${name}, ${organizationName})
      RETURNING id
    ), new_membership AS (
      INSERT INTO project_members (project_id, user_id, role)
      SELECT id, ${user.id}, 'owner'::project_role FROM new_project
    )
    INSERT INTO user_preferences (user_id, active_project_id)
    SELECT ${user.id}, id FROM new_project
    ON CONFLICT (user_id) DO UPDATE
    SET active_project_id = EXCLUDED.active_project_id, updated_at = now()`,
  ]);
  redirect("/");
}

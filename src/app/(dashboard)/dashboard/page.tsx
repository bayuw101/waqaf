import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { projectContext } from "@/lib/projects";

export default async function Page() {
  await projectContext();
  return <DashboardPage />;
}

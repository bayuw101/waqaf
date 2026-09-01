import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/lib/use-theme";
import { FinanceProvider } from "@/lib/finance-provider";
import { projectContext } from "@/lib/projects";
import { projectTransactions } from "@/lib/transaction-data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await projectContext();
  if (!context.active) redirect("/onboarding");
  const active = context.active;
  const transactions = await projectTransactions(active.project.id);

  return (
    <ThemeProvider>
      <ToastProvider>
        <FinanceProvider initialTransactions={transactions}>
          <AppShell
            user={{
              name: context.user.name || context.user.email,
              email: context.user.email,
            }}
            activeProject={active.project.id}
            owner={active.role === "owner"}
            projects={context.memberships.map(({ project }) => ({
              id: project.id,
              name: project.name,
            }))}
          >
            {children}
          </AppShell>
        </FinanceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

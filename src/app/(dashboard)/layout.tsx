import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/lib/use-theme";
import { FinanceProvider } from "@/lib/finance-provider";
import { projectContext } from "@/lib/projects";
import { projectTransactions } from "@/lib/transaction-data";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await projectContext();
  if (!context.active) redirect("/onboarding");
  const active = context.active;
  const [transactions, projectAccounts] = await Promise.all([
    projectTransactions(active.project.id),
    db
      .select({ name: accounts.name, balance: accounts.currentBalance })
      .from(accounts)
      .where(
        and(
          eq(accounts.projectId, active.project.id),
          eq(accounts.isActive, true),
        ),
      )
      .orderBy(accounts.name),
  ]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <FinanceProvider
          initialTransactions={transactions}
          accountNames={projectAccounts.map((account) => account.name)}
          accounts={projectAccounts.map((account) => ({
            name: account.name,
            balance: Number(account.balance),
          }))}
        >
          <AppShell
            user={{
              name: context.user.name || context.user.email,
              email: context.user.email,
            }}
            activeProject={active.project.id}
            owner={active.role === "owner"}
            accounts={projectAccounts.map((account) => ({
              name: account.name,
              balance: account.balance.toString(),
            }))}
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

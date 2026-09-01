import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountManager } from "@/components/accounts/account-manager";
import { db } from "@/db";
import { accounts, ledgerEntries } from "@/db/schema";
import { projectContext } from "@/lib/projects";

export default async function AccountsPage() {
  const { active } = await projectContext();
  if (!active) redirect("/onboarding");
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      openingBalance: accounts.openingBalance,
      currentBalance: accounts.currentBalance,
      version: accounts.version,
      isActive: accounts.isActive,
      calculated: sql<bigint>`${accounts.openingBalance} + coalesce(sum(${ledgerEntries.amount}), 0)`,
    })
    .from(accounts)
    .leftJoin(ledgerEntries, eq(ledgerEntries.accountId, accounts.id))
    .where(eq(accounts.projectId, active.project.id))
    .groupBy(accounts.id)
    .orderBy(accounts.name);
  return (
    <AccountManager
      owner={active.role === "owner"}
      accounts={rows.map((row) => ({
        ...row,
        openingBalance: row.openingBalance.toString(),
        currentBalance: row.currentBalance.toString(),
        reconciled: row.currentBalance === row.calculated,
      }))}
    />
  );
}

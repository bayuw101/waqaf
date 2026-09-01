import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import type { Transaction } from "@/lib/finance";

export async function projectTransactions(
  projectId: string,
): Promise<Transaction[]> {
  const rows = await db
    .select({ transaction: transactions, accountName: accounts.name })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(transactions.projectId, projectId))
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt));

  return rows.map(({ transaction, accountName }) => ({
    id: transaction.id,
    type: transaction.type,
    date: transaction.transactionDate.toISOString().slice(0, 10),
    description: transaction.description,
    party: transaction.party,
    responsible: transaction.responsible,
    category: transaction.category,
    account: accountName || undefined,
    amount: Number(transaction.amount),
    cashEffect: Number(transaction.cashEffect),
    incomeEffect: Number(transaction.incomeEffect),
    expenseEffect: Number(transaction.expenseEffect),
    status: transaction.status,
    realizationStatus: transaction.realizationStatus,
    realizedAmount:
      transaction.realizedAmount === null
        ? undefined
        : Number(transaction.realizedAmount),
    parentId: transaction.parentId || undefined,
    relationKind: transaction.relationKind || undefined,
    ref: transaction.reference,
    due: transaction.dueAt?.toISOString().slice(0, 10),
    note: transaction.note || undefined,
    cancelled: !!transaction.cancelledAt,
  }));
}

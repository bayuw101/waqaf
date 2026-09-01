"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { transactions } from "@/db/schema";
import { projectContext } from "@/lib/projects";

async function context() {
  const value = await projectContext();
  if (!value.active) redirect("/onboarding");
  return { user: value.user, active: value.active };
}

export async function updateTransactionMetadata(
  id: string,
  input: {
    description: string;
    party: string;
    responsible: string;
    category: string;
    reference: string;
    due?: string;
  },
) {
  const { user, active } = await context();
  if (
    !input.description.trim() ||
    !input.party.trim() ||
    !input.responsible.trim() ||
    !input.category.trim() ||
    !input.reference.trim()
  )
    throw new Error("Metadata wajib diisi");
  const result = await db
    .update(transactions)
    .set({
      description: input.description.trim(),
      party: input.party.trim(),
      responsible: input.responsible.trim(),
      category: input.category.trim(),
      reference: input.reference.trim(),
      dueAt: input.due ? new Date(`${input.due}T00:00:00`) : null,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.projectId, active.project.id),
        isNull(transactions.cancelledAt),
      ),
    )
    .returning({ id: transactions.id });
  if (!result.length)
    throw new Error("Transaksi tidak ditemukan atau sudah dibatalkan");
  revalidatePath(`/transactions/${id}`);
  revalidatePath("/transactions");
}

export async function cancelTransaction(id: string, reason: string) {
  const { user, active } = await context();
  const cleanReason = reason.trim();
  if (!cleanReason) throw new Error("Alasan pembatalan wajib diisi");
  await sql.transaction((tx) => [
    tx`WITH root AS (
      SELECT * FROM transactions WHERE id = ${id}::uuid AND project_id = ${active.project.id}::uuid AND cancelled_at IS NULL
    ), family AS (
      SELECT * FROM transactions WHERE id = ${id}::uuid OR parent_id = ${id}::uuid
    ), reversals AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount, reversal_of_id)
      SELECT l.project_id, l.transaction_id, l.account_id, -l.amount, l.id
      FROM ledger_entries l JOIN family f ON f.id = l.transaction_id
      WHERE l.reversal_of_id IS NULL AND NOT EXISTS (SELECT 1 FROM ledger_entries r WHERE r.reversal_of_id = l.id)
      RETURNING account_id, amount
    ), totals AS (
      SELECT account_id, sum(amount)::bigint amount FROM reversals GROUP BY account_id
    ), balances AS (
      UPDATE accounts a SET current_balance = a.current_balance + t.amount, version = a.version + 1, updated_at = now()
      FROM totals t WHERE a.id = t.account_id RETURNING a.id
    ), cancelled AS (
      UPDATE transactions t SET cancelled_at = now(), cancelled_by = ${user.id}::uuid,
        cancellation_reason = ${cleanReason}::text, status = 'closed', updated_at = now(), updated_by = ${user.id}::uuid
      WHERE t.id IN (SELECT id FROM family) RETURNING t.id, t.project_id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.cancelled', 'transaction', id::text,
      jsonb_build_object('reason', ${cleanReason}::text) FROM cancelled WHERE id = ${id}::uuid`,
  ]);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { accounts, transactions } from "@/db/schema";
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

export async function correctTransaction(
  id: string,
  input: {
    direction: "in" | "out";
    amount: number;
    account: string;
    reason: string;
  },
) {
  const { user, active } = await context();
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
    throw new Error("Nominal koreksi tidak valid");
  if (!input.reason.trim()) throw new Error("Alasan koreksi wajib diisi");
  if (!input.account) throw new Error("Rekening terdampak wajib dipilih");

  const [account] = await db
    .select({ id: accounts.id, balance: accounts.currentBalance })
    .from(accounts)
    .where(
      and(
        eq(accounts.projectId, active.project.id),
        eq(accounts.name, input.account),
        eq(accounts.isActive, true),
      ),
    )
    .limit(1);
  if (!account) throw new Error("Rekening terdampak tidak ditemukan");
  if (
    input.direction === "out" &&
    !active.project.allowNegativeBalance &&
    account.balance < BigInt(input.amount)
  )
    throw new Error("Saldo rekening tidak mencukupi untuk koreksi kas keluar");

  const delta = input.direction === "in" ? input.amount : -input.amount;
  const [result] = await sql.transaction((tx) => [
    tx`WITH parent AS (
      SELECT t.*, a.id selected_account_id, a.current_balance
      FROM transactions t
      LEFT JOIN accounts a ON a.project_id = t.project_id AND a.id = ${account.id}::uuid AND a.is_active = true
      WHERE t.id = ${id}::uuid AND t.project_id = ${active.project.id}::uuid AND t.cancelled_at IS NULL
    ), validated AS (
      SELECT * FROM parent WHERE selected_account_id IS NOT NULL
    ), correction AS (
      INSERT INTO transactions (project_id, parent_id, type, relation_kind, transaction_date, description,
        party, responsible, category, account_id, amount, cash_effect, income_effect, expense_effect,
        status, realization_status, reference, note, created_by, updated_by)
      SELECT project_id, id, ${input.direction === "in" ? "cash_in" : "cash_out"}::transaction_type,
        'correction'::relation_kind, CURRENT_DATE, 'Koreksi ' || description, party, responsible,
        category, selected_account_id, ${input.amount}::bigint, ${delta}::bigint,
        0, 0, 'closed', 'not_required', reference || '-COR-' || extract(epoch from now())::bigint,
        ${input.reason.trim()}::text, ${user.id}::uuid, ${user.id}::uuid FROM validated RETURNING *
    ), ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, account_id, cash_effect FROM correction
    ), balance AS (
      UPDATE accounts a SET current_balance = a.current_balance + c.cash_effect,
        version = a.version + 1, updated_at = now() FROM correction c WHERE a.id = c.account_id RETURNING a.id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.corrected', 'transaction', id::text,
      jsonb_build_object('amount', cash_effect, 'reason', ${input.reason.trim()}::text) FROM correction
    RETURNING object_id`,
  ]);
  const correctionId = String(result[0]?.object_id || "");
  if (!correctionId)
    throw new Error("Transaksi induk tidak ditemukan atau sudah dibatalkan");
  revalidatePath(`/transactions/${id}`);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return correctionId;
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
    ), impacts AS (
      SELECT l.account_id, sum(l.amount)::bigint original_amount
      FROM ledger_entries l JOIN family f ON f.id = l.transaction_id
      WHERE l.reversal_of_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM ledger_entries r WHERE r.reversal_of_id = l.id)
      GROUP BY l.account_id
    ), reversal_transactions AS (
      INSERT INTO transactions (project_id, parent_id, type, relation_kind, transaction_date,
        description, party, responsible, category, account_id, amount, cash_effect,
        income_effect, expense_effect, status, realization_status, reference, note,
        created_by, updated_by)
      SELECT r.project_id, r.id,
        CASE WHEN i.original_amount > 0 THEN 'cash_out' ELSE 'cash_in' END::transaction_type,
        'correction'::relation_kind, CURRENT_DATE, 'Pembatalan ' || r.description,
        r.party, r.responsible, 'Pembatalan', i.account_id, abs(i.original_amount),
        -i.original_amount, 0, 0, 'closed', 'not_required',
        r.reference || '-VOID-' || row_number() over (), ${cleanReason}::text,
        ${user.id}::uuid, ${user.id}::uuid
      FROM root r CROSS JOIN impacts i RETURNING id, project_id, account_id, cash_effect
    ), reversals AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount, reversal_of_id)
      SELECT rt.project_id, rt.id, l.account_id, -l.amount, l.id
      FROM ledger_entries l JOIN family f ON f.id = l.transaction_id
      JOIN reversal_transactions rt ON rt.account_id = l.account_id
      WHERE l.reversal_of_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM ledger_entries r WHERE r.reversal_of_id = l.id)
      RETURNING account_id, amount
    ), totals AS (
      SELECT account_id, sum(amount)::bigint amount FROM reversals GROUP BY account_id
    ), balances AS (
      UPDATE accounts a SET current_balance = a.current_balance + t.amount,
        version = a.version + 1, updated_at = now()
      FROM totals t WHERE a.id = t.account_id RETURNING a.id
    ), cancelled AS (
      UPDATE transactions t SET cancelled_at = now(), cancelled_by = ${user.id}::uuid,
        cancellation_reason = ${cleanReason}::text, status = 'closed', updated_at = now(), updated_by = ${user.id}::uuid
      WHERE t.id IN (SELECT id FROM family) RETURNING t.id, t.project_id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.cancelled', 'transaction', id::text,
      jsonb_build_object('reason', ${cleanReason}::text,
        'reversals', (SELECT count(*) FROM reversal_transactions))
    FROM cancelled WHERE id = ${id}::uuid`,
  ]);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/db";
import { projectContext } from "@/lib/projects";

export async function settleTransaction(input: {
  parentId: string;
  kind: "debt_payment" | "receivable_payment";
  amount: number;
  account: string;
  responsible: string;
  complete: boolean;
}) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
    throw new Error("Nominal tidak valid");
  if (!input.account || !input.responsible.trim())
    throw new Error("Rekening dan penanggung jawab wajib diisi");
  const debt = input.kind === "debt_payment";
  await sql.transaction((tx) => [
    tx`WITH parent AS (
      SELECT * FROM transactions WHERE id = ${input.parentId}::uuid AND project_id = ${active.project.id}::uuid
        AND type = ${debt ? "debt" : "receivable"}::transaction_type AND cancelled_at IS NULL
    ), paid AS (
      SELECT coalesce(sum(amount), 0)::bigint amount FROM transactions
      WHERE parent_id = ${input.parentId}::uuid AND relation_kind = ${input.kind}::relation_kind AND cancelled_at IS NULL
    ), available AS (
      SELECT a.* FROM accounts a WHERE a.project_id = ${active.project.id}::uuid AND a.name = ${input.account}::text AND a.is_active = true
    ), validated AS (
      SELECT p.*, p.amount - paid.amount AS outstanding, a.id account_id, a.current_balance
      FROM parent p CROSS JOIN paid CROSS JOIN available a
      WHERE ${input.amount}::bigint <= p.amount - paid.amount
        AND (${!debt} OR ${active.project.allowNegativeBalance} OR a.current_balance >= ${input.amount}::bigint)
    ), child AS (
      INSERT INTO transactions (project_id, parent_id, type, relation_kind, transaction_date, description,
        party, responsible, category, account_id, amount, cash_effect, income_effect, expense_effect,
        status, realization_status, realized_amount, reference, created_by, updated_by)
      SELECT project_id, id, ${debt ? "cash_out" : "cash_in"}::transaction_type, ${input.kind}::relation_kind,
        CURRENT_DATE, ${debt ? "Pembayaran " : "Penerimaan "} || description, party, ${input.responsible.trim()}::text,
        category, account_id, ${input.amount}::bigint, ${debt ? -input.amount : input.amount}::bigint, 0, 0,
        CASE WHEN ${input.complete} AND ${input.amount}::bigint = outstanding THEN 'closed' ELSE 'open' END::transaction_status,
        ${debt ? "realized" : "not_required"}::realization_status,
        CASE WHEN ${debt} THEN ${input.amount}::bigint END,
        reference || '-' || (SELECT count(*) + 1 FROM transactions WHERE parent_id = ${input.parentId}::uuid),
        ${user.id}::uuid, ${user.id}::uuid FROM validated RETURNING *
    ), ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, account_id, cash_effect FROM child
    ), balance AS (
      UPDATE accounts a SET current_balance = a.current_balance + c.cash_effect, version = a.version + 1, updated_at = now()
      FROM child c WHERE a.id = c.account_id RETURNING a.id
    ), parent_update AS (
      UPDATE transactions p SET status = CASE WHEN c.amount = v.outstanding THEN 'closed' ELSE 'open' END::transaction_status,
        updated_at = now(), updated_by = ${user.id}::uuid
      FROM child c JOIN validated v ON v.id = c.parent_id WHERE p.id = c.parent_id RETURNING p.id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.settled', 'transaction', id::text,
      jsonb_build_object('kind', relation_kind, 'amount', amount) FROM child`,
  ]);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function recordRealization(input: {
  parentId: string;
  amount: number;
  complete: boolean;
  reason?: string;
  mode?: "contribution" | "reimburse" | "return";
  account?: string;
  responsible: string;
}) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  const difference = input.amount - 0;
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
    throw new Error("Nilai aktual tidak valid");
  if (
    input.complete &&
    input.mode &&
    input.mode !== "contribution" &&
    !input.account
  )
    throw new Error("Rekening penyelesaian wajib dipilih");
  await sql.transaction((tx) => [
    tx`WITH parent AS (
      SELECT * FROM transactions WHERE id = ${input.parentId}::uuid AND project_id = ${active.project.id}::uuid
        AND type = 'cash_out' AND realization_status = 'pending' AND cancelled_at IS NULL
    ), diff AS (
      SELECT p.*, ${input.amount}::bigint - p.amount AS difference FROM parent p
    ), updated AS (
      UPDATE transactions t SET realization_status = 'realized', realized_amount = ${input.amount}::bigint,
        expense_effect = ${input.amount}::bigint, status = ${input.complete ? "closed" : "open"}::transaction_status,
        note = coalesce(${input.reason || null}::text, note), updated_at = now(), updated_by = ${user.id}::uuid
      FROM diff d WHERE t.id = d.id RETURNING t.*
    ), settlement AS (
      INSERT INTO transactions (project_id, parent_id, type, relation_kind, transaction_date, description,
        party, responsible, category, account_id, amount, cash_effect, income_effect, expense_effect,
        status, realization_status, reference, note, created_by, updated_by)
      SELECT d.project_id, d.id,
        CASE WHEN d.difference < 0 OR ${input.mode || "contribution"}::text = 'contribution' THEN 'cash_in' ELSE 'cash_out' END::transaction_type,
        CASE WHEN d.difference < 0 THEN 'realization_return'
          WHEN ${input.mode || "contribution"}::text = 'contribution' THEN 'realization_contribution'
          ELSE 'realization_shortfall' END::relation_kind,
        CURRENT_DATE, CASE WHEN d.difference < 0 THEN 'Pengembalian ' WHEN ${input.mode || "contribution"}::text = 'contribution' THEN 'Kontribusi PJ ' ELSE 'Reimburse PJ ' END || d.description,
        ${input.responsible}::text, ${input.responsible}::text, d.category, a.id, abs(d.difference),
        CASE WHEN ${input.mode || "contribution"}::text = 'contribution' THEN 0 ELSE -d.difference END,
        CASE WHEN ${input.mode || "contribution"}::text = 'contribution' THEN abs(d.difference) ELSE 0 END, 0,
        'closed', 'not_required', d.reference || '-SETTLE', ${input.reason || null}::text, ${user.id}::uuid, ${user.id}::uuid
      FROM diff d LEFT JOIN accounts a ON a.project_id = d.project_id AND a.name = ${input.account || ""}::text
      WHERE ${input.complete} AND d.difference <> 0 RETURNING *
    ), ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, account_id, cash_effect FROM settlement WHERE account_id IS NOT NULL AND cash_effect <> 0
    ), balances AS (
      UPDATE accounts a SET current_balance = a.current_balance + s.cash_effect, version = a.version + 1, updated_at = now()
      FROM settlement s WHERE a.id = s.account_id RETURNING a.id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.realized', 'transaction', id::text,
      jsonb_build_object('realizedAmount', realized_amount) FROM updated`,
  ]);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/db";
import type { TransactionType } from "@/lib/finance";
import { projectContext } from "@/lib/projects";

type CreateTransactionInput = {
  type: TransactionType;
  date: string;
  description: string;
  party: string;
  responsible: string;
  category: string;
  account?: string;
  destinationAccount?: string;
  amount: number;
  status: "open" | "closed";
  realizationStatus: "not_required" | "pending" | "realized";
  reference: string;
  due?: string;
  note?: string;
};

export async function createTransaction(input: CreateTransactionInput) {
  const { user, active } = await projectContext();
  if (!active) redirect("/onboarding");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
    throw new Error("Nominal tidak valid");
  if (
    !input.description.trim() ||
    !input.responsible.trim() ||
    !input.reference.trim()
  )
    throw new Error("Data transaksi belum lengkap");

  const cashEffect =
    input.type === "cash_in"
      ? input.amount
      : input.type === "cash_out"
        ? -input.amount
        : 0;
  const incomeEffect = input.type === "cash_in" ? input.amount : 0;
  const expenseEffect =
    input.type === "cash_out" && input.realizationStatus !== "pending"
      ? input.amount
      : 0;

  const [result] = await sql.transaction((tx) => [
    tx`WITH source_account AS (
      SELECT id, current_balance, version FROM accounts
      WHERE project_id = ${active.project.id}::uuid AND name = ${input.account || ""}::text AND is_active = true
    ), destination_account AS (
      SELECT id, current_balance, version FROM accounts
      WHERE project_id = ${active.project.id}::uuid AND name = ${input.destinationAccount || ""}::text AND is_active = true
    ), validated AS (
      SELECT CASE
        WHEN ${input.type}::text IN ('cash_in','cash_out','transfer') AND NOT EXISTS (SELECT 1 FROM source_account)
          THEN pg_catalog.set_config('waqaf.error', 'Rekening sumber tidak ditemukan', true)
        WHEN ${input.type}::text = 'transfer' AND NOT EXISTS (SELECT 1 FROM destination_account)
          THEN pg_catalog.set_config('waqaf.error', 'Rekening tujuan tidak ditemukan', true)
        ELSE '' END value
    ), inserted AS (
      INSERT INTO transactions (
        project_id, type, transaction_date, description, party, responsible, category,
        account_id, destination_account_id, amount, cash_effect, income_effect,
        expense_effect, status, realization_status, realized_amount, reference,
        due_at, note, created_by, updated_by
      )
      SELECT ${active.project.id}::uuid, ${input.type}::transaction_type, ${input.date}::date,
        ${input.description.trim()}::text, ${input.party.trim()}::text,
        ${input.responsible.trim()}::text, ${input.category.trim()}::text,
        (SELECT id FROM source_account), (SELECT id FROM destination_account),
        ${input.amount}::bigint, ${cashEffect}::bigint, ${incomeEffect}::bigint,
        ${expenseEffect}::bigint, ${input.status}::transaction_status,
        ${input.realizationStatus}::realization_status,
        CASE WHEN ${input.realizationStatus}::text = 'realized' THEN ${input.amount}::bigint END,
        ${input.reference.trim()}::text, ${input.due || null}::date, ${input.note || null}::text,
        ${user.id}::uuid, ${user.id}::uuid
      FROM validated RETURNING *
    ), source_ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, account_id,
        CASE WHEN type = 'transfer' THEN -amount ELSE cash_effect END
      FROM inserted WHERE account_id IS NOT NULL AND (cash_effect <> 0 OR type = 'transfer')
    ), destination_ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, destination_account_id, amount
      FROM inserted WHERE type = 'transfer' AND destination_account_id IS NOT NULL
    ), source_update AS (
      UPDATE accounts a SET current_balance = a.current_balance +
        CASE WHEN i.type = 'transfer' THEN -i.amount ELSE i.cash_effect END,
        version = a.version + 1, updated_at = now()
      FROM inserted i WHERE a.id = i.account_id AND (i.cash_effect <> 0 OR i.type = 'transfer')
      RETURNING a.id
    ), destination_update AS (
      UPDATE accounts a SET current_balance = a.current_balance + i.amount,
        version = a.version + 1, updated_at = now()
      FROM inserted i WHERE a.id = i.destination_account_id AND i.type = 'transfer'
      RETURNING a.id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT project_id, ${user.id}::uuid, 'transaction.created', 'transaction', id::text,
      jsonb_build_object('type', type, 'amount', amount, 'reference', reference)
    FROM inserted RETURNING object_id`,
  ]);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return String(result[0]?.object_id || "");
}

"use server";

import { and, eq, sql as drizzleSql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { accounts, ledgerEntries } from "@/db/schema";
import { parseIdr } from "@/lib/ledger";
import { projectContext } from "@/lib/projects";

async function context() {
  const value = await projectContext();
  if (!value.active) redirect("/onboarding");
  return { user: value.user, active: value.active };
}

export async function createAccount(formData: FormData) {
  const { user, active } = await context();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat membuat rekening");
  const name = String(formData.get("name") || "").trim();
  const openingBalance = parseIdr(formData.get("openingBalance"));
  if (!name) throw new Error("Nama rekening wajib diisi");
  await sql.transaction((tx) => [
    tx`WITH created AS (
      INSERT INTO accounts (project_id, name, opening_balance, current_balance)
      VALUES (${active.project.id}, ${name}, ${openingBalance.toString()}, ${openingBalance.toString()})
      RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT ${active.project.id}, ${user.id}, 'account.created', 'account', id::text,
      jsonb_build_object('name', ${name}, 'openingBalance', ${openingBalance.toString()})
    FROM created`,
  ]);
  revalidatePath("/accounts");
}

export async function renameAccount(accountId: string, name: string) {
  const { user, active } = await context();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengubah rekening");
  const clean = name.trim();
  if (!clean) throw new Error("Nama rekening wajib diisi");
  const result = await db
    .update(accounts)
    .set({ name: clean, updatedAt: new Date() })
    .where(
      and(
        eq(accounts.id, accountId),
        eq(accounts.projectId, active.project.id),
      ),
    )
    .returning({ id: accounts.id });
  if (!result.length) throw new Error("Rekening tidak ditemukan");
  revalidatePath("/accounts");
}

export async function setAccountActive(accountId: string, isActive: boolean) {
  const { active } = await context();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat mengubah rekening");
  await db
    .update(accounts)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(accounts.id, accountId),
        eq(accounts.projectId, active.project.id),
      ),
    );
  revalidatePath("/accounts");
}

export async function adjustBalance(accountId: string, formData: FormData) {
  const { user, active } = await context();
  if (active.role !== "owner")
    throw new Error("Hanya owner yang dapat menyesuaikan saldo");
  const actualBalance = parseIdr(formData.get("actualBalance"));
  const reason = String(formData.get("reason") || "").trim();
  if (!reason) throw new Error("Alasan penyesuaian wajib diisi");
  await sql.transaction((tx) => [
    tx`WITH locked AS (
      SELECT * FROM accounts
      WHERE id = ${accountId} AND project_id = ${active.project.id}
      FOR UPDATE
    ), delta AS (
      SELECT *, ${actualBalance.toString()}::bigint - current_balance AS amount FROM locked
    ), transaction_row AS (
      INSERT INTO transactions (
        project_id, type, transaction_date, description, party, responsible,
        category, account_id, amount, cash_effect, income_effect, expense_effect,
        status, realization_status, reference, note, created_by, updated_by
      )
      SELECT project_id, CASE WHEN amount >= 0 THEN 'cash_in'::transaction_type ELSE 'cash_out'::transaction_type END,
        CURRENT_DATE, 'Penyesuaian saldo ' || name, 'Internal', ${user.name || user.email},
        'Penyesuaian saldo', id, abs(amount), amount, 0, 0, 'closed'::transaction_status,
        'not_required'::realization_status, 'ADJ-' || extract(epoch from now())::bigint, ${reason}, ${user.id}, ${user.id}
      FROM delta RETURNING id, project_id, account_id, cash_effect
    ), ledger AS (
      INSERT INTO ledger_entries (project_id, transaction_id, account_id, amount)
      SELECT project_id, id, account_id, cash_effect FROM transaction_row
    ), updated AS (
      UPDATE accounts SET current_balance = ${actualBalance.toString()}, version = version + 1, updated_at = now()
      WHERE id = ${accountId} AND project_id = ${active.project.id}
      RETURNING id
    )
    INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
    SELECT ${active.project.id}, ${user.id}, 'account.adjusted', 'account', id::text,
      jsonb_build_object('actualBalance', ${actualBalance.toString()}, 'reason', ${reason}) FROM updated`,
  ]);
  revalidatePath("/accounts");
}

export async function reconcileAccounts() {
  const { active } = await context();
  return db
    .select({
      id: accounts.id,
      stored: accounts.currentBalance,
      calculated: drizzleSql<bigint>`${accounts.openingBalance} + coalesce(sum(${ledgerEntries.amount}), 0)`,
    })
    .from(accounts)
    .leftJoin(ledgerEntries, eq(ledgerEntries.accountId, accounts.id))
    .where(eq(accounts.projectId, active.project.id))
    .groupBy(accounts.id);
}

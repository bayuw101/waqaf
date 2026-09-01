"use client";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Clock3,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { useFinance } from "@/lib/finance-provider";
import { rupiah } from "@/lib/finance";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet";
export function DashboardPage() {
  const { transactions, statusOf, outstandingOf, canonicalId, accounts } =
      useFinance(),
    sheet = useTransactionSheet(),
    income = transactions.reduce((n, t) => n + t.incomeEffect, 0),
    expense = transactions.reduce((n, t) => n + t.expenseEffect, 0),
    open = transactions.filter((t) => statusOf(t.id) === "open" && !t.parentId);
  return (
    <PageShell
      title="Ringkasan"
      subtitle="Proyek Utama · Semua rekening"
      onAdd={sheet.open}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Metric
          label="Total saldo dalam akses"
          value="Rp48.750.000"
          sub="3 rekening"
          icon={Building2}
          wide
        />
        <Metric
          label="Kas masuk"
          value={rupiah(income)}
          sub="Pendapatan periode ini"
          icon={ArrowDownToLine}
          success
        />
        <Metric
          label="Kas keluar"
          value={rupiah(expense)}
          sub="Biaya aktual periode ini"
          icon={ArrowUpFromLine}
          danger
        />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.65fr_1fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <b className="text-[13px]">Arus kas</b>
          <div className="mt-3 flex h-36 items-end gap-1.5">
            {[35, 52, 68, 43, 76, 62, 88, 55, 72, 94, 70, 85].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t border-t-2 border-[var(--brand)] bg-[var(--brand-soft)]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <b className="text-[13px]">Rekening</b>
          {accounts.map((account) => (
            <div
              key={account.name}
              className="flex justify-between border-b border-[var(--border)] py-3 text-[12px] last:border-0"
            >
              <span>{account.name}</span>
              <b>{rupiah(account.balance)}</b>
            </div>
          ))}
        </section>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.65fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-4 pb-2 text-[13px] font-bold">
            Transaksi terbaru
          </div>
          {transactions.slice(0, 4).map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              status={statusOf(t.id)}
              canonicalId={canonicalId(t.id)}
              parentName={
                t.parentId
                  ? transactions.find((parent) => parent.id === t.parentId)
                      ?.description
                  : undefined
              }
            />
          ))}
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-2 flex justify-between">
            <b className="text-[13px]">Perlu ditindaklanjuti</b>
            <span className="rounded bg-[var(--warning-soft)] px-2 text-[10px] text-[var(--warning)]">
              {open.length}
            </span>
          </div>
          {open.map((t) => (
            <div
              key={t.id}
              className="flex gap-2 border-b border-[var(--border)] py-3"
            >
              <Clock3 size={15} className="text-[var(--warning)]" />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[11px]">{t.description}</b>
                <small className="text-[10px] text-[var(--muted-foreground)]">
                  {t.realizationStatus === "pending"
                    ? "Menunggu realisasi"
                    : t.type === "debt"
                      ? "Utang belum lunas"
                      : "Piutang belum diterima"}
                </small>
              </span>
              <b className="text-[11px]">{rupiah(outstandingOf(t.id))}</b>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
function Metric({
  label,
  value,
  sub,
  icon: Icon,
  wide,
  success,
  danger,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Building2;
  wide?: boolean;
  success?: boolean;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 ${wide ? "md:col-span-2" : ""}`}
    >
      <span className="flex gap-1.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
        <Icon size={13} />
        {label}
      </span>
      <b
        className={`mt-2 block text-[22px] ${success ? "text-[var(--success)]" : danger ? "text-[var(--danger)]" : ""}`}
      >
        {value}
      </b>
      <small className="text-[10px] text-[var(--muted-foreground)]">
        {sub}
      </small>
    </section>
  );
}

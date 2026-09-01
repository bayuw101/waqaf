"use client";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Clock3,
  ListFilter,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SelectField } from "@/components/ui/select-field";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/lib/finance-provider";
import { Transaction, TransactionType } from "@/lib/finance";
import { TransactionRow } from "./transaction-row";
import { cn } from "@/lib/cn";
import { useTransactionSheet } from "./transaction-sheet";
const tabs: {
  value: "all" | TransactionType;
  label: string;
  icon: typeof ListFilter;
}[] = [
  { value: "all", label: "Semua", icon: ListFilter },
  { value: "cash_in", label: "Kas masuk", icon: ArrowDownToLine },
  { value: "cash_out", label: "Kas keluar", icon: ArrowUpFromLine },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { value: "debt", label: "Utang", icon: Clock3 },
  { value: "receivable", label: "Piutang", icon: ReceiptText },
];
const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
export function TransactionCenter() {
  const finance = useFinance(),
    { transactions, statusOf } = finance,
    sheet = useTransactionSheet();
  const [query, setQuery] = useState(""),
    [type, setType] = useState<"all" | TransactionType>("all"),
    [account, setAccount] = useState(""),
    [lifecycle, setLifecycle] = useState(""),
    [start, setStart] = useState("2026-08-01"),
    [end, setEnd] = useState("2026-08-31"),
    filtered =
      !!account ||
      !!lifecycle ||
      start !== "2026-08-01" ||
      end !== "2026-08-31";
  const visible = useMemo(
      () =>
        transactions
          .filter(
            (t) =>
              (type === "all" || t.type === type) &&
              (!query ||
                `${t.description} ${t.party} ${t.ref}`
                  .toLowerCase()
                  .includes(query.toLowerCase())) &&
              (!account || t.account === account) &&
              (!lifecycle ||
                (lifecycle === "cancelled"
                  ? t.cancelled
                  : !t.cancelled && statusOf(t.id) === lifecycle)) &&
              t.date >= start &&
              t.date <= end,
          )
          .sort((a, b) => b.date.localeCompare(a.date)),
      [transactions, type, query, account, lifecycle, start, end, statusOf],
    ),
    groups = Array.from(
      visible
        .reduce(
          (map, t) => map.set(t.date, [...(map.get(t.date) || []), t]),
          new Map<string, Transaction[]>(),
        )
        .entries(),
    );
  return (
    <PageShell
      title="Transaksi"
      subtitle={`${transactions.length} transaksi`}
      search={{
        value: query,
        onChange: setQuery,
        placeholder: "Cari transaksi...",
      }}
      onAdd={sheet.open}
    >
      <div className="mb-3 min-w-0 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon,
              active = type === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold",
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
                )}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mb-4 grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_auto]">
        <SelectField
          label="Rekening"
          value={account}
          options={[
            { value: "", label: "Semua rekening" },
            ...Array.from(
              new Set(transactions.map((t) => t.account).filter(Boolean)),
            ).map((x) => ({ value: x!, label: x! })),
          ]}
          onChange={setAccount}
        />
        <SelectField
          label="Status"
          value={lifecycle}
          options={[
            { value: "", label: "Semua status" },
            { value: "open", label: "Belum selesai" },
            { value: "closed", label: "Selesai" },
            { value: "cancelled", label: "Dibatalkan" },
          ]}
          onChange={setLifecycle}
        />
        <DateRangePicker
          label="Periode"
          startValue={start}
          endValue={end}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAccount("");
              setLifecycle("");
              setStart("2026-08-01");
              setEnd("2026-08-31");
            }}
          >
            <RotateCcw size={13} />
            Reset
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {groups.map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {dateLabel(date)}
            </h2>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
              {items.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  status={statusOf(t.id)}
                  canonicalId={finance.canonicalId(t.id)}
                  parentName={
                    t.parentId
                      ? transactions.find((parent) => parent.id === t.parentId)
                          ?.description
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

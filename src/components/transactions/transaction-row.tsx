"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronRight,
  Clock3,
  Link2,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { Transaction, rupiah } from "@/lib/finance";
import { cn } from "@/lib/cn";
import { useTransactionFollowUp } from "./transaction-follow-up-provider";
import { followUpAction } from "./transaction-actions";
const config = {
  cash_in: {
    label: "Kas masuk",
    icon: ArrowDownToLine,
    tone: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  cash_out: {
    label: "Kas keluar",
    icon: ArrowUpFromLine,
    tone: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    tone: "bg-[var(--info-soft)] text-[var(--info)]",
  },
  debt: {
    label: "Utang",
    icon: Clock3,
    tone: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  },
  receivable: {
    label: "Piutang",
    icon: ReceiptText,
    tone: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  },
};
export const transactionLabel = (type: Transaction["type"]) =>
  config[type].label;
export const followUpLabel = (t: Transaction) => followUpAction(t)?.label || "";
export function TransactionRow({
  transaction,
  status,
  canonicalId,
  parentName,
}: {
  transaction: Transaction;
  status?: "open" | "closed";
  canonicalId?: string;
  parentName?: string;
}) {
  const [loading, setLoading] = useState(false),
    { icon: Icon, tone } = config[transaction.type],
    { openFollowUp } = useTransactionFollowUp(),
    current = status || transaction.status,
    follow =
      current === "open" && !transaction.cancelled
        ? followUpAction(transaction)
        : null,
    href = `/transactions/${canonicalId || transaction.id}`,
    amount =
      transaction.cashEffect === 0
        ? transaction.amount
        : transaction.cashEffect;
  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)_44px] border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50">
      <Link
        href={href}
        onClick={() => setLoading(true)}
        aria-busy={loading || undefined}
        className="relative min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
      >
        {loading && (
          <span className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--card)]/75 backdrop-blur-[1px]">
            <Loader2 size={18} className="animate-spin text-[var(--brand)]" />
          </span>
        )}
        <div className="flex min-h-[88px] gap-3 px-3 py-3 md:hidden">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              tone,
            )}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[13px] font-medium">
                  {transaction.relationKind === "settlement_adjustment"
                    ? "Penyesuaian non-kas"
                    : transaction.description}
                </b>
                {parentName && (
                  <small className="flex block truncate text-[10px] text-[var(--muted-foreground)]">
                    <Link2 className="h-3 ml-[-5px]" />
                    {parentName}
                  </small>
                )}
                {!parentName && (
                  <small className="block truncate text-[10px] text-[var(--muted-foreground)]">
                    {transaction.party} · {transaction.category}
                  </small>
                )}
              </div>
              <div className="shrink-0 whitespace-nowrap text-right tabular-nums">
                <b
                  className={cn(
                    "block text-[12px]",
                    transaction.cashEffect > 0
                      ? "text-[var(--success)]"
                      : transaction.cashEffect < 0
                        ? "text-[var(--danger)]"
                        : "",
                  )}
                >
                  {rupiah(amount)}
                </b>
                <small className="text-[9px] text-[var(--muted-foreground)]">
                  {config[transaction.type].label}
                </small>
              </div>
            </div>
            <div className="mt-1.5 flex min-w-0 items-start justify-between gap-2 text-[9px] text-[var(--muted-foreground)]">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-medium text-[var(--foreground)]">
                    {transaction.account || "Non-kas"}
                  </span>
                  <span>·</span>
                  <span className="truncate">{transaction.ref}</span>
                </div>
                <span className="mt-0.5 block truncate text-[9px]">
                  PJ: {transaction.responsible}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[9px]",
                  transaction.cancelled
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : current === "closed"
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : "bg-[var(--warning-soft)] text-[var(--warning)]",
                )}
              >
                {transaction.cancelled
                  ? "Dibatalkan"
                  : current === "closed"
                    ? "Selesai"
                    : transaction.realizationStatus === "pending"
                      ? "Menunggu realisasi"
                      : "Belum selesai"}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden min-h-16 grid-cols-[36px_minmax(170px,1.3fr)_minmax(100px,.7fr)_auto_minmax(100px,.6fr)] items-center gap-x-3 px-3 py-3 md:grid">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              tone,
            )}
          >
            <Icon size={16} />
          </span>
          <span className="min-w-0">
            <b className="block truncate text-[13px] font-medium">
              {transaction.description}
            </b>
            {parentName ? (
              <small className="flex block truncate text-[10px] text-[var(--muted-foreground)]">
                <Link2 className="h-3 ml-[-5px]" />
                {parentName}
              </small>
            ) : (
              <small className="block truncate text-[11px] text-[var(--muted-foreground)]">
                {transaction.party} · {transaction.category} · PJ:{" "}
                {transaction.responsible}
              </small>
            )}
          </span>
          <span className="min-w-0">
            <b className="block truncate text-[11px]">
              {transaction.account || "Non-kas"}
            </b>
            <small className="text-[10px] text-[var(--muted-foreground)]">
              {transaction.ref}
            </small>
          </span>
          <span
            className={cn(
              "w-max rounded-md px-2 py-0.5 text-[10px]",
              transaction.cancelled
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : current === "closed"
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--warning-soft)] text-[var(--warning)]",
            )}
          >
            {transaction.cancelled
              ? "Dibatalkan"
              : current === "closed"
                ? "Selesai"
                : transaction.realizationStatus === "pending"
                  ? "Menunggu realisasi"
                  : "Belum selesai"}
          </span>
          <span className="text-right tabular-nums">
            <b
              className={cn(
                "block text-[12px]",
                transaction.cashEffect > 0
                  ? "text-[var(--success)]"
                  : transaction.cashEffect < 0
                    ? "text-[var(--danger)]"
                    : "",
              )}
            >
              {rupiah(amount)}
            </b>
            <small className="text-[10px] text-[var(--muted-foreground)]">
              {config[transaction.type].label}
            </small>
          </span>
        </div>
      </Link>
      {follow ? (
        <button
          type="button"
          aria-label={`${follow.label}: ${transaction.description}`}
          title={follow.label}
          onClick={() => openFollowUp(canonicalId || transaction.id)}
          className="flex h-full min-h-16 items-center justify-center border-l border-[var(--border)] text-[var(--brand)] hover:bg-[var(--brand-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
        >
          <follow.Icon size={17} />
        </button>
      ) : (
        <Link
          href={href}
          aria-label={`Lihat detail ${transaction.description}`}
          className="flex h-full min-h-16 items-center justify-center border-l border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ChevronRight size={17} />
        </Link>
      )}
    </div>
  );
}

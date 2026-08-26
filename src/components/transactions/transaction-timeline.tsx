import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDot,
  ReceiptText,
  RefreshCcw,
  Scale,
} from "lucide-react";
import { Transaction, rupiah } from "@/lib/finance";
import { cn } from "@/lib/cn";
const typeLabel: Record<Transaction["type"], string> = {
  cash_in: "Kas masuk",
  cash_out: "Kas keluar",
  transfer: "Transfer",
  debt: "Utang",
  receivable: "Piutang",
};
const relationLabel = (t: Transaction, index: number) =>
  index === 0
    ? "Transaksi awal"
    : t.relationKind === "debt_payment"
      ? "Pembayaran utang"
      : t.relationKind === "receivable_payment"
        ? "Penerimaan piutang"
        : t.relationKind === "settlement_adjustment"
          ? "Penyesuaian non-kas"
          : t.relationKind === "correction"
            ? "Koreksi"
            : "Transaksi terkait";
export function TransactionTimeline({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const ordered = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute bottom-4 left-[35px] top-4 w-px bg-[var(--border)]"
      />
      {ordered.map((t, index) => {
        const Icon =
          t.relationKind === "settlement_adjustment"
            ? Scale
            : t.relationKind === "correction"
              ? RefreshCcw
              : t.type === "cash_in"
                ? ArrowDownToLine
                : t.type === "cash_out"
                  ? ArrowUpFromLine
                  : ReceiptText;
        return (
          <article
            key={t.id}
            className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-1 px-3 py-3.5 transition-colors hover:bg-[var(--muted)]/40 sm:px-4"
          >
            <span
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]",
                index === 0
                  ? "text-[var(--brand)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              <Icon size={15} />
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <b className="truncate text-[12px]">
                  {relationLabel(t, index)}
                </b>
                <span className="shrink-0 rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-[9px] text-[var(--muted-foreground)]">
                  {t.ref}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--foreground)]">
                {t.description}
              </p>
              <p className="mt-1 truncate text-[10px] text-[var(--muted-foreground)]">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(`${t.date}T00:00:00`))}{" "}
                · {t.party} · {t.account || "Non-kas"}
              </p>
              {t.note && (
                <p className="mt-1 text-[10px] italic text-[var(--muted-foreground)]">
                  {t.note}
                </p>
              )}
            </div>
            <div className="col-start-2 row-start-2 flex items-baseline justify-between gap-3 border-t border-[var(--border)]/60 pt-2 text-right tabular-nums sm:col-start-3 sm:row-start-1 sm:block sm:border-0 sm:pt-0">
              <small className="text-[9px] text-[var(--muted-foreground)] sm:hidden">
                {typeLabel[t.type]}
              </small>
              <b
                className={cn(
                  "block text-[12px]",
                  t.cashEffect > 0
                    ? "text-[var(--success)]"
                    : t.cashEffect < 0
                      ? "text-[var(--danger)]"
                      : "",
                )}
              >
                {rupiah(t.amount)}
              </b>
              <small className="hidden text-[9px] text-[var(--muted-foreground)] sm:block">
                {typeLabel[t.type]}
              </small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

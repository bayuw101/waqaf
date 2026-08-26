"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, MoreVertical, RefreshCcw, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { useFinance } from "@/lib/finance-provider";
import { rupiah } from "@/lib/finance";
import { transactionLabel } from "./transaction-row";
import { followUpAction } from "./transaction-actions";
import { TransactionTimeline } from "./transaction-timeline";
import { useTransactionFollowUp } from "./transaction-follow-up-provider";
import { Button } from "@/components/ui/button";
import { RowActions } from "@/components/ui/row-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
export function TransactionDetail({ id }: { id: string }) {
  const finance = useFinance(),
    router = useRouter(),
    { toast } = useToast(),
    { openFollowUp } = useTransactionFollowUp(),
    canonical = finance.canonicalId(id),
    root = finance.transactions.find((t) => t.id === canonical),
    [cancel, setCancel] = useState(false);
  useEffect(() => {
    if (canonical !== id) router.replace(`/transactions/${canonical}`);
  }, [canonical, id, router]);
  if (!root)
    return (
      <PageShell
        title="Transaksi tidak ditemukan"
        back={{ href: "/transactions" }}
      >
        <p>Transaksi tidak tersedia.</p>
      </PageShell>
    );
  const family = finance.familyOf(root.id),
    children = family.filter((t) => t.id !== root.id),
    status = finance.statusOf(root.id),
    outstanding = finance.outstandingOf(root.id),
    follow = status === "open" ? followUpAction(root) : null,
    adminActions = [
      {
        label: "Edit metadata",
        icon: <Edit3 size={13} />,
        onClick: () =>
          toast({
            tone: "info",
            title: "Edit metadata",
            description: "Nominal tidak diubah langsung.",
          }),
      },
      {
        label: "Buat koreksi",
        icon: <RefreshCcw size={13} />,
        onClick: () =>
          toast({
            tone: "info",
            title: "Koreksi dicatat sebagai transaksi terkait.",
          }),
      },
      {
        label: "Batalkan transaksi",
        icon: <Trash2 size={13} />,
        variant: "danger" as const,
        onClick: () => setCancel(true),
      },
    ];
  return (
    <PageShell
      title="Detail transaksi"
      subtitle={`${root.ref} · ${transactionLabel(root.type)}`}
      back={{ href: "/transactions" }}
      actions={
        <div className="flex items-center gap-2">
          {follow && (
            <Button size="sm" onClick={() => openFollowUp(root.id)}>
              <follow.Icon size={14} />
              {follow.label}
            </Button>
          )}
          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" onClick={adminActions[0].onClick}>
              <Edit3 size={13} />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={adminActions[1].onClick}>
              <RefreshCcw size={13} />
              Koreksi
            </Button>
            <Button variant="ghost" size="sm" onClick={adminActions[2].onClick}>
              <Trash2 size={13} />
              Batalkan
            </Button>
          </div>
          <div className="md:hidden">
            <RowActions actions={adminActions} />
          </div>
        </div>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex justify-between">
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {transactionLabel(root.type)}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] ${status === "closed" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}
            >
              {root.cancelled
                ? "Dibatalkan"
                : status === "closed"
                  ? "Selesai"
                  : "Belum selesai"}
            </span>
          </div>
          <h2 className="text-[18px] font-bold">{root.description}</h2>
          <b className="my-5 block text-[30px]">{rupiah(root.amount)}</b>
          <dl className="grid grid-cols-[120px_1fr] gap-3 text-[12px]">
            <dt className="text-[var(--muted-foreground)]">Pihak terkait</dt>
            <dd>{root.party}</dd>
            <dt className="text-[var(--muted-foreground)]">Rekening</dt>
            <dd>{root.account || "Non-kas"}</dd>
            <dt className="text-[var(--muted-foreground)]">Nilai aktual</dt>
            <dd>
              {root.realizedAmount === undefined
                ? "Belum dicatat"
                : rupiah(root.realizedAmount)}
            </dd>
          </dl>
        </section>
        <aside className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Ringkasan penyelesaian
          </span>
          <b className="my-2 block text-[24px]">{rupiah(outstanding)}</b>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {children.length} transaksi terkait ·{" "}
            {status === "closed" ? "Selesai" : "Masih terbuka"}
          </p>
        </aside>
      </div>
      <section className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[13px] font-bold">Riwayat transaksi</h2>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Alur transaksi utama dan seluruh penyelesaiannya.
          </p>
        </div>
        <TransactionTimeline transactions={family} />
      </section>
      <ConfirmDialog
        open={cancel}
        title="Batalkan transaksi?"
        description="Transaksi tetap berada dalam riwayat dan tidak dihapus."
        confirmLabel="Batalkan transaksi"
        destructive
        onConfirm={() => {
          finance.cancel(root.id, "Dibatalkan oleh bendahara");
          setCancel(false);
        }}
        onCancel={() => setCancel(false)}
      />
    </PageShell>
  );
}

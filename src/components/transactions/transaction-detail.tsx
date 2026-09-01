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
import { Dialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/input-field";
import { MoneyField } from "@/components/ui/money-field";
import { SelectField } from "@/components/ui/select-field";
import {
  cancelTransaction,
  correctTransaction,
  updateTransactionMetadata,
} from "@/app/actions/transaction-maintenance";
import { useToast } from "@/components/ui/toast";
import { TransactionAttachments } from "./transaction-attachments";
export function TransactionDetail({
  id,
  attachments = [],
}: {
  id: string;
  attachments?: { id: string; name: string; mimeType: string; size: number }[];
}) {
  const finance = useFinance(),
    router = useRouter(),
    { toast } = useToast(),
    { openFollowUp } = useTransactionFollowUp(),
    canonical = finance.canonicalId(id),
    root = finance.transactions.find((t) => t.id === canonical),
    [cancel, setCancel] = useState(false),
    [edit, setEdit] = useState(false),
    [correction, setCorrection] = useState(false),
    [correctionAmount, setCorrectionAmount] = useState<number | null>(null),
    [correctionDirection, setCorrectionDirection] = useState<"in" | "out">(
      "in",
    ),
    [correctionAccount, setCorrectionAccount] = useState(""),
    [correctionErrors, setCorrectionErrors] = useState<Record<string, string>>(
      {},
    ),
    [cancelReason, setCancelReason] = useState(""),
    [savingAction, setSavingAction] = useState<
      "edit" | "correction" | "cancel" | null
    >(null),
    saving = savingAction !== null;
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
    cancellationImpacts = Array.from(
      family
        .filter(
          (transaction) =>
            !transaction.cancelled && transaction.cashEffect !== 0,
        )
        .reduce(
          (map, transaction) =>
            map.set(
              transaction.account || "Rekening tidak diketahui",
              (map.get(transaction.account || "Rekening tidak diketahui") ||
                0) - transaction.cashEffect,
            ),
          new Map<string, number>(),
        ),
    ),
    adminActions = [
      {
        label: "Edit metadata",
        icon: <Edit3 size={13} />,
        onClick: () => setEdit(true),
      },
      {
        label: "Buat koreksi",
        icon: <RefreshCcw size={13} />,
        onClick: () => {
          setCorrectionAccount(root.account || "");
          setCorrectionDirection("in");
          setCorrection(true);
        },
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
      <TransactionAttachments transactionId={root.id} initial={attachments} />
      <section className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[13px] font-bold">Riwayat transaksi</h2>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Alur transaksi utama dan seluruh penyelesaiannya.
          </p>
        </div>
        <TransactionTimeline transactions={family} />
      </section>
      <Dialog
        open={edit}
        title="Edit metadata"
        description="Nominal dan efek finansial tidak dapat diedit langsung."
        onClose={() => setEdit(false)}
      >
        <form
          action={async (data) => {
            setSavingAction("edit");
            try {
              await updateTransactionMetadata(root.id, {
                description: String(data.get("description") || ""),
                party: String(data.get("party") || ""),
                responsible: String(data.get("responsible") || ""),
                category: String(data.get("category") || ""),
                reference: String(data.get("reference") || ""),
                due: String(data.get("due") || "") || undefined,
              });
              toast({ tone: "success", title: "Metadata diperbarui" });
              setEdit(false);
              location.reload();
            } catch (error) {
              toast({
                tone: "error",
                title: "Gagal",
                description: (error as Error).message,
              });
            } finally {
              setSavingAction(null);
              window.dispatchEvent(new Event("waqaf:loading:end"));
            }
          }}
          className="space-y-3"
        >
          <InputField
            name="description"
            label="Deskripsi"
            defaultValue={root.description}
          />
          <InputField
            name="party"
            label="Pihak terkait"
            defaultValue={root.party}
          />
          <InputField
            name="responsible"
            label="Penanggung jawab"
            defaultValue={root.responsible}
          />
          <InputField
            name="category"
            label="Kategori"
            defaultValue={root.category}
          />
          <InputField
            name="reference"
            label="Nomor referensi"
            defaultValue={root.ref}
          />
          <InputField
            name="due"
            label="Jatuh tempo"
            defaultValue={root.due || ""}
          />
          <Button type="submit" className="w-full" loading={saving}>
            Simpan metadata
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={correction}
        title="Buat koreksi"
        description={
          root.realizationStatus === "pending"
            ? "Koreksi mengubah kas yang sudah keluar; biaya aktual tetap menunggu realisasi."
            : "Pilih arah koreksi. Koreksi kas masuk menambah saldo; koreksi kas keluar mengurangi saldo."
        }
        onClose={() => setCorrection(false)}
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const nextErrors: Record<string, string> = {};
            if (!correctionAmount)
              nextErrors.amount = "Nominal koreksi wajib diisi.";
            if (!correctionAccount)
              nextErrors.account = "Rekening terdampak wajib dipilih.";
            if (!String(data.get("reason") || "").trim())
              nextErrors.reason = "Alasan koreksi wajib diisi.";
            if (Object.keys(nextErrors).length) {
              setCorrectionErrors(nextErrors);
              return;
            }
            setCorrectionErrors({});
            setSavingAction("correction");
            try {
              const correctionId = await correctTransaction(root.id, {
                direction: correctionDirection,
                amount: correctionAmount || 0,
                account: correctionAccount,
                reason: String(data.get("reason") || ""),
              });
              toast({ tone: "success", title: "Koreksi berhasil dicatat" });
              setCorrection(false);
              finance.addTransaction(
                {
                  ...root,
                  parentId: root.id,
                  relationKind: "correction",
                  type: correctionDirection === "in" ? "cash_in" : "cash_out",
                  description: `Koreksi ${root.description}`,
                  account: correctionAccount,
                  amount: correctionAmount || 0,
                  cashEffect:
                    (correctionAmount || 0) *
                    (correctionDirection === "in" ? 1 : -1),
                  incomeEffect: 0,
                  expenseEffect: 0,
                  status: "closed",
                  realizationStatus: "not_required",
                  ref: `${root.ref}-COR`,
                },
                correctionId,
              );
            } catch (error) {
              const message = (error as Error).message;
              setCorrectionErrors({ form: message });
              toast({
                tone: "error",
                title: "Koreksi gagal",
                description: message,
              });
            } finally {
              setSavingAction(null);
              window.dispatchEvent(new Event("waqaf:loading:end"));
            }
          }}
          className="space-y-3"
        >
          {root.realizationStatus === "pending" && (
            <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-3 text-[10px] leading-5 text-[var(--warning)]">
              <b className="block">Transaksi belum terealisasi</b>
              Koreksi dicatat terhadap uang yang sudah keluar dari rekening,
              bukan biaya aktual. Nilai aktual tetap dicatat melalui Catat
              realisasi.
            </div>
          )}
          {correctionErrors.form && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[11px] font-medium text-[var(--danger)]"
            >
              {correctionErrors.form}
            </div>
          )}
          <SelectField
            label="Arah koreksi"
            value={correctionDirection}
            options={[
              { value: "in", label: "Kas masuk" },
              { value: "out", label: "Kas keluar" },
            ]}
            onChange={(value) => setCorrectionDirection(value as "in" | "out")}
          />
          <MoneyField
            label="Nominal koreksi"
            value={correctionAmount}
            error={correctionErrors.amount}
            onValueChange={(value) => {
              setCorrectionAmount(value);
              setCorrectionErrors((errors) => ({
                ...errors,
                amount: "",
                form: "",
              }));
            }}
          />
          <SelectField
            label="Rekening terdampak"
            value={correctionAccount}
            error={correctionErrors.account}
            options={finance.accountNames.map((name) => ({
              value: name,
              label: name,
            }))}
            onChange={(value) => {
              setCorrectionAccount(value);
              setCorrectionErrors((errors) => ({
                ...errors,
                account: "",
                form: "",
              }));
            }}
          />
          <InputField
            name="reason"
            label="Alasan koreksi"
            error={correctionErrors.reason}
            onChange={() =>
              setCorrectionErrors((errors) => ({
                ...errors,
                reason: "",
                form: "",
              }))
            }
          />
          <Button
            type="submit"
            className="w-full"
            loading={savingAction === "correction"}
          >
            Catat koreksi
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={cancel}
        title="Batalkan transaksi"
        description="Transaksi dan turunannya tetap berada dalam riwayat. Seluruh efek ledger akan dibalik."
        onClose={() => setCancel(false)}
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)] p-3">
            <b className="text-[10px]">Dampak pembatalan</b>
            <p className="mt-0.5 text-[9px] text-[var(--muted-foreground)]">
              Sistem membuat transaksi reversal baru dan mengembalikan seluruh
              efek kas berikut:
            </p>
            <div className="mt-2 space-y-1.5">
              {cancellationImpacts.map(([account, effect]) => (
                <div
                  key={account}
                  className="flex items-center justify-between text-[10px]"
                >
                  <span>{account}</span>
                  <b
                    className={
                      effect >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]"
                    }
                  >
                    {effect >= 0 ? "+" : "-"}
                    {rupiah(Math.abs(effect))}
                  </b>
                </div>
              ))}
            </div>
          </div>
          <InputField
            label="Alasan pembatalan"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            helperText="Wajib diisi untuk audit trail."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => setCancel(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={saving}
              onClick={async () => {
                setSavingAction("cancel");
                try {
                  await cancelTransaction(root.id, cancelReason);
                  toast({ tone: "success", title: "Transaksi dibatalkan" });
                  setCancel(false);
                  router.push("/transactions");
                  router.refresh();
                } catch (error) {
                  toast({
                    tone: "error",
                    title: "Gagal",
                    description: (error as Error).message,
                  });
                } finally {
                  setSavingAction(null);
                  window.dispatchEvent(new Event("waqaf:loading:end"));
                }
              }}
            >
              Batalkan transaksi
            </Button>
          </div>
        </div>
      </Dialog>
    </PageShell>
  );
}

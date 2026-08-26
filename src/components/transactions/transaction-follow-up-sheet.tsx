"use client";
import { useEffect, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { RightPullSheet } from "@/components/ui/right-pull-sheet";
import { MoneyField } from "@/components/ui/money-field";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { ComboboxField } from "@/components/ui/combobox-field";
import { Button } from "@/components/ui/button";
import { Transaction, rupiah } from "@/lib/finance";
import { useFinance } from "@/lib/finance-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
export function TransactionFollowUpSheet({
  transaction,
  open,
  onClose,
}: {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState<number | null>(null),
    [account, setAccount] = useState(""),
    [complete, setComplete] = useState(false),
    [responsible, setResponsible] = useState(transaction.responsible || ""),
    [reason, setReason] = useState(""),
    [contributionParty, setContributionParty] = useState(
      transaction.responsible,
    ),
    [contributionMode, setContributionMode] = useState<
      "contribution" | "reimburse" | "return"
    >("reimburse"),
    [saving, setSaving] = useState(false),
    finance = useFinance(),
    { toast } = useToast(),
    { responsibleNames, addResponsibleName } = finance,
    realize =
      transaction.type === "cash_out" &&
      transaction.realizationStatus === "pending",
    title = realize
      ? "Catat realisasi"
      : transaction.type === "debt"
        ? "Catat pembayaran utang"
        : "Catat penerimaan piutang",
    button = realize
      ? "Simpan realisasi"
      : transaction.type === "debt"
        ? "Simpan pembayaran"
        : "Simpan penerimaan",
    outstanding = finance.outstandingOf(transaction.id),
    difference = realize && value !== null ? value - transaction.amount : 0,
    differenceAmount = Math.abs(difference);
  useEffect(() => {
    if (value !== null && difference === 0) setComplete(true);
    if (difference < 0) setContributionMode("return");
    else if (difference > 0 && contributionMode === "return")
      setContributionMode("reimburse");
  }, [difference, contributionMode, value]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    if (realize && complete && difference < 0 && !account) {
      toast({
        tone: "error",
        title: "Rekening wajib dipilih",
        description: "Pilih rekening tujuan pengembalian sisa dana.",
      });
      return;
    }
    setSaving(true);
    try {
      if (realize)
        finance.recordRealization(
          transaction.id,
          value,
          complete,
          complete && difference !== 0 ? reason : undefined,
          complete && difference !== 0
            ? {
                party: contributionParty,
                responsible: contributionParty,
                mode: contributionMode,
                account:
                  contributionMode === "reimburse" ||
                  contributionMode === "return"
                    ? account
                    : undefined,
              }
            : undefined,
        );
      else if (transaction.type === "debt")
        finance.payDebt(transaction.id, value, account, responsible, complete);
      else
        finance.receiveReceivable(
          transaction.id,
          value,
          account,
          responsible,
          complete,
        );
      if (!realize && complete && value !== outstanding) {
        toast({
          tone: "warning",
          title: "Nominal belum sesuai",
          description: `Status tetap belum selesai karena selisih ${rupiah(Math.abs(value - outstanding))}.`,
        });
      }
      toast({ tone: "success", title: "Transaksi diperbarui" });
      onClose();
    } catch (error) {
      toast({
        tone: "error",
        title: "Gagal",
        description: (error as Error).message,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <RightPullSheet open={open} title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-stretch rounded-lg border border-[var(--border)] bg-[var(--accent)] p-1.5">
          <div className="min-w-0 flex-1 p-1.5">
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {realize ? "Dana keluar awal" : "Sisa yang belum diselesaikan"}
            </span>
            <b className="block text-[18px]">
              {rupiah(realize ? transaction.amount : outstanding)}
            </b>
          </div>
          <button
            type="button"
            aria-label="Gunakan sisa nominal"
            title="Gunakan sisa nominal"
            onClick={() => setValue(realize ? transaction.amount : outstanding)}
            className="flex w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
          >
            <ArrowDownToLine size={16} />
          </button>
        </div>
        <MoneyField
          label={realize ? "Nilai aktual" : "Nominal"}
          value={value}
          onValueChange={setValue}
        />
        {realize && (
          <>
            <div>
              <p className="mb-1 text-[10px] font-semibold text-[var(--muted-foreground)]">
                Status setelah realisasi
              </p>
              <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
                <button
                  type="button"
                  onClick={() => setComplete(false)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-[11px] font-semibold",
                    !complete
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)]",
                  )}
                >
                  Belum selesai
                </button>
                <button
                  type="button"
                  onClick={() => setComplete(true)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-[11px] font-semibold",
                    complete
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)]",
                  )}
                >
                  Selesai
                </button>
              </div>
            </div>
            {difference !== 0 && !complete && (
              <InputField
                label="Catatan"
                value={reason}
                helperText="Realisasi belum selesai. Penyelesaian selisih dapat dicatat saat status diubah menjadi selesai."
                onChange={(e) => setReason(e.target.value)}
              />
            )}
            {difference !== 0 && complete && (
              <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--accent)] p-3">
                <MoneyField
                  label="Penyelesaian selisih"
                  value={differenceAmount}
                  onValueChange={() => undefined}
                  readOnly
                />
                {difference > 0 && (
                  <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
                    {[
                      ["contribution", "PJ Tanggung Kekurangan"],
                      ["reimburse", "Reimburse PJ"],
                    ].map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setContributionMode(
                            mode as "contribution" | "reimburse",
                          )
                        }
                        className={cn(
                          "flex-1 rounded-md px-2 py-2 text-[10px] font-semibold",
                          contributionMode === mode
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "text-[var(--muted-foreground)]",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <InputField
                  label="Penanggung jawab"
                  value={contributionParty}
                  onChange={(e) => setContributionParty(e.target.value)}
                />
                {difference < 0 || contributionMode === "reimburse" ? (
                  <SelectField
                    label="Rekening pengembalian"
                    value={account}
                    options={["Bank Operasional", "Kas Proyek", "E-Wallet"].map(
                      (name) => ({ value: name, label: name }),
                    )}
                    onChange={setAccount}
                  />
                ) : null}
                <InputField
                  label="Catatan"
                  value={reason}
                  helperText={
                    contributionMode === "contribution"
                      ? "Dicatat sebagai kontribusi non-kas; saldo kas tidak berubah."
                      : "Reimburse akan dicatat sebagai kas keluar tambahan."
                  }
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
          </>
        )}
        {!realize && (
          <>
            <SelectField
              label="Rekening"
              value={account}
              options={["Bank Operasional", "Kas Proyek", "E-Wallet"].map(
                (x) => ({ value: x, label: x }),
              )}
              onChange={setAccount}
            />
            <ComboboxField
              label="Penanggung jawab"
              value={responsible}
              inputValue={responsible}
              options={responsibleNames.map((name) => ({
                value: name,
                label: name,
              }))}
              onInputChange={setResponsible}
              onSelect={(option) => setResponsible(option.label)}
              onCreate={(name) => {
                addResponsibleName(name);
                setResponsible(name);
              }}
              createLabel={(name) =>
                `Tambah “${name}” sebagai penanggung jawab`
              }
            />
            <div>
              <p className="mb-1 text-[10px] font-semibold text-[var(--muted-foreground)]">
                Status setelah pembayaran
              </p>
              <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
                {[false, true].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setComplete(value)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-[11px] font-semibold",
                      complete === value
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted-foreground)]",
                    )}
                  >
                    {value ? "Selesai" : "Belum selesai"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {button}
          </Button>
        </div>
      </form>
    </RightPullSheet>
  );
}

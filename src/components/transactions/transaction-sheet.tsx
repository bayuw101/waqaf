"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Clock3,
  ReceiptText,
} from "lucide-react";
import { RightPullSheet } from "@/components/ui/right-pull-sheet";
import { InputField } from "@/components/ui/input-field";
import { ComboboxField } from "@/components/ui/combobox-field";
import { MoneyField } from "@/components/ui/money-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useFinance } from "@/lib/finance-provider";
import { TransactionType, effects } from "@/lib/finance";
import { useToast } from "@/components/ui/toast";
type CreateType = TransactionType;
const tabs: { type: CreateType; label: string; icon: typeof Clock3 }[] = [
  { type: "cash_in", label: "Kas masuk", icon: ArrowDownToLine },
  { type: "cash_out", label: "Kas keluar", icon: ArrowUpFromLine },
  { type: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { type: "debt", label: "Utang", icon: Clock3 },
  { type: "receivable", label: "Piutang", icon: ReceiptText },
];
const tabPlacement: Record<CreateType, string> = {
  cash_in: "col-start-1 row-start-1",
  cash_out: "col-start-2 row-span-2 row-start-1",
  transfer: "col-start-3 row-start-1",
  debt: "col-start-1 row-start-2",
  receivable: "col-start-3 row-start-2",
};
const Context = createContext<{ open: () => void } | null>(null);
export const useTransactionSheet = () => useContext(Context)!;
const accounts = ["Bank Operasional", "Kas Proyek", "E-Wallet"].map((x) => ({
  value: x,
  label: x,
}));
export function TransactionSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false),
    [type, setType] = useState<CreateType>("cash_in"),
    [form, setForm] = useState<Record<string, string>>({
      date: "2026-08-25",
      realization: "realized",
    }),
    [amount, setAmount] = useState<number | null>(null),
    [saving, setSaving] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({});
  const finance = useFinance(),
    { toast } = useToast();
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("amanahkas:add", h);
    return () => window.removeEventListener("amanahkas:add", h);
  }, []);
  function update(k: string, v: string) {
    setForm((x) => ({ ...x, [k]: v }));
    setErrors((x) => ({ ...x, [k]: "" }));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const required =
        type === "transfer"
          ? ["from", "to", "date", "responsible"]
          : ["party", "category", "date", "responsible"],
      next = Object.fromEntries(
        required.filter((k) => !form[k]).map((k) => [k, "Wajib diisi."]),
      );
    if (!amount) next.amount = "Wajib diisi.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    if (type === "transfer" && form.from === form.to) {
      setErrors({ to: "Rekening tujuan harus berbeda." });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const nominal = amount || 0,
        realization =
          type === "cash_out" && form.realization === "pending"
            ? "pending"
            : type === "cash_out"
              ? "realized"
              : "not_required",
        status =
          type === "debt" || type === "receivable" || realization === "pending"
            ? "open"
            : "closed";
      finance.addTransaction({
        type,
        date: form.date,
        description: form.notes || tabs.find((x) => x.type === type)!.label,
        party: form.party || "Transfer internal",
        responsible: form.responsible,
        category: form.category || tabs.find((x) => x.type === type)!.label,
        account: type === "transfer" ? form.from : form.account || undefined,
        destinationAccount: type === "transfer" ? form.to : undefined,
        amount: nominal,
        status,
        realizationStatus: realization,
        realizedAmount: realization === "realized" ? nominal : undefined,
        parentId: undefined,
        relationKind: undefined,
        ref: form.ref || `TRX-${Date.now()}`,
        due: form.due || undefined,
        ...effects(type, nominal, undefined, realization),
      });
      setSaving(false);
      setOpen(false);
      setForm({ date: "2026-08-25", realization: "realized" });
      setAmount(null);
      toast({ tone: "success", title: "Transaksi tersimpan" });
    }, 250);
  }
  return (
    <Context.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <RightPullSheet
        open={open}
        title="Tambah transaksi"
        width="lg"
        onClose={() => setOpen(false)}
      >
        <div
          role="tablist"
          className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--accent)] p-1"
        >
          <div className="grid grid-cols-3 grid-rows-2 gap-1">
            {tabs.map(({ type: t, label, icon: Icon }) => {
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex min-h-12 items-center gap-2 rounded-lg border px-3 text-left",
                    tabPlacement[t],
                    t === "cash_out" &&
                      "flex-col justify-center text-center border",
                    active
                      ? "border-[var(--brand)] bg-[var(--card)] ring-1 ring-[var(--field-ring)]"
                      : "border-transparent text-[var(--muted-foreground)] bg-[var(--muted)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      t === "cash_out" && "h-9 w-9",
                      active
                        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "bg-[var(--muted)]",
                    )}
                  >
                    <Icon size={t === "cash_out" ? 17 : 14} />
                  </span>
                  <span>
                    <b
                      className={cn(
                        "block text-[11px]",
                        active && "text-[var(--brand)]",
                      )}
                    >
                      {label}
                    </b>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Fields
            type={type}
            form={form}
            errors={errors}
            update={update}
            amount={amount}
            setAmount={setAmount}
            responsibleNames={finance.responsibleNames}
            addResponsibleName={finance.addResponsibleName}
            partyNames={Array.from(
              new Set(finance.transactions.map((t) => t.party)),
            )}
            categoryNames={Array.from(
              new Set(finance.transactions.map((t) => t.category)),
            )}
          />
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Simpan transaksi
            </Button>
          </div>
        </form>
      </RightPullSheet>
    </Context.Provider>
  );
}
function Fields({
  type,
  form,
  errors,
  update,
  amount,
  setAmount,
  responsibleNames,
  addResponsibleName,
  partyNames,
  categoryNames,
}: {
  type: CreateType;
  form: Record<string, string>;
  errors: Record<string, string>;
  update: (k: string, v: string) => void;
  amount: number | null;
  setAmount: (v: number | null) => void;
  responsibleNames: string[];
  addResponsibleName: (name: string) => void;
  partyNames: string[];
  categoryNames: string[];
}) {
  const input = (k: string, l: string) => (
      <InputField
        label={l}
        value={form[k] || ""}
        error={errors[k]}
        onChange={(e) => update(k, e.target.value)}
      />
    ),
    select = (k: string, l: string, o: { value: string; label: string }[]) => (
      <SelectField
        label={l}
        value={form[k] || ""}
        error={errors[k]}
        options={o}
        onChange={(v) => update(k, v)}
      />
    ),
    date = (k: string, l: string) => (
      <DatePicker
        label={l}
        value={form[k] || ""}
        error={errors[k]}
        onChange={(v) => update(k, v)}
      />
    );
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="md:col-span-2">
        <MoneyField
          label="Nominal"
          value={amount}
          onValueChange={setAmount}
          error={errors.amount}
        />
      </div>
      {type === "transfer"
        ? select("from", "Rekening asal", accounts)
        : type === "cash_in" || type === "cash_out"
          ? select(
              "account",
              type === "cash_in" ? "Rekening tujuan" : "Rekening sumber",
              accounts,
            )
          : null}
      {type === "transfer" && select("to", "Rekening tujuan", accounts)}
      {date("date", "Tanggal")}
      <ComboboxField
        label="Penanggung jawab"
        value={form.responsible || ""}
        inputValue={form.responsible || ""}
        error={errors.responsible}
        options={responsibleNames.map((name) => ({ value: name, label: name }))}
        onInputChange={(value) => update("responsible", value)}
        onSelect={(option) => update("responsible", option.label)}
        onCreate={(name) => {
          addResponsibleName(name);
          update("responsible", name);
        }}
        createLabel={(name) => `Tambah “${name}” sebagai penanggung jawab`}
        emptyText="Tidak ada nama yang cocok."
      />
      {input("ref", "Nomor referensi")}
      {type !== "transfer" && (
        <ComboboxField
          label={
            type === "debt"
              ? "Kreditur"
              : type === "receivable"
                ? "Debitur"
                : "Pihak terkait"
          }
          value={form.party || ""}
          inputValue={form.party || ""}
          error={errors.party}
          options={partyNames.map((name) => ({ value: name, label: name }))}
          onInputChange={(value) => update("party", value)}
          onSelect={(option) => update("party", option.label)}
          onCreate={(name) => update("party", name)}
          createLabel={(name) => `Tambah “${name}” sebagai pihak terkait`}
        />
      )}
      {type !== "transfer" && (
        <ComboboxField
          label="Kategori"
          value={form.category || ""}
          inputValue={form.category || ""}
          error={errors.category}
          options={categoryNames.map((name) => ({ value: name, label: name }))}
          onInputChange={(value) => update("category", value)}
          onSelect={(option) => update("category", option.label)}
          onCreate={(name) => update("category", name)}
          createLabel={(name) => `Tambah “${name}” sebagai kategori`}
        />
      )}
      {(type === "debt" || type === "receivable") &&
        date("due", "Jatuh tempo (opsional)")}
      {type === "cash_out" && (
        <div className="md:col-span-2">
          <p className="mb-1 text-[10px] font-semibold text-[var(--muted-foreground)]">
            Status realisasi
          </p>
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
            <button
              type="button"
              onClick={() => update("realization", "realized")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-[11px] font-semibold",
                form.realization !== "pending"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              Sudah terealisasi
            </button>
            <button
              type="button"
              onClick={() => update("realization", "pending")}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-[11px] font-semibold",
                form.realization === "pending"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              Belum terealisasi
            </button>
          </div>
          {form.realization === "pending" && (
            <p className="mt-1 text-[10px] text-[var(--warning)]">
              Kas berkurang sekarang; biaya diakui setelah nilai aktual dicatat.
            </p>
          )}
        </div>
      )}
      <div className="md:col-span-2">
        <TextareaField
          label="Deskripsi / catatan"
          value={form.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </div>
  );
}

"use client";

import {
  CheckCircle2,
  Landmark,
  MoreHorizontal,
  Scale,
  WalletCards,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  adjustBalance,
  createAccount,
  renameAccount,
  setAccountActive,
} from "@/app/actions/accounts";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/input-field";
import { MoneyField } from "@/components/ui/money-field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { rupiah } from "@/lib/finance";

type Account = {
  id: string;
  name: string;
  openingBalance: string;
  currentBalance: string;
  isActive: boolean;
  version: number;
  reconciled: boolean;
};

export function AccountManager({
  accounts,
  owner,
}: {
  accounts: Account[];
  owner: boolean;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(accounts),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState<"all" | "active" | "inactive">("all"),
    [dialog, setDialog] = useState<"create" | "manage" | "adjust" | null>(null),
    [selected, setSelected] = useState<Account | null>(null),
    [amount, setAmount] = useState<number | null>(null),
    [pending, startTransition] = useTransition(),
    [action, setAction] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (!query || item.name.toLowerCase().includes(query.toLowerCase())) &&
          (filter === "all" || item.isActive === (filter === "active")),
      ),
    [items, query, filter],
  );
  const total = items
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + Number(item.currentBalance), 0);
  const run = (name: string, task: () => Promise<void>) => {
    setAction(name);
    startTransition(async () => {
      try {
        await task();
        toast({ tone: "success", title: "Rekening diperbarui" });
      } catch (error) {
        toast({
          tone: "error",
          title: "Gagal",
          description: (error as Error).message,
        });
      } finally {
        setAction(null);
        window.dispatchEvent(new Event("waqaf:loading:end"));
      }
    });
  };
  const openCreate = () => {
    setSelected(null);
    setAmount(null);
    setDialog("create");
  };

  return (
    <PageShell
      title="Rekening"
      subtitle={`${items.length} rekening · ${rupiah(total)} saldo aktif`}
      search={{
        value: query,
        onChange: setQuery,
        placeholder: "Cari rekening...",
      }}
      onAdd={owner ? openCreate : undefined}
      addLabel="Rekening"
    >
      <div className="mb-3 min-w-0 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {(
            [
              ["all", "Semua"],
              ["active", "Aktif"],
              ["inactive", "Nonaktif"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold",
                filter === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
              )}
            >
              <WalletCards size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <section>
        <h2 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Daftar rekening
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {visible.map((account) => (
            <article
              key={account.id}
              className="grid min-h-[72px] grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--border)] px-3 py-3 last:border-0 hover:bg-[var(--muted)]/50"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  account.isActive
                    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]",
                )}
              >
                <Landmark size={15} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <b className="truncate text-[13px] font-medium">
                    {account.name}
                  </b>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-semibold",
                      account.isActive
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]",
                    )}
                  >
                    {account.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[9px] text-[var(--muted-foreground)]">
                  <Scale
                    size={10}
                    className={
                      account.reconciled
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]"
                    }
                  />
                  {account.reconciled ? "Terekonsiliasi" : "Ada selisih"} ·
                  Saldo awal {rupiah(Number(account.openingBalance))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="whitespace-nowrap text-right tabular-nums">
                  <b className="block text-[13px]">
                    {rupiah(Number(account.currentBalance))}
                  </b>
                  <small className="text-[9px] text-[var(--muted-foreground)]">
                    Saldo berjalan
                  </small>
                </div>
                {owner && (
                  <button
                    aria-label={`Kelola ${account.name}`}
                    onClick={() => {
                      setSelected(account);
                      setDialog("manage");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                )}
              </div>
            </article>
          ))}
          {!visible.length && (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <Landmark size={22} className="text-[var(--brand)]" />
              <b className="mt-3 text-[13px]">
                {items.length
                  ? "Rekening tidak ditemukan"
                  : "Belum ada rekening"}
              </b>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {items.length
                  ? "Ubah pencarian atau filter."
                  : "Buat rekening pertama untuk mulai mencatat saldo."}
              </p>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={dialog === "create"}
        title="Tambah rekening"
        description="Saldo awal menjadi dasar rekonsiliasi."
        onClose={() => setDialog(null)}
      >
        <form
          action={(data) =>
            run("create", async () => {
              await createAccount(data);
              setDialog(null);
              location.reload();
            })
          }
          className="space-y-3"
        >
          <InputField
            name="name"
            label="Nama rekening"
            prefix={<Landmark size={13} />}
          />
          <MoneyField
            label="Saldo awal"
            value={amount}
            onValueChange={setAmount}
          />
          <input type="hidden" name="openingBalance" value={amount || 0} />
          <Button
            type="submit"
            className="w-full"
            loading={pending && action === "create"}
          >
            Buat rekening
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={dialog === "manage"}
        title="Kelola rekening"
        description="Ubah metadata tanpa menghapus histori."
        onClose={() => setDialog(null)}
      >
        <div className="space-y-3">
          <InputField
            label="Nama rekening"
            value={selected?.name || ""}
            prefix={<Landmark size={13} />}
            onChange={(event) =>
              setSelected((value) =>
                value ? { ...value, name: event.target.value } : value,
              )
            }
          />
          <Button
            className="w-full"
            loading={pending && action === "rename"}
            onClick={() =>
              selected &&
              run("rename", async () => {
                await renameAccount(selected.id, selected.name);
                setItems((values) =>
                  values.map((value) =>
                    value.id === selected.id ? selected : value,
                  ),
                );
                setDialog(null);
              })
            }
          >
            Simpan nama
          </Button>
          {selected && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                loading={pending && action === "active"}
                onClick={() =>
                  run("active", async () => {
                    await setAccountActive(selected.id, !selected.isActive);
                    setItems((values) =>
                      values.map((value) =>
                        value.id === selected.id
                          ? { ...value, isActive: !value.isActive }
                          : value,
                      ),
                    );
                    setDialog(null);
                  })
                }
              >
                {selected.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAmount(Number(selected.currentBalance));
                  setDialog("adjust");
                }}
              >
                <CheckCircle2 size={13} /> Sesuaikan saldo
              </Button>
            </div>
          )}
        </div>
      </Dialog>
      <Dialog
        open={dialog === "adjust"}
        title="Penyesuaian saldo"
        description="Penyesuaian menghasilkan transaksi dan ledger yang dapat diaudit."
        onClose={() => setDialog(null)}
      >
        <form
          action={(data) => {
            if (!selected) return;
            run("adjust", async () => {
              await adjustBalance(selected.id, data);
              setDialog(null);
              location.reload();
            });
          }}
          className="space-y-3"
        >
          <MoneyField
            label="Saldo aktual"
            value={amount}
            onValueChange={setAmount}
          />
          <input type="hidden" name="actualBalance" value={amount || 0} />
          <InputField name="reason" label="Alasan penyesuaian" />
          <Button
            type="submit"
            className="w-full"
            loading={pending && action === "adjust"}
          >
            Catat penyesuaian
          </Button>
        </form>
      </Dialog>
    </PageShell>
  );
}

"use client";

import { Landmark, Loader2, MoreHorizontal, Plus, Scale } from "lucide-react";
import { useState, useTransition } from "react";
import {
  adjustBalance,
  createAccount,
  renameAccount,
  setAccountActive,
} from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/input-field";
import { MoneyField } from "@/components/ui/money-field";
import { useToast } from "@/components/ui/toast";
import { rupiah } from "@/lib/finance";

export function AccountManager({
  accounts,
  owner,
}: {
  accounts: {
    id: string;
    name: string;
    openingBalance: string;
    currentBalance: string;
    isActive: boolean;
    version: number;
    reconciled: boolean;
  }[];
  owner: boolean;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(accounts),
    [dialog, setDialog] = useState<"create" | "rename" | "adjust" | null>(null),
    [selected, setSelected] = useState<(typeof accounts)[number] | null>(null),
    [amount, setAmount] = useState<number | null>(null),
    [pending, startTransition] = useTransition(),
    [action, setAction] = useState<string | null>(null);
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
      }
    });
  };
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Rekening</h1>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Saldo tersimpan yang didukung histori ledger.
          </p>
        </div>
        {owner && (
          <Button
            size="sm"
            onClick={() => {
              setSelected(null);
              setAmount(null);
              setDialog("create");
            }}
          >
            <Plus size={13} /> Tambah rekening
          </Button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((account) => (
          <article
            key={account.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Landmark size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[13px]">{account.name}</b>
                <span
                  className={`text-[9px] font-semibold ${account.isActive ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                >
                  {account.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              {owner && (
                <button
                  onClick={() => {
                    setSelected(account);
                    setDialog("rename");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>
            <p className="mt-5 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
              Saldo berjalan
            </p>
            <b className="block text-2xl tabular-nums">
              {rupiah(Number(account.currentBalance))}
            </b>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span
                className={`flex items-center gap-1 text-[9px] ${account.reconciled ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                <Scale size={11} />{" "}
                {account.reconciled ? "Terekonsiliasi" : "Ada selisih"}
              </span>
              {owner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(account);
                    setAmount(Number(account.currentBalance));
                    setDialog("adjust");
                  }}
                >
                  Sesuaikan
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--accent)] text-center">
          <Landmark size={22} className="text-[var(--brand)]" />
          <b className="mt-3 text-[13px]">Belum ada rekening</b>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Buat rekening pertama untuk mulai mencatat saldo.
          </p>
        </div>
      )}

      <Dialog
        open={dialog === "create"}
        title="Tambah rekening"
        description="Saldo awal menjadi dasar rekonsiliasi dan tidak diubah langsung setelah digunakan."
        onClose={() => setDialog(null)}
        footer={null}
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
        open={dialog === "rename"}
        title="Kelola rekening"
        description="Ubah nama atau status rekening tanpa menghapus histori."
        onClose={() => setDialog(null)}
      >
        <div className="space-y-3">
          <InputField
            label="Nama rekening"
            value={selected?.name || ""}
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
            <Button
              variant="ghost"
              className="w-full"
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
              {selected.isActive ? "Nonaktifkan rekening" : "Aktifkan rekening"}
            </Button>
          )}
        </div>
      </Dialog>
      <Dialog
        open={dialog === "adjust"}
        title="Penyesuaian saldo"
        description="Sistem membuat transaksi dan ledger penyesuaian; saldo tidak ditimpa tanpa histori."
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
    </>
  );
}

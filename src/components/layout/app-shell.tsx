"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { TransactionSheetProvider } from "@/components/transactions/transaction-sheet";
import { TransactionFollowUpProvider } from "@/components/transactions/transaction-follow-up-provider";
export function AppShell({
  children,
  user,
  activeProject,
  projects,
  owner,
  accounts,
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
  activeProject: string;
  projects: { id: string; name: string }[];
  owner: boolean;
  accounts: { name: string; balance: string }[];
}) {
  const pathname = usePathname();
  return (
    <TransactionSheetProvider>
      <TransactionFollowUpProvider>
        <div className="h-screen overflow-hidden bg-[var(--shell)]">
          <Sidebar />
          <div className="relative flex h-screen flex-col md:pl-[var(--sidebar-width)]">
            <Topbar
              user={user}
              activeProject={activeProject}
              projects={projects}
              owner={owner}
            />
            <div className="min-h-0 flex-1 px-2 pb-[4.5rem] md:p-0 md:pb-2.5 md:pr-2.5">
              <main className="h-full overflow-y-auto overflow-x-hidden rounded-2xl bg-[var(--background)] shadow-[0_-2px_20px_rgba(0,0,0,.08)] md:rounded-xl md:border md:border-[var(--border)] md:shadow-[0_20px_60px_rgba(0,0,0,.08)]">
                {accounts.length === 0 && pathname !== "/accounts" ? (
                  <div className="flex min-h-full items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] p-7 text-center shadow-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                        <span className="text-lg font-bold">Rp</span>
                      </div>
                      <h1 className="mt-4 text-[16px] font-bold">
                        Buat rekening pertama
                      </h1>
                      <p className="mt-1 text-[11px] leading-5 text-[var(--muted-foreground)]">
                        Rekening wajib dibuat sebelum mencatat transaksi agar
                        setiap perubahan saldo dapat ditelusuri.
                      </p>
                      <a
                        href="/accounts"
                        className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--primary)] px-4 text-[11px] font-semibold text-[var(--primary-foreground)]"
                      >
                        Kelola rekening
                      </a>
                    </div>
                  </div>
                ) : (
                  children
                )}
              </main>
            </div>
          </div>
          <MobileNav hasAccounts={accounts.length > 0} />
        </div>
      </TransactionFollowUpProvider>
    </TransactionSheetProvider>
  );
}

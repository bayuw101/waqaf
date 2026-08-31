"use client";
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
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
  activeProject: string;
  projects: { id: string; name: string }[];
}) {
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
            />
            <div className="min-h-0 flex-1 px-2 pb-[4.5rem] md:p-0 md:pb-2.5 md:pr-2.5">
              <main className="h-full overflow-y-auto overflow-x-hidden rounded-2xl bg-[var(--background)] shadow-[0_-2px_20px_rgba(0,0,0,.08)] md:rounded-xl md:border md:border-[var(--border)] md:shadow-[0_20px_60px_rgba(0,0,0,.08)]">
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
        </div>
      </TransactionFollowUpProvider>
    </TransactionSheetProvider>
  );
}

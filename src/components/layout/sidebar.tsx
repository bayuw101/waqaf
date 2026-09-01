"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownUp,
  ChartNoAxesColumn,
  Globe2,
  Settings,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/cn";
const navigation = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowDownUp },
  { label: "Rekening", href: "/accounts", icon: Landmark },
  { label: "Laporan", href: "/reports", icon: ChartNoAxesColumn },
  { label: "Transparansi", href: "/public", icon: Globe2 },
];
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col items-center bg-[var(--shell)] py-4 md:flex">
      <Link
        href="/dashboard"
        aria-label="WAQAF"
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand-strong)]"
      >
        W
      </Link>
      <nav className="flex w-full flex-1 flex-col items-center gap-1.5">
        {navigation.map((item) => {
          const active =
            item.href === "/" ? path === item.href : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "group relative flex h-[42px] w-[42px] items-center justify-center rounded-[11px] transition-all duration-200",
                active
                  ? "bg-[var(--shell-active)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]"
                  : "hover:bg-[var(--shell-hover)]",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active
                    ? "text-[var(--shell-foreground)] stroke-[2.25]"
                    : "text-[var(--shell-muted)] group-hover:text-[var(--shell-foreground)]",
                )}
              />
              <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--shell-border)] bg-[var(--shell-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--shell-foreground)] opacity-0 shadow-lg transition-all group-hover:translate-x-1 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <button
        aria-label="Pengaturan"
        className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}

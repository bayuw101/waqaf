"use client";
import Link from "next/link";
import { NavLink } from "./nav-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownUp,
  ChartNoAxesColumn,
  Globe2,
  Settings,
  Landmark,
  Activity,
} from "lucide-react";
const navigation = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowDownUp },
  { label: "Rekening", href: "/accounts", icon: Landmark },
  { label: "Laporan", href: "/reports", icon: ChartNoAxesColumn },
  { label: "Aktivitas", href: "/activity", icon: Activity },
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
          return <NavLink key={item.href} {...item} active={active} />;
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

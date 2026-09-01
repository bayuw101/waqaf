"use client";
import { NavLink } from "./nav-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownUp,
  ChartNoAxesColumn,
  Globe2,
  Plus,
} from "lucide-react";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet";
const nav = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowDownUp },
  { label: "Laporan", href: "/reports", icon: ChartNoAxesColumn },
  { label: "Transparansi", href: "/public", icon: Globe2 },
];
export function MobileNav({ hasAccounts }: { hasAccounts: boolean }) {
  const path = usePathname(),
    sheet = useTransactionSheet();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around bg-[var(--shell)] px-2 pb-1 md:hidden">
      {nav.slice(0, 2).map((x) => (
        <Item
          key={x.href}
          {...x}
          active={x.href === "/" ? path === x.href : path.startsWith(x.href)}
        />
      ))}
      <button
        onClick={() =>
          hasAccounts ? sheet.open() : (location.href = "/accounts")
        }
        className="flex flex-col items-center text-[10px] text-[var(--shell-muted)]"
      >
        <span className="-mt-4 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--shell)] bg-[var(--shell-foreground)] text-[var(--shell)]">
          <Plus size={20} />
        </span>
        {hasAccounts ? "Tambah" : "Rekening"}
      </button>
      {nav.slice(2).map((x) => (
        <Item key={x.href} {...x} active={path.startsWith(x.href)} />
      ))}
    </nav>
  );
}
function Item({
  label,
  href,
  icon: Icon,
  active,
}: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <NavLink href={href} label={label} icon={Icon} active={active} mobile />
  );
}

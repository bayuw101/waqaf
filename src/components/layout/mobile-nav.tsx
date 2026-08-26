"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownUp,
  ChartNoAxesColumn,
  Globe2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet";
const nav = [
  { label: "Ringkasan", href: "/", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowDownUp },
  { label: "Laporan", href: "/reports", icon: ChartNoAxesColumn },
  { label: "Transparansi", href: "/public", icon: Globe2 },
];
export function MobileNav() {
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
        onClick={sheet.open}
        className="flex flex-col items-center text-[10px] text-[var(--shell-muted)]"
      >
        <span className="-mt-4 flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--shell)] bg-[var(--shell-foreground)] text-[var(--shell)]">
          <Plus size={20} />
        </span>
        Tambah
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
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px]",
        active ? "text-[var(--shell-foreground)]" : "text-[var(--shell-muted)]",
      )}
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

export function NavLink({
  href,
  label,
  icon: Icon,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  mobile?: boolean;
}) {
  const [loading, setLoading] = useState(false),
    pathname = usePathname(),
    searchParams = useSearchParams();
  useEffect(() => setLoading(false), [pathname, searchParams]);
  return (
    <Link
      href={href}
      onClick={() => setLoading(true)}
      aria-busy={loading || undefined}
      aria-label={label}
      title={label}
      className={cn(
        mobile
          ? "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px]"
          : "group relative flex h-[42px] w-[42px] items-center justify-center rounded-[11px] transition-all duration-200",
        active
          ? mobile
            ? "text-[var(--shell-foreground)]"
            : "bg-[var(--shell-active)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]"
          : mobile
            ? "text-[var(--shell-muted)]"
            : "hover:bg-[var(--shell-hover)]",
      )}
    >
      {loading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <Icon
          className={cn(
            mobile ? "h-5 w-5" : "h-[18px] w-[18px]",
            !mobile &&
              (active
                ? "text-[var(--shell-foreground)] stroke-[2.25]"
                : "text-[var(--shell-muted)] group-hover:text-[var(--shell-foreground)]"),
          )}
        />
      )}
      {mobile && label}
      {!mobile && (
        <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--shell-border)] bg-[var(--shell-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--shell-foreground)] opacity-0 shadow-lg transition-all group-hover:translate-x-1 group-hover:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}

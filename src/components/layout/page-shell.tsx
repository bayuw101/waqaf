"use client";
import Link from "next/link";
import { ChevronLeft, Plus, Search } from "lucide-react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  back?: { href: string; label?: string };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  onAdd?: () => void;
  addLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({
  title,
  subtitle,
  back,
  search,
  onAdd,
  addLabel = "Transaksi",
  actions,
  children,
}: PageShellProps) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 md:px-7 lg:px-8">
          {back && (
            <Link
              href={back.href}
              aria-label={back.label || "Kembali"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ChevronLeft size={16} />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-[var(--foreground)]">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[11px] leading-tight text-[var(--muted-foreground)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {actions}
            {search && <HeaderSearch {...search} />}
            {onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-[12px] font-semibold text-[var(--primary-foreground)] shadow-sm transition-all hover:opacity-90 active:scale-[.97]"
              >
                <Plus size={14} />
                {addLabel}
              </button>
            )}
          </div>
          {onAdd && !search && (
            <button
              onClick={onAdd}
              aria-label={`Tambah ${addLabel}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm transition-all active:scale-[.97] md:hidden"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        {search && (
          <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
            <HeaderSearch {...search} mobile />
            {onAdd && (
              <button
                onClick={onAdd}
                aria-label={`Tambah ${addLabel}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm transition-all active:scale-[.97]"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-24 md:px-7 md:py-7 lg:px-8">
        {children}
      </div>
    </>
  );
}

function HeaderSearch({
  value,
  onChange,
  placeholder = "Cari...",
  mobile = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mobile?: boolean;
}) {
  return (
    <label
      className={`flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 ${mobile ? "w-full" : "w-44"}`}
    >
      <Search size={13} className="shrink-0 text-[var(--muted-foreground)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[12px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
      />
    </label>
  );
}

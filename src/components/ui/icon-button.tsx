"use client";

import { cn } from "@/lib/cn";

/** Small ghost icon button used in list-row action clusters. */
export function IconButton({
  title,
  danger,
  disabled,
  onClick,
  children,
}: {
  title: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]",
        danger && "hover:text-[var(--danger,#dc2626)]",
        disabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

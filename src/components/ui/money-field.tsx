"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
export const formatMoneyInput = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? ""
    : new Intl.NumberFormat("id-ID").format(value);
export const parseMoneyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};
export function MoneyField({
  label,
  value,
  onValueChange,
  error,
  helperText,
  actionLabel,
  onAction,
  readOnly = false,
}: {
  label: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  error?: string;
  helperText?: string;
  actionLabel?: string;
  onAction?: () => void;
  readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false),
    filled = focused || value !== null;
  return (
    <div>
      <div
        className={cn(
          "relative flex h-14 items-center rounded-lg border bg-[var(--card)] transition-all",
          focused
            ? "border-[var(--field-focus)] ring-2 ring-[var(--field-ring)]"
            : error
              ? "border-[var(--danger)]"
              : "border-[var(--border)] hover:border-[var(--border-strong)]",
        )}
      >
        <span className="m-1.5 flex w-11 self-stretch shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)] text-[13px] font-bold text-[var(--muted-foreground)]">
          Rp
        </span>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mr-2 shrink-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-[10px] font-semibold text-[var(--muted-foreground)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
          >
            {actionLabel}
          </button>
        )}
        <input
          inputMode="numeric"
          value={formatMoneyInput(value)}
          readOnly={readOnly}
          onChange={(e) => onValueChange(parseMoneyInput(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          className="h-full min-w-0 flex-1 bg-transparent px-2 pb-1 pt-4 text-[18px] font-bold tabular-nums text-[var(--foreground)] outline-none"
        />
        <label
          className={cn(
            "pointer-events-none absolute left-[66px] transition-all",
            filled
              ? "top-1 text-[10px] font-medium"
              : "top-1/2 -translate-y-1/2 text-[13px]",
            error
              ? "text-[var(--danger)]"
              : focused
                ? "text-[var(--brand)]"
                : "text-[var(--muted-foreground)]",
          )}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-[11px] font-medium text-[var(--danger)]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
          {helperText}
        </p>
      )}
    </div>
  );
}

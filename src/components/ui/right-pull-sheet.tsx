"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface RightPullSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | string;
  footer?: React.ReactNode;
}

const widthMap: Record<string, string> = {
  sm: "w-full sm:max-w-md",
  md: "w-full sm:max-w-lg",
  lg: "w-full sm:max-w-2xl",
  xl: "w-full sm:max-w-3xl",
};

export function RightPullSheet({
  open,
  title,
  onClose,
  children,
  width = "sm",
  footer,
}: RightPullSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  const widthClasses = widthMap[width] ?? width;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-black/25"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose}
    >
      <div
        className={cn(
          "flex h-full flex-col border-l border-[var(--border)] bg-[var(--card)] shadow-2xl",
          widthClasses,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--border)] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

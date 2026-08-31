"use client";

import Link, { type LinkProps } from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function PendingLink({
  children,
  className,
  ...props
}: LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: React.ReactNode;
  }) {
  const [pending, setPending] = useState(false);
  return (
    <Link
      {...props}
      aria-busy={pending || undefined}
      onClick={(event) => {
        setPending(true);
        props.onClick?.(event);
      }}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {pending && <Loader2 size={13} className="animate-spin" />}
      {children}
    </Link>
  );
}

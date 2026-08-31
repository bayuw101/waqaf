"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a[href]");
      if (
        link &&
        new URL(link.getAttribute("href")!, location.href).origin ===
          location.origin
      )
        setLoading(true);
    };
    document.addEventListener("click", start);
    return () => document.removeEventListener("click", start);
  }, []);

  if (!loading) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-[var(--brand-soft)]">
      <div className="h-full w-1/3 animate-[route-progress_1s_ease-in-out_infinite] bg-[var(--brand)] shadow-[0_0_8px_var(--brand)]" />
    </div>
  );
}

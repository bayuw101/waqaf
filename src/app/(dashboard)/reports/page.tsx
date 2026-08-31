import { PageShell } from "@/components/layout/page-shell";
import { ChartNoAxesColumn } from "lucide-react";
export default function Page() {
  return (
    <PageShell title="Laporan" subtitle="Ringkasan dari aktivitas efektif">
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--accent)] text-center">
        <ChartNoAxesColumn
          size={24}
          className="mb-2 text-[var(--muted-foreground)]"
        />
        <b className="text-[13px]">Laporan terpadu</b>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Menggunakan klasifikasi kas, pendapatan, dan biaya aktual.
        </p>
      </div>
    </PageShell>
  );
}

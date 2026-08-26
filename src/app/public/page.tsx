import { PageShell } from "@/components/layout/page-shell";
import { Globe2 } from "lucide-react";
export default function Page() {
  return (
    <PageShell title="Transparansi" subtitle="Pratinjau data publik aman">
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--accent)] text-center">
        <Globe2 size={24} className="mb-2 text-[var(--muted-foreground)]" />
        <b className="text-[13px]">Halaman publik</b>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Hanya aktivitas publik dan field yang diizinkan.
        </p>
      </div>
    </PageShell>
  );
}

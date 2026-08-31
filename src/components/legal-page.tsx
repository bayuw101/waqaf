import { PublicShell } from "./public-site";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-20">
        <span className="text-[9px] font-bold uppercase tracking-[.22em] text-[var(--brand)]">
          WAQAF · Legal
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-[-.03em] md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
          Terakhir diperbarui: {updated}
        </p>
        <div className="mt-10 space-y-8 text-[12px] leading-6 text-[var(--muted-foreground)] [&_h2]:mb-2 [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-[var(--brand)]">
          {children}
        </div>
      </article>
    </PublicShell>
  );
}

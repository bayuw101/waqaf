import { desc, eq } from "drizzle-orm";
import { Activity, CircleDot, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { auditLabels, sanitizeAuditSummary } from "@/lib/audit";
import { projectContext } from "@/lib/projects";

export default async function ActivityPage() {
  const { active } = await projectContext();
  if (!active) redirect("/onboarding");
  const logs = await db
    .select({ log: auditLogs, actorName: users.name, actorEmail: users.email })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.actorId, users.id))
    .where(eq(auditLogs.projectId, active.project.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <PageShell
      title="Aktivitas project"
      subtitle={`${logs.length} aktivitas terbaru`}
    >
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {logs.map(({ log, actorName, actorEmail }, index) => {
          const summary = sanitizeAuditSummary(log.summary);
          return (
            <article
              key={log.id.toString()}
              className="relative grid grid-cols-[36px_minmax(0,1fr)_auto] gap-3 border-b border-[var(--border)] px-3 py-3 last:border-0 hover:bg-[var(--muted)]/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--brand)]">
                <CircleDot size={14} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px]">
                  <b>{actorName || actorEmail}</b>{" "}
                  {auditLabels[log.action] || log.action}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[var(--muted-foreground)]">
                  {log.objectType} ·{" "}
                  {Object.entries(summary)
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join(" · ") || "Tanpa detail tambahan"}
                </p>
              </div>
              <time className="whitespace-nowrap text-right text-[9px] text-[var(--muted-foreground)]">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: active.project.timezone,
                }).format(log.createdAt)}
              </time>
            </article>
          );
        })}
        {!logs.length && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Activity size={19} />
            </span>
            <b className="mt-3 text-[13px]">Belum ada aktivitas</b>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Perubahan penting project akan tampil di sini.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

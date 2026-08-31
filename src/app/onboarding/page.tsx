import { Building2, FolderPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projectMembers } from "@/db/schema";
import { currentUser } from "@/lib/projects";
import { eq } from "drizzle-orm";
import { createProject } from "./actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; new?: string }>;
}) {
  const user = await currentUser();
  const [membership] = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, user.id))
    .limit(1);
  const { error, new: createAnother } = await searchParams;
  if (membership && !createAnother) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--shell)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <FolderPlus size={21} />
        </div>
        <h1 className="text-xl font-bold">
          {membership ? "Buat project baru" : "Buat project pertama"}
        </h1>
        <p className="mt-1 text-[12px] leading-5 text-[var(--muted-foreground)]">
          Project memisahkan rekening, transaksi, anggota, dan laporan
          organisasi Anda.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-[var(--danger-soft)] p-3 text-[11px] text-[var(--danger)]"
          >
            Nama project dan organisasi wajib diisi.
          </p>
        )}
        <form action={createProject} className="mt-6 space-y-3">
          <label className="relative block">
            <FolderPlus
              size={14}
              className="absolute left-3 top-3.5 text-[var(--muted-foreground)]"
            />
            <input
              name="name"
              aria-label="Nama project"
              placeholder=" "
              className="peer h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-9 pb-1 pt-3.5 text-[13px] outline-none focus:border-[var(--field-focus)] focus:ring-2 focus:ring-[var(--field-ring)]"
            />
            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-[13px] text-[var(--muted-foreground)] transition-all peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
              Nama project
            </span>
          </label>
          <label className="relative block">
            <Building2
              size={14}
              className="absolute left-3 top-3.5 text-[var(--muted-foreground)]"
            />
            <input
              name="organizationName"
              aria-label="Nama organisasi"
              placeholder=" "
              className="peer h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-9 pb-1 pt-3.5 text-[13px] outline-none focus:border-[var(--field-focus)] focus:ring-2 focus:ring-[var(--field-ring)]"
            />
            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-[13px] text-[var(--muted-foreground)] transition-all peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
              Nama organisasi
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-[10px] text-[var(--muted-foreground)]">
            <span>
              Mata uang <b className="block text-[var(--foreground)]">IDR</b>
            </span>
            <span>
              Zona waktu{" "}
              <b className="block text-[var(--foreground)]">Asia/Jakarta</b>
            </span>
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-[var(--primary-foreground)] active:scale-[0.98]"
          >
            Buat project
          </button>
        </form>
      </section>
    </main>
  );
}

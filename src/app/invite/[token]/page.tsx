import { and, eq, gt, isNull } from "drizzle-orm";
import { Clock3, FolderKanban, ShieldCheck, UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectInvitations, projects, users } from "@/db/schema";
import { claimInvitation } from "@/app/actions/invitations";
import { invitationHash } from "@/lib/invitations";
import { signInWithGoogle } from "@/app/login/actions";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const session = await auth();
  const [invitation] = await db
    .select({
      projectName: projects.name,
      organizationName: projects.organizationName,
      inviterName: users.name,
      expiresAt: projectInvitations.expiresAt,
    })
    .from(projectInvitations)
    .innerJoin(projects, eq(projectInvitations.projectId, projects.id))
    .innerJoin(users, eq(projectInvitations.createdBy, users.id))
    .where(
      and(
        eq(projectInvitations.tokenHash, invitationHash(token)),
        isNull(projectInvitations.claimedAt),
        isNull(projectInvitations.revokedAt),
        gt(projectInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--shell)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <UserPlus size={21} />
        </div>
        {!invitation || error ? (
          <>
            <h1 className="text-xl font-bold">Undangan tidak tersedia</h1>
            <p className="mt-2 text-[12px] leading-5 text-[var(--muted-foreground)]">
              Tautan ini sudah digunakan, dibatalkan, atau melewati masa berlaku
              tujuh hari.
            </p>
            <a
              href="/"
              className="mt-6 flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] text-[11px] font-semibold text-[var(--primary-foreground)]"
            >
              Kembali ke WAQAF
            </a>
          </>
        ) : (
          <>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">
              Undangan project
            </span>
            <h1 className="mt-1 text-xl font-bold">
              Bergabung dengan {invitation.projectName}
            </h1>
            <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">
              {invitation.organizationName}
            </p>
            <div className="mt-5 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3 text-[10px] text-[var(--muted-foreground)]">
              <p className="flex items-center gap-2">
                <FolderKanban size={13} /> Diundang oleh{" "}
                {invitation.inviterName || "Owner project"}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={13} /> Berlaku sampai{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(invitation.expiresAt)}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={13} /> Tautan hanya dapat digunakan satu kali
              </p>
            </div>
            {session?.user ? (
              <form action={claimInvitation.bind(null, token)} className="mt-6">
                <button className="h-11 w-full rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-[var(--primary-foreground)] active:scale-[0.98]">
                  Terima undangan
                </button>
              </form>
            ) : (
              <form
                action={signInWithGoogle.bind(null, token)}
                className="mt-6"
              >
                <button className="h-11 w-full rounded-lg bg-[var(--primary)] text-[12px] font-semibold text-[var(--primary-foreground)] active:scale-[0.98]">
                  Masuk dengan Google untuk bergabung
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}

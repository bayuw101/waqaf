import { and, desc, eq, isNull } from "drizzle-orm";
import { Archive, Link2, ShieldCheck, Users } from "lucide-react";
import { db } from "@/db";
import { projectInvitations, projectMembers, users } from "@/db/schema";
import { projectContext } from "@/lib/projects";
import {
  archiveProject,
  removeMember,
  updateProject,
} from "@/app/actions/projects";
import { createInvitation, revokeInvitation } from "@/app/actions/invitations";

export default async function ProjectSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    invitation?: string;
  }>;
}) {
  const { active } = await projectContext();
  const params = await searchParams;
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, active.project.id));
  const owner = active.role === "owner";
  const invitations = owner
    ? await db
        .select()
        .from(projectInvitations)
        .where(
          and(
            eq(projectInvitations.projectId, active.project.id),
            isNull(projectInvitations.claimedAt),
            isNull(projectInvitations.revokedAt),
          ),
        )
        .orderBy(desc(projectInvitations.createdAt))
    : [];
  const invitationUrl = params.invitation
    ? `${process.env.NEXT_PUBLIC_APP_URL}/invite/${params.invitation}`
    : null;
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold">Pengaturan project</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Identitas, kebijakan saldo, dan anggota project.
        </p>
      </div>
      {params.saved && (
        <p className="mb-3 rounded-lg bg-[var(--success-soft)] p-3 text-[11px] text-[var(--success)]">
          Pengaturan berhasil disimpan.
        </p>
      )}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <form action={updateProject} className="grid gap-3 md:grid-cols-2">
          <label className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Nama project
            <input
              name="name"
              defaultValue={active.project.name}
              disabled={!owner}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--field-focus)] disabled:opacity-60"
            />
          </label>
          <label className="text-[10px] font-semibold text-[var(--muted-foreground)]">
            Nama organisasi
            <input
              name="organizationName"
              defaultValue={active.project.organizationName}
              disabled={!owner}
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--field-focus)] disabled:opacity-60"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-[10px] text-[var(--muted-foreground)] md:col-span-2">
            <span>
              Mata uang
              <b className="block text-[var(--foreground)]">
                {active.project.currency}
              </b>
            </span>
            <span>
              Zona waktu
              <b className="block text-[var(--foreground)]">
                {active.project.timezone}
              </b>
            </span>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-[11px] md:col-span-2">
            <input
              type="checkbox"
              name="allowNegativeBalance"
              defaultChecked={active.project.allowNegativeBalance}
              disabled={!owner}
            />
            <span>
              <b className="block">Izinkan saldo negatif</b>
              <small className="text-[var(--muted-foreground)]">
                Transaksi kas keluar tetap dapat diposting saat saldo tidak
                mencukupi.
              </small>
            </span>
          </label>
          {owner && (
            <button
              type="submit"
              className="h-9 rounded-lg bg-[var(--primary)] px-4 text-[11px] font-semibold text-[var(--primary-foreground)] md:col-start-2"
            >
              Simpan perubahan
            </button>
          )}
        </form>
      </section>
      {owner && (
        <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link2 size={16} />
              <div>
                <h2 className="text-[13px] font-bold">Undangan anggota</h2>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  Tautan berlaku tujuh hari dan hanya dapat digunakan sekali.
                </p>
              </div>
            </div>
            <form action={createInvitation}>
              <button className="rounded-lg bg-[var(--primary)] px-3 py-2 text-[10px] font-semibold text-[var(--primary-foreground)]">
                Buat tautan
              </button>
            </form>
          </div>
          {invitationUrl && (
            <div className="mt-3 rounded-lg border border-[var(--brand)] bg-[var(--brand-soft)] p-3">
              <p className="text-[10px] font-semibold text-[var(--brand)]">
                Tautan baru — salin sekarang
              </p>
              <input
                readOnly
                value={invitationUrl}
                aria-label="Tautan undangan baru"
                className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[10px] text-[var(--foreground)]"
              />
            </div>
          )}
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3"
            >
              <small className="text-[10px] text-[var(--muted-foreground)]">
                Berlaku sampai{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(invitation.expiresAt)}
              </small>
              <form action={revokeInvitation.bind(null, invitation.id)}>
                <button className="rounded-md px-2 py-1 text-[10px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                  Batalkan
                </button>
              </form>
            </div>
          ))}
        </section>
      )}
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} />
          <h2 className="text-[13px] font-bold">Anggota</h2>
        </div>
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between border-t border-[var(--border)] py-3 first:border-0"
          >
            <div className="min-w-0">
              <b className="block truncate text-[12px]">
                {member.name || member.email}
              </b>
              <small className="text-[10px] text-[var(--muted-foreground)]">
                {member.email} · {member.role}
              </small>
            </div>
            {owner && member.role === "member" && (
              <form action={removeMember.bind(null, member.id)}>
                <button className="rounded-md px-2 py-1 text-[10px] font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                  Hapus
                </button>
              </form>
            )}
          </div>
        ))}
      </section>
      {owner && (
        <section className="mt-4 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-4">
          <div className="flex gap-3">
            <Archive size={17} className="text-[var(--danger)]" />
            <div className="flex-1">
              <b className="text-[12px]">Arsipkan project</b>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Project menjadi read-only dan hilang dari project aktif.
              </p>
            </div>
            <form action={archiveProject}>
              <button className="rounded-lg border border-[var(--danger)] px-3 py-2 text-[10px] font-semibold text-[var(--danger)]">
                Arsipkan
              </button>
            </form>
          </div>
        </section>
      )}
      {!owner && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--brand-soft)] p-3 text-[10px] text-[var(--brand)]">
          <ShieldCheck size={14} /> Hanya owner yang dapat mengubah pengaturan
          dan anggota.
        </div>
      )}
    </div>
  );
}

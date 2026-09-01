"use client";

import {
  Archive,
  Check,
  Copy,
  Link2,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  archiveProject,
  removeMember,
  updateProject,
} from "@/app/actions/projects";
import { createInvitation, revokeInvitation } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/input-field";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useToast } from "@/components/ui/toast";

export type ProjectManagerProps = {
  project: {
    name: string;
    organizationName: string;
    currency: string;
    timezone: string;
    allowNegativeBalance: boolean;
  };
  owner: boolean;
  members: {
    id: string;
    name: string | null;
    email: string;
    role: "owner" | "member";
  }[];
  invitations: { id: string; expiresAt: string }[];
};

export function ProjectManager({
  project,
  owner,
  members: initialMembers,
  invitations: initialInvitations,
}: ProjectManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [allowNegative, setAllowNegative] = useState(
    project.allowNegativeBalance,
  );
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<string | null>(null);

  const run = (name: string, task: () => Promise<void>) => {
    setAction(name);
    startTransition(async () => {
      try {
        await task();
      } catch (error) {
        toast({
          tone: "error",
          title: "Gagal",
          description: (error as Error).message,
        });
      } finally {
        setAction(null);
        window.dispatchEvent(new Event("waqaf:loading:end"));
      }
    });
  };

  const generateInvite = () =>
    run("invite", async () => {
      const link = await createInvitation();
      setInviteLink(link);
      setInviteOpen(true);
      setInvitations((current) => [
        {
          id: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 604800000).toISOString(),
        },
        ...current,
      ]);
    });

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-[13px] font-bold">Identitas project</h2>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Informasi dasar yang digunakan pada laporan dan undangan.
          </p>
        </div>
        <form
          action={(data) =>
            run("save", async () => {
              await updateProject(data);
              toast({ tone: "success", title: "Project diperbarui" });
            })
          }
          className="grid gap-3 md:grid-cols-2"
        >
          <InputField
            name="name"
            label="Nama project"
            defaultValue={project.name}
            disabled={!owner || pending}
          />
          <InputField
            name="organizationName"
            label="Nama organisasi"
            defaultValue={project.organizationName}
            disabled={!owner || pending}
          />
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-[10px] text-[var(--muted-foreground)] md:col-span-2">
            <span>
              Mata uang
              <b className="block text-[var(--foreground)]">
                {project.currency}
              </b>
            </span>
            <span>
              Zona waktu
              <b className="block text-[var(--foreground)]">
                {project.timezone}
              </b>
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 md:col-span-2">
            <div>
              <b className="block text-[11px]">Izinkan saldo negatif</b>
              <small className="text-[10px] text-[var(--muted-foreground)]">
                Kas keluar tetap dapat diposting ketika saldo tidak cukup.
              </small>
            </div>
            <>
              <input
                type="hidden"
                name="allowNegativeBalance"
                value={allowNegative ? "on" : "off"}
              />
              <ToggleSwitch
                checked={allowNegative}
                onChange={setAllowNegative}
                disabled={!owner || pending}
                ariaLabel="Izinkan saldo negatif"
              />
            </>
          </div>
          {owner && (
            <Button
              type="submit"
              size="sm"
              loading={pending && action === "save"}
              className="md:col-start-2"
            >
              Simpan perubahan
            </Button>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <div>
              <h2 className="text-[13px] font-bold">Anggota project</h2>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {members.length} orang memiliki akses.
              </p>
            </div>
          </div>
          {owner && (
            <Button
              size="sm"
              onClick={generateInvite}
              loading={pending && action === "invite"}
            >
              <Link2 size={13} /> Undang anggota
            </Button>
          )}
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 border-t border-[var(--border)] p-3 first:border-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand)]">
                {(member.name || member.email).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[12px]">
                  {member.name || "Tanpa nama"}
                </b>
                <small className="block truncate text-[10px] text-[var(--muted-foreground)]">
                  {member.email}
                </small>
              </div>
              <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-[9px] capitalize text-[var(--muted-foreground)]">
                {member.role}
              </span>
              {owner && member.role === "member" && (
                <button
                  onClick={() => setRemoveId(member.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        {owner && invitations.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Undangan aktif
            </p>
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between border-t border-[var(--border)] py-2 first:border-0"
              >
                <small className="text-[10px] text-[var(--muted-foreground)]">
                  Berlaku sampai{" "}
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(invitation.expiresAt))}
                </small>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={action === invitation.id}
                  onClick={() =>
                    run(invitation.id, async () => {
                      await revokeInvitation(invitation.id);
                      setInvitations((items) =>
                        items.filter((item) => item.id !== invitation.id),
                      );
                    })
                  }
                >
                  Batalkan
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {owner && (
        <section className="rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-4">
          <div className="flex items-center gap-3">
            <Archive size={17} className="text-[var(--danger)]" />
            <div className="min-w-0 flex-1">
              <b className="text-[12px]">Arsipkan project</b>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Project menjadi read-only dan dapat dipulihkan kembali.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setArchiveOpen(true)}
            >
              Arsipkan
            </Button>
          </div>
        </section>
      )}

      <Dialog
        open={inviteOpen}
        title="Undang anggota project"
        description="Bagikan tautan satu kali ini kepada anggota yang ingin bergabung."
        onClose={() => setInviteOpen(false)}
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--brand)]">
            <Link2 size={18} />
          </span>
          <b className="mt-2 block text-[12px]">Tautan undangan siap</b>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Berlaku tujuh hari dan hanya dapat digunakan sekali.
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            readOnly
            value={inviteLink}
            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 font-mono text-[10px] outline-none"
          />
          <Button
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        title="Hapus anggota?"
        description="Anggota akan langsung kehilangan akses ke project ini."
        confirmLabel="Hapus anggota"
        destructive
        loading={pending && action === "remove"}
        onCancel={() => setRemoveId(null)}
        onConfirm={() =>
          removeId &&
          run("remove", async () => {
            await removeMember(removeId);
            setMembers((items) => items.filter((item) => item.id !== removeId));
            setRemoveId(null);
          })
        }
      />
      <ConfirmDialog
        open={archiveOpen}
        title="Arsipkan project?"
        description="Project menjadi read-only dan tidak tampil pada daftar project aktif."
        confirmLabel="Arsipkan project"
        destructive
        loading={pending && action === "archive"}
        onCancel={() => setArchiveOpen(false)}
        onConfirm={() =>
          run("archive", async () => {
            await archiveProject();
            router.push("/");
            router.refresh();
          })
        }
      />
    </div>
  );
}

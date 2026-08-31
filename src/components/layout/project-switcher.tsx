"use client";

import {
  Check,
  ChevronDown,
  FolderKanban,
  Link2,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchProject } from "@/app/actions/projects";
import { createInvitation } from "@/app/actions/invitations";
import { Dialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { PendingLink } from "@/components/ui/pending-link";

export function ProjectSwitcher({
  active,
  projects,
  owner,
}: {
  active: string;
  projects: { id: string; name: string }[];
  owner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, []);
  const selected = projects.find((project) => project.id === active)!;
  const invite = () => {
    setAction("invite");
    startTransition(async () => {
      try {
        setInviteLink(await createInvitation());
        setOpen(false);
        setInviteOpen(true);
      } finally {
        setAction(null);
      }
    });
  };
  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen((value) => !value)}
          className="flex max-w-44 items-center gap-1.5 rounded-lg py-1 text-left text-[var(--shell-foreground)] hover:text-white disabled:opacity-60"
        >
          {pending && action?.startsWith("switch:") ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <FolderKanban
              size={13}
              className="shrink-0 text-[var(--shell-muted)]"
            />
          )}
          <span className="truncate text-[11px] font-semibold">
            {selected.name}
          </span>
          <ChevronDown
            size={11}
            className="shrink-0 text-[var(--shell-muted)]"
          />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-xl">
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Project aktif
              </p>
              <b className="block truncate text-[12px]">{selected.name}</b>
            </div>
            <div className="p-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setAction(`switch:${project.id}`);
                    startTransition(async () => {
                      await switchProject(project.id);
                      setOpen(false);
                      router.refresh();
                      setAction(null);
                    });
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] font-medium hover:bg-[var(--muted)] disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {action === `switch:${project.id}` && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </span>
                  {project.id === active && (
                    <Check size={13} className="text-[var(--brand)]" />
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 border-t border-[var(--border)] p-1">
              <PendingLink
                href="/settings/project"
                onClick={() => setOpen(false)}
                className="justify-center rounded-lg px-2 py-2 text-[10px] font-semibold hover:bg-[var(--muted)]"
              >
                <Settings size={12} /> Kelola
              </PendingLink>
              {owner && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={invite}
                  className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] disabled:opacity-60"
                >
                  {action === "invite" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Link2 size={12} />
                  )}{" "}
                  Undang
                </button>
              )}
            </div>
            <PendingLink
              href="/onboarding?new=1"
              onClick={() => setOpen(false)}
              className="w-full border-t border-[var(--border)] px-3 py-2.5 text-[10px] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              <Plus size={13} /> Buat project baru
            </PendingLink>
          </div>
        )}
      </div>
      <Dialog
        open={inviteOpen}
        title="Undang anggota project"
        description="Bagikan tautan ini. Tautan berlaku tujuh hari dan hanya dapat digunakan sekali."
        onClose={() => setInviteOpen(false)}
      >
        <div className="flex gap-2">
          <input
            readOnly
            value={inviteLink}
            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 font-mono text-[10px] outline-none"
          />
          <Button
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={14} /> : "Salin"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

"use client";

import {
  Check,
  Copy,
  FolderKanban,
  Home,
  Loader2,
  Plus,
  Send,
  Settings,
  CircleChevronDown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { switchProject } from "@/app/actions/projects";
import { createInvitation } from "@/app/actions/invitations";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/confirm-dialog";
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
  const [open, setOpen] = useState(false),
    [pending, startTransition] = useTransition(),
    [action, setAction] = useState<string | null>(null),
    [inviteLink, setInviteLink] = useState(""),
    [inviteOpen, setInviteOpen] = useState(false),
    [copied, setCopied] = useState(false);
  const router = useRouter(),
    pathname = usePathname(),
    managing = pathname === "/settings/project",
    ref = useRef<HTMLDivElement>(null),
    selected = projects.find((project) => project.id === active)!;
  useEffect(() => {
    const close = (event: PointerEvent) =>
      !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, []);
  const invite = () => {
    setAction("invite");
    startTransition(async () => {
      try {
        setInviteLink(await createInvitation());
        setOpen(false);
        setInviteOpen(true);
      } finally {
        setAction(null);
        window.dispatchEvent(new Event("waqaf:loading:end"));
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
          className="flex h-8 max-w-52 items-center gap-2 rounded-lg bg-white/[0.06] pr-2 pl-[5px] text-left text-[var(--shell-foreground)] border border-gray-200 transition-colors hover:border-gray/400 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
        >
          <div className="border border-gray-300 p-[4px] rounded-sm bg-gray-400/10">
            {pending && action?.startsWith("switch:") ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Home size={13} className="shrink-0 text-[var(--shell-muted)]" />
            )}
          </div>
          <span className="min-w-0 flex-1">
            <small className="block mb-[2px] text-[7px] font-semibold uppercase leading-none tracking-wider text-[var(--shell-muted)]">
              Active Project
            </small>
            <span className="block truncate text-[11px] font-semibold leading-tight">
              {selected.name}
            </span>
          </span>
          <CircleChevronDown
            size={12}
            className={`shrink-0 text-[var(--shell-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-xl">
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--muted)]/60 px-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--brand)] shadow-sm">
                <Home size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Project aktif
                </p>
                <b className="block truncate text-[12px]">{selected.name}</b>
              </div>
              <div className="flex gap-1">
                <PendingLink
                  href="/settings/project"
                  onClick={() => setOpen(false)}
                  aria-label="Kelola project"
                  title="Kelola project"
                  className="flex h-8 w-8 justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] p-0 text-[var(--muted-foreground)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                >
                  <Settings size={13} />
                </PendingLink>
                {owner && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={invite}
                    aria-label="Undang anggota"
                    title="Undang anggota"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] disabled:opacity-60"
                  >
                    {action === "invite" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="p-1">
              <p className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Project Anda
              </p>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  disabled={pending || managing || project.id === active}
                  onClick={() => {
                    setAction(`switch:${project.id}`);
                    startTransition(async () => {
                      await switchProject(project.id);
                      setOpen(false);
                      router.refresh();
                      setAction(null);
                      window.dispatchEvent(new Event("waqaf:loading:end"));
                    });
                  }}
                  className="group flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-[11px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:cursor-default disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--card)]">
                      {action === `switch:${project.id}` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <FolderKanban size={12} />
                      )}
                    </span>
                    <span className="truncate">{project.name}</span>
                  </span>
                  {project.id === active && (
                    <Check size={13} className="text-[var(--brand)]" />
                  )}
                </button>
              ))}
            </div>
            {managing && (
              <p className="border-t border-[var(--border)] bg-[var(--warning-soft)] px-3 py-2 text-[9px] text-[var(--warning)]">
                Selesaikan pengelolaan project sebelum berpindah.
              </p>
            )}
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
        description="Tautan berlaku tujuh hari dan hanya dapat digunakan sekali."
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
            aria-label="Salin tautan undangan"
            title="Salin tautan undangan"
            className="h-10 w-10 px-0"
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
    </>
  );
}

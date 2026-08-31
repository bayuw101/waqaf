"use client";

import { Check, ChevronDown, FolderKanban } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { switchProject } from "@/app/actions/projects";

export function ProjectSwitcher({
  active,
  projects,
}: {
  active: string;
  projects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, []);
  const selected = projects.find((project) => project.id === active)!;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
        className="flex max-w-44 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[var(--shell-foreground)] hover:bg-[var(--shell-hover)] disabled:opacity-60"
      >
        <FolderKanban
          size={14}
          className="shrink-0 text-[var(--shell-muted)]"
        />
        <span className="truncate text-[11px] font-semibold">
          {selected.name}
        </span>
        <ChevronDown size={11} className="shrink-0 text-[var(--shell-muted)]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-[var(--foreground)] shadow-lg">
          <p className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Pilih project
          </p>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => {
                setOpen(false);
                startTransition(() => switchProject(project.id));
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] font-medium hover:bg-[var(--muted)]"
            >
              <span className="truncate">{project.name}</span>
              {project.id === active && (
                <Check size={13} className="text-[var(--brand)]" />
              )}
            </button>
          ))}
          <a
            href="/onboarding?new=1"
            className="mt-1 block rounded-lg border-t border-[var(--border)] px-2.5 py-2 text-[11px] font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            + Buat project baru
          </a>
        </div>
      )}
    </div>
  );
}

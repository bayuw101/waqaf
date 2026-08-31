"use client";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Palette,
  UserCog,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/use-theme";
import { ProjectSwitcher } from "./project-switcher";
export function Topbar({
  user,
  activeProject,
  projects,
}: {
  user: { name: string; email: string };
  activeProject: string;
  projects: { id: string; name: string }[];
}) {
  const path = usePathname(),
    { dark, toggle } = useTheme(),
    [open, setOpen] = useState(false),
    ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", h, true);
    return () => document.removeEventListener("pointerdown", h, true);
  }, []);
  const page =
    path === "/"
      ? "Ringkasan"
      : path.split("/").filter(Boolean).at(-1) || "Ringkasan";
  return (
    <header className="flex h-[var(--header-height)] items-center gap-3 px-4 text-[var(--shell-foreground)]">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px] text-[var(--shell-muted)]">
        <Home size={14} />
        <ChevronDown size={11} className="-rotate-90" />
        <ProjectSwitcher active={activeProject} projects={projects} />
        <ChevronDown size={11} className="hidden -rotate-90 sm:block" />
        <b className="truncate font-semibold text-[var(--shell-foreground)] capitalize">
          {page}
        </b>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)]">
          <Bell size={16} />
          <i className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-[var(--danger)]" />
        </button>
        <button
          onClick={toggle}
          aria-label={dark ? "Mode terang" : "Mode gelap"}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-foreground)] md:flex"
        >
          <Palette size={16} />
        </button>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((x) => !x)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--shell-hover)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand-strong)]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-left md:block">
              <b className="block text-[12px] font-medium leading-tight">
                {user.name}
              </b>
              <small className="block text-[10px] capitalize leading-tight text-[var(--shell-muted)]">
                Bendahara
              </small>
            </span>
            <ChevronDown
              size={12}
              className={`hidden text-[var(--shell-muted)] transition-transform md:block ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-[var(--foreground)] shadow-lg">
              <div className="px-3 py-2.5">
                <b className="block truncate text-[12px] font-medium">
                  {user.name}
                </b>
                <small className="block truncate text-[10px] text-[var(--muted-foreground)]">
                  {user.email}
                </small>
              </div>
              <div className="py-1">
                <a
                  href="/settings/project"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-medium hover:bg-[var(--muted)]"
                >
                  <UserCog size={13} />
                  Pengaturan project
                </a>
                <button
                  onClick={toggle}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-medium hover:bg-[var(--muted)] md:hidden"
                >
                  <Palette size={13} />
                  Ganti tema
                </button>
              </div>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                <LogOut size={13} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

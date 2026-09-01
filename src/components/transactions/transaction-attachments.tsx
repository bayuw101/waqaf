"use client";

import {
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  attachmentViewUrl,
  deleteAttachment,
  uploadAttachment,
} from "@/app/actions/attachments";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function TransactionAttachments({
  transactionId,
  initial,
}: {
  transactionId: string;
  initial: { id: string; name: string; mimeType: string; size: number }[];
}) {
  const [items, setItems] = useState(initial),
    [pending, startTransition] = useTransition(),
    [action, setAction] = useState<string | null>(null),
    [zoom, setZoom] = useState(1),
    [viewer, setViewer] = useState<{
      item: (typeof initial)[number];
      url: string;
    } | null>(null),
    input = useRef<HTMLInputElement>(null),
    { toast } = useToast();
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
  const view = (item: (typeof initial)[number]) =>
    run(`view:${item.id}`, async () => {
      setZoom(1);
      setViewer({ item, url: await attachmentViewUrl(item.id) });
    });
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-bold">
            <Paperclip size={14} /> Nota & lampiran
          </h2>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Klik preview untuk melihat ukuran penuh tanpa download.
          </p>
        </div>
        <Button
          size="sm"
          loading={action === "upload"}
          onClick={() => input.current?.click()}
        >
          <Upload size={13} /> Upload nota
        </Button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            run("upload", async () => {
              const data = new FormData();
              data.set("file", file);
              await uploadAttachment(transactionId, data);
              setItems((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  name: file.name,
                  mimeType: file.type,
                  size: file.size,
                },
              ]);
              toast({ tone: "success", title: "Nota berhasil diunggah" });
            });
            event.target.value = "";
          }}
        />
      </div>
      {items.length > 0 ? (
        <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--accent)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => view(item)}
                className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                {item.mimeType.startsWith("image/") ? (
                  <>
                    <span className="absolute inset-0 bg-[linear-gradient(135deg,var(--brand-soft),var(--muted))]" />
                    <FileText
                      size={30}
                      className="relative text-[var(--brand)]"
                    />
                  </>
                ) : (
                  <div className="text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
                      <FileText size={22} />
                    </span>
                    <b className="mt-2 block text-[11px]">PDF</b>
                  </div>
                )}
                {action === `view:${item.id}` && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                    <Loader2 size={20} className="animate-spin" />
                  </span>
                )}
                <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ExternalLink size={12} />
                </span>
              </button>
              <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[11px]">{item.name}</b>
                  <small className="text-[9px] text-[var(--muted-foreground)]">
                    {(item.size / 1024).toFixed(0)} KB
                  </small>
                </div>
                <button
                  disabled={pending}
                  aria-label="Hapus lampiran"
                  onClick={() =>
                    run(`delete:${item.id}`, async () => {
                      await deleteAttachment(item.id);
                      setItems((current) =>
                        current.filter((value) => value.id !== item.id),
                      );
                      setViewer(null);
                      toast({ tone: "success", title: "Lampiran dihapus" });
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                >
                  {action === `delete:${item.id}` ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <FileText size={19} />
          </span>
          <b className="mt-3 text-[11px]">Belum ada nota</b>
          <p className="text-[9px] text-[var(--muted-foreground)]">
            Upload bukti untuk melengkapi pertanggungjawaban.
          </p>
        </div>
      )}
      <Dialog
        open={!!viewer}
        title={viewer?.item.name || "Preview lampiran"}
        description="Tautan private ini berlaku selama lima menit."
        width="lg"
        onClose={() => setViewer(null)}
      >
        {viewer && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1.5">
            <small className="px-2 text-[9px] text-[var(--muted-foreground)]">
              {viewer.item.mimeType === "application/pdf"
                ? "Gunakan toolbar PDF untuk zoom dan navigasi."
                : "Scroll untuk pan · gunakan kontrol zoom."}
            </small>
            {viewer.item.mimeType !== "application/pdf" && (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() =>
                    setZoom((value) => Math.max(0.5, value - 0.25))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--card)]"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="flex min-w-12 items-center justify-center text-[9px] font-semibold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => setZoom((value) => Math.min(4, value + 0.25))}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--card)]"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Reset zoom"
                  onClick={() => setZoom(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--card)]"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}
          </div>
        )}
        {viewer &&
          (viewer.item.mimeType === "application/pdf" ? (
            <iframe
              src={viewer.url}
              title={viewer.item.name}
              className="h-[70vh] w-full rounded-xl border border-[var(--border)] bg-white"
            />
          ) : (
            <div className="flex h-[68vh] cursor-grab items-start justify-start overflow-auto rounded-xl bg-[var(--muted)] p-4 active:cursor-grabbing">
              <img
                src={viewer.url}
                alt={viewer.item.name}
                draggable={false}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
                className="max-w-none select-none rounded-lg object-contain shadow-lg transition-transform duration-150"
              />
            </div>
          ))}
      </Dialog>
    </section>
  );
}

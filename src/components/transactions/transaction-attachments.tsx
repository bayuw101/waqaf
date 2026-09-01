"use client";

import {
  Download,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  attachmentDownloadUrl,
  deleteAttachment,
  uploadAttachment,
} from "@/app/actions/attachments";
import { Button } from "@/components/ui/button";
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
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-bold">
            <Paperclip size={14} /> Nota & lampiran
          </h2>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            JPEG, PNG, WebP, atau PDF · maksimal 10 MB.
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
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
            <FileText size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[11px]">{item.name}</b>
            <small className="text-[9px] text-[var(--muted-foreground)]">
              {item.mimeType} · {(item.size / 1024).toFixed(0)} KB
            </small>
          </div>
          <button
            disabled={pending}
            aria-label="Download lampiran"
            onClick={() =>
              run(`download:${item.id}`, async () => {
                location.href = await attachmentDownloadUrl(item.id);
              })
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          >
            {action === `download:${item.id}` ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
          </button>
          <button
            disabled={pending}
            aria-label="Hapus lampiran"
            onClick={() =>
              run(`delete:${item.id}`, async () => {
                await deleteAttachment(item.id);
                setItems((current) =>
                  current.filter((value) => value.id !== item.id),
                );
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
      ))}
      {!items.length && (
        <div className="flex min-h-32 flex-col items-center justify-center text-center">
          <FileText size={19} className="text-[var(--muted-foreground)]" />
          <b className="mt-2 text-[11px]">Belum ada nota</b>
          <p className="text-[9px] text-[var(--muted-foreground)]">
            Upload bukti untuk melengkapi pertanggungjawaban.
          </p>
        </div>
      )}
    </section>
  );
}

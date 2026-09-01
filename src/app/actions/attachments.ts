"use server";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, count, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, sql } from "@/db";
import { auditLogs, transactionAttachments, transactions } from "@/db/schema";
import { allowedAttachmentTypes, maxAttachmentSize, r2Config } from "@/lib/r2";
import { projectContext } from "@/lib/projects";

async function context(transactionId: string) {
  const value = await projectContext();
  if (!value.active) redirect("/onboarding");
  const [transaction] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.projectId, value.active.project.id),
      ),
    )
    .limit(1);
  if (!transaction) throw new Error("Transaksi tidak ditemukan");
  return { user: value.user, active: value.active };
}

export async function uploadAttachment(
  transactionId: string,
  formData: FormData,
) {
  const { user, active } = await context(transactionId),
    file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Pilih file nota");
  if (!allowedAttachmentTypes.has(file.type))
    throw new Error("Format nota harus JPEG, PNG, WebP, atau PDF");
  if (file.size <= 0 || file.size > maxAttachmentSize)
    throw new Error("Ukuran file maksimal 10 MB");
  const [{ total }] = await db
    .select({ total: count() })
    .from(transactionAttachments)
    .where(
      and(
        eq(transactionAttachments.transactionId, transactionId),
        isNull(transactionAttachments.deletedAt),
      ),
    );
  if (total >= 10) throw new Error("Maksimal 10 lampiran per transaksi");
  const extension =
    file.name
      .split(".")
      .pop()
      ?.replace(/[^a-z0-9]/gi, "")
      .toLowerCase() || "bin";
  const objectKey = `projects/${active.project.id}/transactions/${transactionId}/${crypto.randomUUID()}.${extension}`;
  const { client, bucket } = r2Config();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "private, no-store",
    }),
  );
  try {
    await sql.transaction((tx) => [
      tx`WITH created AS (
        INSERT INTO transaction_attachments (project_id, transaction_id, object_key, original_name, mime_type, size_bytes, uploaded_by)
        VALUES (${active.project.id}::uuid, ${transactionId}::uuid, ${objectKey}::text, ${file.name}::text, ${file.type}::text, ${file.size}::bigint, ${user.id}::uuid)
        RETURNING id
      )
      INSERT INTO audit_logs (project_id, actor_id, action, object_type, object_id, summary)
      SELECT ${active.project.id}::uuid, ${user.id}::uuid, 'attachment.uploaded', 'attachment', id::text,
        jsonb_build_object('name', ${file.name}::text, 'mimeType', ${file.type}::text, 'size', ${file.size}::bigint) FROM created`,
    ]);
  } catch (error) {
    await client
      .send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }))
      .catch(() => undefined);
    throw error;
  }
  revalidatePath(`/transactions/${transactionId}`);
}

export async function attachmentDownloadUrl(attachmentId: string) {
  const value = await projectContext();
  if (!value.active) redirect("/onboarding");
  const [attachment] = await db
    .select()
    .from(transactionAttachments)
    .where(
      and(
        eq(transactionAttachments.id, attachmentId),
        eq(transactionAttachments.projectId, value.active.project.id),
        isNull(transactionAttachments.deletedAt),
      ),
    )
    .limit(1);
  if (!attachment) throw new Error("Lampiran tidak ditemukan");
  const { client, bucket } = r2Config();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: attachment.objectKey,
      ResponseContentDisposition: `attachment; filename="${attachment.originalName.replace(/["\r\n]/g, "")}"`,
    }),
    { expiresIn: 300 },
  );
}

export async function deleteAttachment(attachmentId: string) {
  const value = await projectContext();
  if (!value.active) redirect("/onboarding");
  const [attachment] = await db
    .update(transactionAttachments)
    .set({ deletedAt: new Date(), deletedBy: value.user.id })
    .where(
      and(
        eq(transactionAttachments.id, attachmentId),
        eq(transactionAttachments.projectId, value.active.project.id),
        isNull(transactionAttachments.deletedAt),
      ),
    )
    .returning();
  if (!attachment) throw new Error("Lampiran tidak ditemukan");
  await db
    .insert(auditLogs)
    .values({
      projectId: value.active.project.id,
      actorId: value.user.id,
      action: "attachment.deleted",
      objectType: "attachment",
      objectId: attachment.id,
      summary: { name: attachment.originalName },
    });
  const { client, bucket } = r2Config();
  void client
    .send(
      new DeleteObjectCommand({ Bucket: bucket, Key: attachment.objectKey }),
    )
    .catch(() => undefined);
  revalidatePath(`/transactions/${attachment.transactionId}`);
}

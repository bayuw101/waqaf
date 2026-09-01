import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { db } from "@/db";
import { transactionAttachments, transactions } from "@/db/schema";
import { projectContext } from "@/lib/projects";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    { active } = await projectContext();
  if (!active) redirect("/onboarding");
  const attachments = await db
    .select({
      id: transactionAttachments.id,
      name: transactionAttachments.originalName,
      mimeType: transactionAttachments.mimeType,
      size: transactionAttachments.sizeBytes,
    })
    .from(transactionAttachments)
    .innerJoin(
      transactions,
      eq(transactionAttachments.transactionId, transactions.id),
    )
    .where(
      and(
        eq(transactionAttachments.transactionId, id),
        eq(transactions.projectId, active.project.id),
        isNull(transactionAttachments.deletedAt),
      ),
    );
  return <TransactionDetail id={id} attachments={attachments} />;
}

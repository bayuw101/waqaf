const sensitiveKeys = new Set([
  "token",
  "tokenHash",
  "session",
  "secret",
  "password",
  "accessToken",
  "refreshToken",
  "objectKey",
]);

export function sanitizeAuditSummary(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !sensitiveKeys.has(key))
      .map(([key, item]) => [
        key,
        typeof item === "string" ? item.slice(0, 300) : item,
      ]),
  );
}

export const auditLabels: Record<string, string> = {
  "project.created": "membuat project",
  "project.updated": "memperbarui project",
  "project.archived": "mengarsipkan project",
  "member.removed": "menghapus anggota",
  "invitation.created": "membuat undangan",
  "invitation.revoked": "membatalkan undangan",
  "invitation.claimed": "menerima undangan",
  "account.created": "membuat rekening",
  "account.updated": "memperbarui rekening",
  "account.adjusted": "menyesuaikan saldo",
  "transaction.created": "mencatat transaksi",
  "transaction.settled": "mencatat penyelesaian",
  "transaction.realized": "mencatat realisasi",
  "transaction.updated": "memperbarui metadata transaksi",
  "transaction.cancelled": "membatalkan transaksi",
};

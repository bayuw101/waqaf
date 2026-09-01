import { S3Client } from "@aws-sdk/client-s3";

const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PRIVATE_BUCKET_NAME",
] as const;
export function r2Config() {
  for (const key of required)
    if (!process.env[key]) throw new Error(`${key} belum dikonfigurasi`);
  return {
    bucket: process.env.R2_PRIVATE_BUCKET_NAME!,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    }),
  };
}

export const allowedAttachmentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
export const maxAttachmentSize = 10 * 1024 * 1024;

import { createHash, randomBytes } from "node:crypto";

export const invitationHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const newInvitationToken = () => randomBytes(32).toString("base64url");

export const invitationExpiry = (now = new Date()) =>
  new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

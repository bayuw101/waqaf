import { describe, expect, it } from "vitest";
import { sanitizeAuditSummary } from "./audit";

describe("audit sanitization", () => {
  it("removes secret-bearing fields", () => {
    expect(
      sanitizeAuditSummary({
        action: "ok",
        token: "secret",
        tokenHash: "hash",
        session: "session",
        objectKey: "private/path",
      }),
    ).toEqual({ action: "ok" });
  });

  it("limits untrusted string length", () => {
    expect(
      (sanitizeAuditSummary({ note: "x".repeat(500) }).note as string).length,
    ).toBe(300);
  });
});

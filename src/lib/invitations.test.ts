import { describe, expect, it } from "vitest";
import {
  invitationExpiry,
  invitationHash,
  newInvitationToken,
} from "./invitations";

describe("invitations", () => {
  it("hashes tokens without storing the bearer value", () => {
    const token = newInvitationToken();
    expect(token).toHaveLength(43);
    expect(invitationHash(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(invitationHash(token)).not.toContain(token);
  });

  it("expires after seven days", () => {
    const now = new Date("2026-08-25T00:00:00.000Z");
    expect(invitationExpiry(now).toISOString()).toBe(
      "2026-09-01T00:00:00.000Z",
    );
  });
});

import { describe, expect, it } from "vitest";
import { nextBalance, reconciliationBalance } from "./ledger";

describe("ledger balance invariants", () => {
  it("rejects negative balances unless enabled", () => {
    expect(() =>
      nextBalance({ currentBalance: 100n, delta: -101n, allowNegative: false }),
    ).toThrow("Saldo rekening tidak mencukupi");
    expect(
      nextBalance({ currentBalance: 100n, delta: -101n, allowNegative: true }),
    ).toBe(-1n);
  });

  it("reconciles opening balance and immutable entries", () => {
    expect(reconciliationBalance(1_000n, [500n, -200n, -100n])).toBe(1_200n);
  });
});

import { describe, expect, it } from "vitest";
import { nextBalance } from "./ledger";

describe("correction direction", () => {
  it("cash-in always increases account balance", () => {
    expect(
      nextBalance({
        currentBalance: 100_000n,
        delta: 200_000n,
        allowNegative: false,
      }),
    ).toBe(300_000n);
  });

  it("cash-out checks available balance", () => {
    expect(() =>
      nextBalance({
        currentBalance: 100_000n,
        delta: -200_000n,
        allowNegative: false,
      }),
    ).toThrow("Saldo rekening tidak mencukupi");
  });
});

import { describe, expect, it } from "vitest";
import {
  effectiveStatus,
  effects,
  familyOf,
  outstandingOf,
  rootOf,
  seedTransactions,
  transactionTypes,
  Transaction,
} from "./finance";
import { formatMoneyInput, parseMoneyInput } from "@/components/ui/money-field";
describe("transaction model", () => {
  it("has five types", () => expect(transactionTypes).toHaveLength(5));
  it("formats IDR input", () => {
    expect(formatMoneyInput(3000000)).toBe("3.000.000");
    expect(parseMoneyInput("3.000.000")).toBe(3000000);
  });
  it("resolves every child to root", () => {
    const child = seedTransactions.find((t) => t.id === "42")!;
    expect(rootOf(seedTransactions, child).id).toBe("44");
    expect(familyOf(seedTransactions, "44").map((t) => t.id)).toContain("42");
  });
  it("calculates partial debt", () => {
    const debt = seedTransactions.find((t) => t.id === "44")!;
    expect(outstandingOf(seedTransactions, debt)).toBe(1000000);
    const payment: Transaction = {
      ...seedTransactions.find((t) => t.id === "42")!,
      id: "new",
      amount: 1000000,
      cashEffect: -1000000,
    };
    const list = [payment, ...seedTransactions];
    expect(effectiveStatus(list, debt)).toBe("closed");
  });
  it("does not double count settlement", () => {
    expect(effects("cash_in", 500000, "realization_return").incomeEffect).toBe(
      0,
    );
    expect(
      effects("cash_out", 500000, "debt_payment", "realized").expenseEffect,
    ).toBe(0);
  });
});

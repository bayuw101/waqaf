export type BalancePolicy = {
  currentBalance: bigint;
  delta: bigint;
  allowNegative: boolean;
};

export function nextBalance({
  currentBalance,
  delta,
  allowNegative,
}: BalancePolicy) {
  const next = currentBalance + delta;
  if (!allowNegative && next < 0n)
    throw new Error("Saldo rekening tidak mencukupi");
  return next;
}

export function reconciliationBalance(
  openingBalance: bigint,
  entries: bigint[],
) {
  return entries.reduce((balance, amount) => balance + amount, openingBalance);
}

export function parseIdr(value: FormDataEntryValue | null) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? BigInt(digits) : 0n;
}

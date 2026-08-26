export const transactionTypes = [
  "cash_in",
  "cash_out",
  "transfer",
  "debt",
  "receivable",
] as const;
export type TransactionType = (typeof transactionTypes)[number];
export type TransactionStatus = "open" | "closed";
export type RealizationStatus = "not_required" | "pending" | "realized";
export type RelationKind =
  | "realization_return"
  | "realization_shortfall"
  | "realization_contribution"
  | "debt_payment"
  | "receivable_payment"
  | "settlement_adjustment"
  | "correction";
export type Transaction = {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  party: string;
  responsible: string;
  category: string;
  amount: number;
  account?: string;
  destinationAccount?: string;
  cashEffect: number;
  incomeEffect: number;
  expenseEffect: number;
  status: TransactionStatus;
  realizationStatus: RealizationStatus;
  realizedAmount?: number;
  parentId?: string;
  relationKind?: RelationKind;
  ref: string;
  due?: string;
  note?: string;
  cancelled?: boolean;
};
export const rupiah = (n: number) =>
  `${n < 0 ? "-" : ""}Rp${Math.abs(n).toLocaleString("id-ID")}`;
export const childrenOf = (transactions: Transaction[], id: string) =>
  transactions.filter((t) => t.parentId === id);
export function rootOf(transactions: Transaction[], transaction: Transaction) {
  let current = transaction,
    seen = new Set<string>();
  while (current.parentId && !seen.has(current.id)) {
    seen.add(current.id);
    const parent = transactions.find((t) => t.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}
export function familyOf(transactions: Transaction[], rootId: string) {
  const result: Transaction[] = [];
  const visit = (id: string) =>
    childrenOf(transactions, id).forEach((child) => {
      result.push(child);
      visit(child.id);
    });
  const root = transactions.find((t) => t.id === rootId);
  if (root) result.push(root);
  visit(rootId);
  return result;
}
export function outstandingOf(
  transactions: Transaction[],
  parent: Transaction,
) {
  const children = childrenOf(transactions, parent.id);
  const adjustments = children
    .filter((t) => t.relationKind === "settlement_adjustment")
    .reduce((n, t) => n + t.amount, 0);
  if (parent.type === "debt")
    return Math.max(
      0,
      parent.amount -
        children
          .filter((t) => t.relationKind === "debt_payment")
          .reduce((n, t) => n + t.amount, 0) -
        adjustments,
    );
  if (parent.type === "receivable")
    return Math.max(
      0,
      parent.amount -
        children
          .filter((t) => t.relationKind === "receivable_payment")
          .reduce((n, t) => n + t.amount, 0) -
        adjustments,
    );
  if (
    parent.type === "cash_out" &&
    parent.realizationStatus === "realized" &&
    parent.realizedAmount !== undefined
  ) {
    const difference = parent.realizedAmount - parent.amount;
    if (difference < 0)
      return Math.max(
        0,
        -difference -
          children
            .filter((t) => t.relationKind === "realization_return")
            .reduce((n, t) => n + t.amount, 0),
      );
    if (difference > 0)
      return Math.max(
        0,
        difference -
          children
            .filter((t) => t.relationKind === "realization_shortfall")
            .reduce((n, t) => n + t.amount, 0),
      );
  }
  return parent.status === "open" ? parent.amount : 0;
}
export function effectiveStatus(
  transactions: Transaction[],
  parent: Transaction,
): TransactionStatus {
  if (parent.cancelled) return "closed";
  if (parent.type === "cash_out" && parent.realizationStatus === "pending")
    return "open";
  if (
    ["debt", "receivable"].includes(parent.type) ||
    parent.realizedAmount !== undefined
  )
    return outstandingOf(transactions, parent) === 0 ? "closed" : "open";
  return parent.status;
}
export function effects(
  type: TransactionType,
  amount: number,
  relation?: RelationKind,
  realization: RealizationStatus = "not_required",
) {
  if (type === "transfer" || type === "debt" || type === "receivable")
    return { cashEffect: 0, incomeEffect: 0, expenseEffect: 0 };
  if (type === "cash_in")
    return {
      cashEffect: amount,
      incomeEffect:
        relation === "realization_return" || relation === "receivable_payment"
          ? 0
          : amount,
      expenseEffect: 0,
    };
  return {
    cashEffect: -amount,
    incomeEffect: 0,
    expenseEffect:
      relation === "realization_shortfall" ||
      relation === "debt_payment" ||
      realization === "pending"
        ? 0
        : amount,
  };
}
export const seedTransactions: Transaction[] = [
  {
    id: "48",
    type: "cash_in",
    date: "2026-08-19",
    description: "Donasi Jumat",
    party: "Hamba Allah",
    responsible: "Bayu",
    category: "Donasi",
    account: "Bank Operasional",
    amount: 2500000,
    status: "closed",
    realizationStatus: "not_required",
    ref: "REF-108",
    ...effects("cash_in", 2500000),
  },
  {
    id: "47",
    type: "cash_out",
    date: "2026-08-19",
    description: "Konsumsi rapat",
    party: "Warung Sejahtera",
    responsible: "Bayu",
    category: "Konsumsi",
    account: "Kas Proyek",
    amount: 450000,
    status: "closed",
    realizationStatus: "realized",
    realizedAmount: 450000,
    ref: "KWT-018",
    ...effects("cash_out", 450000),
  },
  {
    id: "46",
    type: "transfer",
    date: "2026-08-17",
    description: "Bank Operasional ke Kas Proyek",
    party: "Transfer internal",
    responsible: "Bayu",
    category: "Transfer",
    account: "Bank Operasional",
    destinationAccount: "Kas Proyek",
    amount: 1000000,
    status: "closed",
    realizationStatus: "not_required",
    ref: "TRF-046",
    ...effects("transfer", 1000000),
  },
  {
    id: "45",
    type: "cash_out",
    date: "2026-08-15",
    description: "Panjar renovasi aula",
    party: "Andi Pratama",
    responsible: "Andi Pratama",
    category: "Renovasi",
    account: "Kas Proyek",
    amount: 3000000,
    status: "open",
    realizationStatus: "pending",
    ref: "KWT-019",
    ...effects("cash_out", 3000000, undefined, "pending"),
  },
  {
    id: "44",
    type: "debt",
    date: "2026-08-14",
    description: "Sewa tenda kegiatan",
    party: "CV Tenda Jaya",
    responsible: "Bayu",
    category: "Kegiatan",
    amount: 1800000,
    status: "open",
    realizationStatus: "not_required",
    ref: "UTG-014",
    due: "2026-08-31",
    ...effects("debt", 1800000),
  },
  {
    id: "43",
    type: "receivable",
    date: "2026-08-12",
    description: "Iuran mitra kegiatan",
    party: "Komunitas Tetangga",
    responsible: "Siti Rahma",
    category: "Iuran",
    amount: 1250000,
    status: "open",
    realizationStatus: "not_required",
    ref: "PTG-009",
    due: "2026-08-29",
    ...effects("receivable", 1250000),
  },
  {
    id: "42",
    type: "cash_out",
    date: "2026-08-20",
    description: "Pembayaran sebagian sewa tenda",
    party: "CV Tenda Jaya",
    responsible: "Bayu",
    category: "Kegiatan",
    account: "Bank Operasional",
    amount: 800000,
    status: "closed",
    realizationStatus: "realized",
    realizedAmount: 800000,
    parentId: "44",
    relationKind: "debt_payment",
    ref: "UTG-014-1",
    ...effects("cash_out", 800000, "debt_payment", "realized"),
  },
];

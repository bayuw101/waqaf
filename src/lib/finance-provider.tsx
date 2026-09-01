"use client";
import { createContext, useContext, useState } from "react";
import {
  RelationKind,
  Transaction,
  childrenOf,
  effectiveStatus,
  effects,
  familyOf,
  outstandingOf,
  rootOf,
  seedTransactions,
} from "./finance";
type NewTransaction = Omit<Transaction, "id">;
const projectUsers = [
  "Bayu",
  "Andi Pratama",
  "Siti Rahma",
  "Maya Sari",
  "Raka Putra",
];
type Context = {
  transactions: Transaction[];
  accountNames: string[];
  accounts: { name: string; balance: number }[];
  responsibleNames: string[];
  addResponsibleName: (name: string) => void;
  addTransaction: (t: NewTransaction, persistedId?: string) => string;
  recordRealization: (
    id: string,
    amount: number,
    complete: boolean,
    reason?: string,
    contribution?: {
      party: string;
      responsible: string;
      mode: "contribution" | "reimburse" | "return";
      account?: string;
    },
  ) => void;
  payDebt: (
    id: string,
    amount: number,
    account: string,
    responsible: string,
    complete: boolean,
  ) => void;
  receiveReceivable: (
    id: string,
    amount: number,
    account: string,
    responsible: string,
    complete: boolean,
  ) => void;
  childrenOf: (id: string) => Transaction[];
  familyOf: (id: string) => Transaction[];
  canonicalId: (id: string) => string;
  outstandingOf: (id: string) => number;
  statusOf: (id: string) => "open" | "closed";
  cancel: (id: string, reason: string) => void;
  updateMetadata: (
    id: string,
    data: Partial<
      Pick<Transaction, "description" | "party" | "category" | "ref" | "due">
    >,
  ) => void;
};
const FinanceContext = createContext<Context | null>(null);
export function FinanceProvider({
  children,
  initialTransactions = seedTransactions,
  accountNames = [],
  accounts = [],
}: {
  children: React.ReactNode;
  initialTransactions?: Transaction[];
  accountNames?: string[];
  accounts?: { name: string; balance: number }[];
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [customResponsible, setCustomResponsible] = useState<string[]>([]);
  const get = (id: string, list = transactions) =>
    list.find((t) => t.id === id)!;
  function addTransaction(t: NewTransaction, persistedId?: string) {
    const id = persistedId || crypto.randomUUID();
    setTransactions((x) => [{ ...t, id }, ...x]);
    return id;
  }
  function adjustment(
    parent: Transaction,
    amount: number,
    reason: string,
  ): Transaction {
    return {
      id: crypto.randomUUID(),
      type: parent.type,
      date: "2026-08-25",
      description: `Penyesuaian ${parent.description}`,
      party: parent.party,
      responsible: parent.responsible,
      category: parent.category,
      amount,
      status: "closed",
      realizationStatus: "not_required",
      parentId: parent.id,
      relationKind: "settlement_adjustment",
      ref: `${parent.ref}-ADJ`,
      note: reason,
      cashEffect: 0,
      incomeEffect: 0,
      expenseEffect: 0,
    };
  }
  function recordRealization(
    id: string,
    amount: number,
    complete: boolean,
    reason?: string,
    contribution?: {
      party: string;
      responsible: string;
      mode: "contribution" | "reimburse" | "return";
      account?: string;
    },
  ) {
    setTransactions((list) => {
      const parent = get(id, list),
        difference = Math.abs(amount - parent.amount),
        needsReason = complete && difference > 0;
      if (needsReason && !contribution)
        throw new Error("Penyelesaian selisih wajib dipilih");
      if (needsReason && !reason)
        throw new Error("Alasan penyesuaian wajib diisi");
      const updated = list.map((t) =>
        t.id === id
          ? {
              ...t,
              realizationStatus: "realized" as const,
              realizedAmount: amount,
              expenseEffect: amount,
              status: complete ? ("closed" as const) : ("open" as const),
            }
          : t,
      );
      if (!needsReason) return updated;
      const contributionEntry: Transaction = {
        id: crypto.randomUUID(),
        type: contribution!.mode === "contribution" ? "cash_in" : "cash_out",
        date: parent.date,
        description: `${contribution!.mode === "contribution" ? "Kontribusi PJ" : "Reimburse PJ"} ${parent.description}`,
        party: contribution!.party,
        responsible: contribution!.responsible,
        category: parent.category,
        account: contribution!.account,
        amount: difference,
        status: "closed",
        realizationStatus: "not_required",
        parentId: parent.id,
        relationKind:
          contribution!.mode === "contribution"
            ? "realization_contribution"
            : "realization_shortfall",
        ref: `${parent.ref}-${contribution!.mode === "contribution" ? "CONTRIB" : "REIMBURSE"}`,
        note: reason,
        ...effects(
          contribution!.mode === "contribution" ||
            contribution!.mode === "return"
            ? "cash_in"
            : "cash_out",
          difference,
          contribution!.mode === "contribution"
            ? "realization_contribution"
            : contribution!.mode === "return"
              ? "realization_return"
              : "realization_shortfall",
        ),
      };
      return [contributionEntry, ...updated];
    });
  }
  function settle(
    id: string,
    amount: number,
    account: string,
    responsible: string,
    complete: boolean,
    debt: boolean,
  ) {
    setTransactions((list) => {
      const parent = get(id, list),
        out = outstandingOf(list, parent);
      if (amount <= 0 || amount > out) throw new Error("Nominal melebihi sisa");
      const type = debt ? "cash_out" : "cash_in",
        kind: RelationKind = debt ? "debt_payment" : "receivable_payment",
        child: Transaction = {
          id: crypto.randomUUID(),
          type,
          date: "2026-08-25",
          description: `${debt ? "Pembayaran" : "Penerimaan"} ${parent.description}`,
          party: parent.party,
          responsible: responsible || parent.responsible,
          category: parent.category,
          account,
          amount,
          status: complete ? (amount === out ? "closed" : "open") : "open",
          realizationStatus: debt ? "realized" : "not_required",
          realizedAmount: debt ? amount : undefined,
          parentId: id,
          relationKind: kind,
          ref: `${parent.ref}-${childrenOf(list, id).length + 1}`,
          ...effects(type, amount, kind, "realized"),
        },
        next = [child, ...list];
      return next.map((t) =>
        t.id === id
          ? { ...t, status: outstandingOf(next, t) === 0 ? "closed" : "open" }
          : t,
      );
    });
  }
  const responsibleNames = Array.from(
    new Map(
      [
        ...projectUsers,
        ...transactions.flatMap((t) => [t.responsible, t.party]),
        ...customResponsible,
      ]
        .filter(Boolean)
        .map((name) => [name.trim().toLocaleLowerCase("id"), name.trim()]),
    ).values(),
  );
  const addResponsibleName = (name: string) =>
    setCustomResponsible((list) =>
      responsibleNames.some(
        (x) =>
          x.toLocaleLowerCase("id") === name.trim().toLocaleLowerCase("id"),
      )
        ? list
        : [...list, name.trim()],
    );
  const value: Context = {
    transactions,
    accountNames,
    accounts,
    responsibleNames,
    addResponsibleName,
    addTransaction,
    recordRealization,
    payDebt: (id, a, account, responsible, complete) =>
      settle(id, a, account, responsible, complete, true),
    receiveReceivable: (id, a, account, responsible, complete) =>
      settle(id, a, account, responsible, complete, false),
    childrenOf: (id) => childrenOf(transactions, id),
    familyOf: (id) => familyOf(transactions, rootOf(transactions, get(id)).id),
    canonicalId: (id) => rootOf(transactions, get(id)).id,
    outstandingOf: (id) => outstandingOf(transactions, get(id)),
    statusOf: (id) => effectiveStatus(transactions, get(id)),
    cancel: (id, reason) =>
      setTransactions((list) =>
        list.map((t) =>
          t.id === id
            ? { ...t, cancelled: true, note: reason, status: "closed" }
            : t,
        ),
      ),
    updateMetadata: (id, data) =>
      setTransactions((list) =>
        list.map((t) => (t.id === id ? { ...t, ...data } : t)),
      ),
  };
  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}
export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) throw new Error("useFinance requires FinanceProvider");
  return value;
}

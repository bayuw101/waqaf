"use client";
import { createContext, useContext, useState } from "react";
import { useFinance } from "@/lib/finance-provider";
import { TransactionFollowUpSheet } from "./transaction-follow-up-sheet";
const Context = createContext<{ openFollowUp: (id: string) => void } | null>(
  null,
);
export const useTransactionFollowUp = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useTransactionFollowUp requires provider");
  return value;
};
export function TransactionFollowUpProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [id, setId] = useState<string | null>(null),
    finance = useFinance(),
    transaction = id
      ? finance.transactions.find((t) => t.id === finance.canonicalId(id))
      : undefined;
  return (
    <Context.Provider value={{ openFollowUp: setId }}>
      {children}
      {transaction && (
        <TransactionFollowUpSheet
          key={transaction.id}
          transaction={transaction}
          open
          onClose={() => setId(null)}
        />
      )}
    </Context.Provider>
  );
}

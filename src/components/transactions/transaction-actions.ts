import {
  BadgeDollarSign,
  CheckCheck,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { Transaction } from "@/lib/finance";
export function followUpAction(
  transaction: Transaction,
): { label: string; Icon: LucideIcon } | null {
  if (transaction.realizationStatus === "pending")
    return { label: "Catat realisasi", Icon: CheckCheck };
  if (transaction.type === "debt")
    return { label: "Catat pembayaran", Icon: BadgeDollarSign };
  if (transaction.type === "receivable")
    return { label: "Catat penerimaan", Icon: HandCoins };
  return null;
}

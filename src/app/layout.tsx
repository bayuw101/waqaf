import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/use-theme";
import { FinanceProvider } from "@/lib/finance-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "AmanahKas",
  description: "Pencatatan dan transparansi keuangan",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <FinanceProvider>
              <AppShell>{children}</AppShell>
            </FinanceProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

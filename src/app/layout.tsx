import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/use-theme";
import { FinanceProvider } from "@/lib/finance-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";
import { projectContext } from "@/lib/projects";
import { PageTransitionLoader } from "@/components/layout/page-transition-loader";

export const metadata: Metadata = {
  title: "AmanahKas",
  description: "Pencatatan dan transparansi keuangan",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAuthenticated = !!session?.user?.email;
  const context = isAuthenticated
    ? await projectContext().catch(() => null)
    : null;
  const content = context ? (
    <AppShell
      user={{
        name: context.user.name || context.user.email,
        email: context.user.email,
      }}
      activeProject={context.active.project.id}
      projects={context.memberships.map(({ project }) => ({
        id: project.id,
        name: project.name,
      }))}
    >
      {children}
    </AppShell>
  ) : (
    children
  );
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <PageTransitionLoader />
        <ThemeProvider>
          <ToastProvider>
            <FinanceProvider>{content}</FinanceProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

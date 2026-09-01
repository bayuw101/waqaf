import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageTransitionLoader } from "@/components/layout/page-transition-loader";
import { projectContext } from "@/lib/projects";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://waqaf.web.id"),
  title: {
    default: "WAQAF — Pencatatan Keuangan Organisasi",
    template: "%s · WAQAF",
  },
  description:
    "Pencatatan, pertanggungjawaban, dan transparansi keuangan untuk organisasi dan project sosial.",
  applicationName: "WAQAF",
  openGraph: {
    title: "WAQAF — Pencatatan Keuangan Organisasi",
    description:
      "Kelola kas, transaksi, anggota, dan laporan project secara kolaboratif dan transparan.",
    url: "https://waqaf.web.id",
    siteName: "WAQAF",
    type: "website",
    locale: "id_ID",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAuthenticated = !!session?.user?.email;
  if (isAuthenticated) {
    const context = await projectContext();
    if (!context.active) redirect("/onboarding");
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <PageTransitionLoader />
        {children}
      </body>
    </html>
  );
}

import { Landmark, ShieldCheck } from "lucide-react";
import { signInWithGoogle } from "./actions";

const errorCopy: Record<string, string> = {
  AccessDenied: "Akun Google ini tidak diizinkan masuk.",
  Configuration: "Konfigurasi login belum lengkap. Hubungi pengelola aplikasi.",
  Verification: "Tautan login sudah tidak berlaku. Silakan coba kembali.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invitation?: string }>;
}) {
  const { error, invitation } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--shell)] p-4">
      <section className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <Landmark size={21} />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          Masuk ke AmanahKas
        </h1>
        <p className="mt-1 text-[12px] leading-5 text-[var(--muted-foreground)]">
          Kelola dana dan pertanggungjawaban project bersama tim Anda.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[11px] text-[var(--danger)]"
          >
            {errorCopy[error] || "Login gagal. Silakan coba kembali."}
          </div>
        )}

        <form action={signInWithGoogle.bind(null, invitation)} className="mt-6">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[12px] font-semibold text-[var(--primary-foreground)] transition-transform active:scale-[0.98]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
              G
            </span>
            Lanjutkan dengan Google
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 border-t border-[var(--border)] pt-4 text-[10px] leading-4 text-[var(--muted-foreground)]">
          <ShieldCheck
            size={14}
            className="mt-0.5 shrink-0 text-[var(--success)]"
          />
          AmanahKas hanya menggunakan Google untuk autentikasi. Kami tidak
          menyimpan password Anda.
        </div>
      </section>
    </main>
  );
}

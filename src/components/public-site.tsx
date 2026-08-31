import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CircleDollarSign,
  Files,
  FolderKanban,
  ShieldCheck,
  Users,
} from "lucide-react";

export function PublicHeader() {
  return (
    <header className="relative z-20 flex h-[60px] shrink-0 items-center gap-3 bg-[var(--shell)] px-3 text-[var(--shell-foreground)] md:px-5">
      <a
        href="/"
        className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--shell-hover)]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[13px] font-black text-black">
          W
        </span>
        <span className="text-[17px] font-black tracking-[0.18em]">WAQAF</span>
      </a>
      <nav className="ml-auto hidden items-center gap-1 sm:flex">
        <a
          href="/#fitur"
          className="rounded-lg px-3 py-2 text-[11px] font-semibold text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-white"
        >
          Fitur
        </a>
        <a
          href="/#keamanan"
          className="rounded-lg px-3 py-2 text-[11px] font-semibold text-[var(--shell-muted)] hover:bg-[var(--shell-hover)] hover:text-white"
        >
          Keamanan
        </a>
      </nav>
      <a
        href="/login"
        className="group ml-2 flex h-10 items-center gap-2 rounded-xl bg-white py-1 pl-4 pr-1 text-[11px] font-bold text-black active:scale-[0.98]"
      >
        Masuk
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-black text-white">
          <ArrowRight size={14} />
        </span>
      </a>
    </header>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[var(--shell)]">
      <div className="flex h-screen flex-col p-2 pt-0 md:p-2.5 md:pt-0">
        <PublicHeader />
        <main className="mt-1 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/70 bg-[var(--background)] shadow-[0_-6px_24px_rgba(0,0,0,.14),0_20px_60px_rgba(0,0,0,.18)] ring-1 ring-black/10 md:mt-1.5 md:rounded-xl">
          {children}
          <PublicFooter />
        </main>
      </div>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center">
        <div className="flex-1">
          <b className="text-[14px] tracking-[0.16em]">WAQAF</b>
          <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
            Pencatatan dan transparansi keuangan organisasi.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] font-semibold">
          <a href="/privacy" className="hover:text-[var(--brand)]">
            Kebijakan Privasi
          </a>
          <a href="/terms" className="hover:text-[var(--brand)]">
            Ketentuan Layanan
          </a>
          <a
            href="mailto:admin@waqaf.web.id"
            className="hover:text-[var(--brand)]"
          >
            Kontak
          </a>
        </div>
        <small className="text-[9px] text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} WAQAF
        </small>
      </div>
    </footer>
  );
}

const features = [
  {
    icon: FolderKanban,
    title: "Multi-project",
    text: "Pisahkan pencatatan, rekening, anggota, dan laporan setiap kegiatan.",
  },
  {
    icon: CircleDollarSign,
    title: "Kas yang dapat ditelusuri",
    text: "Catat kas masuk, kas keluar, utang, piutang, transfer, dan realisasi.",
  },
  {
    icon: Users,
    title: "Kolaborasi",
    text: "Owner mengundang anggota melalui tautan aman yang hanya berlaku satu kali.",
  },
  {
    icon: BarChart3,
    title: "Laporan transparan",
    text: "Pantau saldo, arus kas, pendapatan, biaya, dan histori terkait.",
  },
  {
    icon: Files,
    title: "Bukti transaksi",
    text: "Lampirkan nota dan dokumen pendukung pada setiap transaksi.",
  },
  {
    icon: BookOpenCheck,
    title: "Audit trail",
    text: "Perubahan penting memiliki pelaku, waktu, dan konteks yang jelas.",
  },
];

export function HomePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl" />
        <div className="relative mx-auto grid min-h-[68vh] max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.2fr_.8fr] md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)] shadow-sm">
              <ShieldCheck size={13} className="text-[var(--brand)]" /> Keuangan
              organisasi yang dapat dipercaya
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.94] tracking-[-.04em] sm:text-6xl md:text-7xl">
              Kelola dana dengan{" "}
              <span className="text-[var(--brand)]">amanah.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--muted-foreground)]">
              WAQAF membantu komunitas, yayasan, rumah ibadah, kepanitiaan, dan
              project sosial mencatat keuangan secara kolaboratif, rapi, dan
              transparan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/login"
                className="group inline-flex h-11 items-center gap-3 rounded-xl bg-[var(--primary)] py-1 pl-5 pr-1 text-[12px] font-semibold text-[var(--primary-foreground)] shadow-sm active:scale-[0.98]"
              >
                Mulai dengan Google
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-foreground)] text-[var(--primary)]">
                  <ArrowRight size={16} />
                </span>
              </a>
              <a
                href="#fitur"
                className="inline-flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 text-[12px] font-semibold shadow-sm hover:bg-[var(--muted)]"
              >
                Pelajari fitur
              </a>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--muted-foreground)]">
                Prinsip WAQAF
              </p>
              <b className="mt-3 block text-3xl">
                Satu histori.
                <br />
                Banyak pihak.
                <br />
                Tetap jelas.
              </b>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--primary)] p-5 text-[var(--primary-foreground)]">
                <b className="text-3xl">IDR</b>
                <p className="mt-1 text-[10px] opacity-70">
                  Pencatatan rupiah utuh
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--brand-soft)] p-5 text-[var(--brand)]">
                <b className="text-3xl">24/7</b>
                <p className="mt-1 text-[10px]">Akses informasi project</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="fitur"
        className="border-y border-[var(--border)] bg-[var(--muted)]/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[var(--brand)]">
            Fitur utama
          </p>
          <h2 className="mt-2 max-w-xl text-3xl font-black">
            Dari transaksi awal sampai pertanggungjawaban.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon size={17} />
                </span>
                <h3 className="mt-5 text-[14px] font-bold">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[var(--muted-foreground)]">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="keamanan">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[var(--brand)]">
              Privasi & keamanan
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Data project hanya untuk anggota yang berwenang.
            </h2>
          </div>
          <div className="space-y-3 text-[12px] leading-6 text-[var(--muted-foreground)]">
            <p>
              WAQAF menggunakan Google OAuth untuk autentikasi. Kami tidak
              menerima atau menyimpan password Google Anda.
            </p>
            <p>
              Setiap akses data diverifikasi terhadap keanggotaan project.
              Undangan bersifat sekali pakai dan memiliki masa berlaku terbatas.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="/privacy" className="font-semibold text-[var(--brand)]">
                Baca Kebijakan Privasi →
              </a>
              <a href="/terms" className="font-semibold text-[var(--brand)]">
                Ketentuan Layanan →
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

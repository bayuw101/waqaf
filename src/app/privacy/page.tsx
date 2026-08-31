import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="31 Agustus 2026">
      <section>
        <h2>1. Tentang WAQAF</h2>
        <p>
          WAQAF adalah layanan pencatatan dan transparansi keuangan organisasi
          yang tersedia melalui <a href="https://waqaf.web.id">waqaf.web.id</a>.
          Kebijakan ini menjelaskan data yang kami proses ketika Anda
          menggunakan layanan.
        </p>
      </section>
      <section>
        <h2>2. Data yang kami kumpulkan</h2>
        <ul>
          <li>
            Nama, alamat email, foto profil, dan identitas akun yang diberikan
            Google saat Anda login.
          </li>
          <li>
            Project, keanggotaan, rekening, transaksi, kategori, pihak terkait,
            penanggung jawab, dan catatan yang Anda masukkan.
          </li>
          <li>
            Metadata teknis yang diperlukan untuk keamanan, sesi login, audit,
            dan pengoperasian layanan.
          </li>
          <li>
            Lampiran transaksi atau logo project apabila fitur unggah digunakan.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Penggunaan data</h2>
        <p>
          Data digunakan untuk mengautentikasi pengguna, menyediakan fungsi
          pencatatan keuangan, memverifikasi hak akses project, menjaga audit
          trail, mencegah penyalahgunaan, dan memperbaiki layanan.
        </p>
      </section>
      <section>
        <h2>4. Google OAuth</h2>
        <p>
          WAQAF menggunakan Google OAuth untuk login dan hanya meminta informasi
          profil dasar: nama, email, foto profil, serta identitas akun. WAQAF
          tidak menerima atau menyimpan password Google Anda dan tidak mengakses
          Gmail, Drive, Calendar, atau kontak Anda.
        </p>
      </section>
      <section>
        <h2>5. Penyimpanan dan pihak pemroses</h2>
        <p>
          Data aplikasi dapat diproses oleh penyedia infrastruktur yang
          diperlukan, termasuk Vercel untuk hosting, Neon untuk PostgreSQL,
          Google untuk autentikasi, dan Cloudflare R2 untuk penyimpanan file
          ketika fitur tersebut tersedia. Data tidak dijual kepada pihak ketiga.
        </p>
      </section>
      <section>
        <h2>6. Berbagi dan akses project</h2>
        <p>
          Data project dapat dilihat oleh owner dan anggota project yang
          diundang. Owner bertanggung jawab atas pemberian serta pencabutan
          akses anggota. Tautan undangan adalah bearer link sekali pakai; jangan
          membagikannya kepada pihak yang tidak dituju.
        </p>
      </section>
      <section>
        <h2>7. Retensi dan penghapusan</h2>
        <p>
          Data dipertahankan selama project atau akun masih diperlukan untuk
          menyediakan layanan dan memenuhi integritas histori keuangan.
          Transaksi finansial dapat dibatalkan atau dikoreksi tanpa menghapus
          audit trail. Permintaan akses, koreksi data profil, atau penghapusan
          akun dapat dikirim melalui kontak di bawah.
        </p>
      </section>
      <section>
        <h2>8. Keamanan</h2>
        <p>
          Kami menerapkan session cookie yang aman, pemeriksaan keanggotaan
          project, invitation token yang di-hash, dan pembatasan akses berbasis
          peran. Tidak ada sistem yang sepenuhnya bebas risiko; pengguna wajib
          menjaga keamanan akun Google dan tautan undangannya.
        </p>
      </section>
      <section>
        <h2>9. Hak dan kontak</h2>
        <p>
          Untuk pertanyaan privasi, akses data, koreksi, atau penghapusan akun,
          hubungi <a href="mailto:privacy@waqaf.web.id">privacy@waqaf.web.id</a>
          .
        </p>
      </section>
      <section>
        <h2>10. Perubahan kebijakan</h2>
        <p>
          Kebijakan ini dapat diperbarui untuk mencerminkan perubahan layanan
          atau ketentuan hukum. Tanggal pembaruan terbaru ditampilkan di bagian
          atas halaman.
        </p>
      </section>
    </LegalPage>
  );
}

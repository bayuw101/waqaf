# Product Requirements Document — AmanahKas

> Platform pencatatan dan transparansi keuangan untuk organisasi dan proyek

| Metadata | Nilai |
|---|---|
| Versi | 1.0 — Draft produk |
| Tanggal dokumen sumber | 19 Agustus 2026 |
| Status | Scope MVP disepakati untuk validasi desain dan teknis |
| Audiens | Product, Design, Engineering, QA, dan pemilik produk |
| Sumber | Konversi dan audit dari `PRD.docx` |

## Keputusan produk utama

AmanahKas memungkinkan beberapa bendahara mengelola kas organisasi maupun proyek, dengan akses yang dapat dibatasi per proyek atau rekening. Transaksi langsung tercatat tanpa approval, tetap memiliki audit trail, dan dapat dipublikasikan per transaksi tanpa membuka data sensitif.

---

## Audit PRD

Audit ini memisahkan masalah spesifikasi dari requirement sumber. Rekomendasi belum dianggap sebagai keputusan produk sampai disetujui.

### Temuan kritis — blokir implementasi

| ID | Temuan | Dampak | Rekomendasi perubahan |
|---|---|---|---|
| A-01 | **Model workspace dan kepemilikan data ambigu.** Bagian 5 menyatakan organisasi memiliki proyek dan organisasi/proyek memiliki rekening. Bagian 18 menyatakan satu workspace mendukung organisasi dengan proyek maupun proyek mandiri. Tidak jelas apakah workspace adalah tenant, apakah satu workspace dapat memiliki lebih dari satu organisasi, dan bagaimana transaksi milik organisasi tanpa proyek direpresentasikan. | Skema database, tenant isolation, URL, authorization, dan agregasi saldo tidak dapat ditetapkan konsisten. | Tetapkan kardinalitas eksplisit. Rekomendasi: `Workspace 1—0..1 Organization`, `Workspace 1—0..n Project`, proyek mandiri memiliki `organization_id = null`, rekening memiliki tepat satu owner (`organization_id` XOR `project_id`), dan transaksi mewarisi workspace dari rekening. |
| A-02 | **Semantik scope akses belum terdefinisi.** Bagian 5 menyebut akses organisasi, proyek, rekening, atau kombinasi; wireframe menyatakan pembatasan proyek dan rekening menggunakan intersection. Bagian 4 menyebut akses efektif sebagai “gabungan scope”, yang dapat diartikan union. | Pengguna dapat menerima akses berlebih atau ditolak secara tidak konsisten; ini adalah risiko kebocoran finansial. | Ganti dengan algoritme deny-by-default: role memberi capability, grant proyek membatasi proyek, grant rekening membatasi rekening; jika keduanya ada maka gunakan intersection. Definisikan perilaku ketika salah satu daftar kosong dan tambahkan matrix test. |
| A-03 | **Hak pemilik organisasi kontradiktif.** Matriks bagian 11 memberi pemilik kemampuan melihat laporan privat, tetapi bagian 4 dan pertanyaan 18.2 menyatakan pemilik belum tentu dapat mengubah transaksi dan belum diputuskan apakah selalu dapat melihat seluruh transaksi. | Authorization policy dan acceptance test tidak dapat difinalkan. | Putuskan terpisah antara read dan mutate. Rekomendasi least privilege: owner dapat mengatur membership tetapi akses data finansial tetap memerlukan capability eksplisit; akun bootstrap owner mendapat grant awal yang dapat dicabut hanya setelah ada administrator lain. |
| A-04 | **Ledger disebut immutable tetapi edit langsung diperbolehkan.** Bagian 7 mengizinkan edit transaksi belum direkonsiliasi dengan audit trail; mitigasi risiko bagian 17 menyebut “ledger immutable”. Tidak dijelaskan apakah edit mengubah ledger entry lama, membuat versi, atau reversal/replacement. | Saldo dapat tidak dapat direproduksi dan histori finansial dapat berubah diam-diam. | Tetapkan model: `Transaction` dapat memiliki revisi metadata, tetapi dampak saldo tidak pernah di-update/delete. Koreksi finansial selalu membuat reversal dan replacement tertaut dalam satu database transaction. Jika edit finansial langsung tetap diizinkan, hapus klaim immutable dan definisikan versioning serta recalculation. |
| A-05 | **Definisi rekonsiliasi belum ada meskipun mengontrol koreksi.** Bagian 7 dan BR-05 bergantung pada status rekonsiliasi, sedangkan bagian 18.2 masih menandainya sebagai keputusan terbuka. | Alur edit/cancel, status transaksi, UI, dan acceptance test utama tidak dapat dibangun. | Definisikan siapa yang dapat merekonsiliasi, objek/periode yang direkonsiliasi, timestamp/aktor, cara membuka kembali, dan efeknya pada koreksi. Jika tidak masuk MVP, hapus rekonsiliasi dan gunakan reversal/replacement untuk semua koreksi. |
| A-06 | **Aturan saldo negatif belum diputuskan tetapi sudah menjadi aturan bisnis.** BR-02 memberi pengecualian melalui pengaturan workspace, sedangkan bagian 18.2 masih mempertanyakan default dan otoritas pengaktifannya. Wireframe mengasumsikan dilarang secara default. | Validasi transaksi dan race-condition handling tidak dapat ditetapkan. | Putuskan sebelum M2. Rekomendasi: dilarang default; hanya owner dengan capability pengaturan finansial dapat mengaktifkan; pemeriksaan saldo dan penulisan ledger wajib atomik dengan locking/constraint yang mencegah concurrent overspend. |
| A-07 | **Public projection belum didefinisikan sebagai kontrak data.** Bagian 8 memberi daftar naratif, tetapi tidak menentukan allowlist per endpoint/export, perilaku field kosong, cache/indexing, akses lampiran, atau efek perubahan publik → privat. | Data privat dapat bocor melalui API, HTML source, metadata, export, cache, atau attachment URL. | Tambahkan schema public DTO terpisah dan allowlist per response. Tidak boleh memakai entity serializer internal. Definisikan cache purge/no-store untuk detail sensitif, signed attachment access, metadata stripping, dan test bahwa field privat tidak pernah muncul. |
| A-08 | **Idempotency hanya berupa NFR tanpa kontrak.** Bagian 12.2 menyebut idempotency, tetapi tidak menentukan key, scope, expiry, request fingerprint, atau respons retry. | Retry/double-click dapat menggandakan transaksi dan saldo. | Wajibkan `Idempotency-Key` untuk seluruh write finansial; unik per workspace + actor + operation; simpan fingerprint dan hasil; key sama dengan payload berbeda menghasilkan conflict; retry payload sama mengembalikan transaksi asli. |

### Temuan tinggi — perlu diselesaikan sebelum pengembangan milestone terkait

| ID | Temuan | Dampak | Rekomendasi perubahan |
|---|---|---|---|
| A-09 | **IDR-only dan multi-currency bertentangan.** Onboarding meminta mata uang utama, NFR membahas presisi mata uang, tetapi wireframe mengasumsikan IDR-only dan bagian 18.2 masih terbuka. | Model nominal, formatting, laporan, dan transfer dapat berubah besar. | Tetapkan MVP IDR-only; simpan integer rupiah. Tunda currency field yang dapat diubah. Tambahkan multi-currency hanya dengan aturan rate dan larangan transfer lintas mata uang. |
| A-10 | **Status transaksi tumpang tindih.** Bagian 7 mencantumkan aktif, dikoreksi, dibatalkan, atau pengganti. “Pengganti” adalah relasi/asal-usul, bukan lifecycle status; “dikoreksi” tidak jelas apakah transaksi lama masih efektif. | Query saldo dan laporan dapat menghitung transaksi salah. | Gunakan status efektif eksplisit, misalnya `posted`, `reversed`, `voided`; simpan `replaces_transaction_id` sebagai relasi. Definisikan tepat status mana yang masuk agregasi. |
| A-11 | **Saldo awal tidak memiliki semantik perubahan yang aman.** Disebut satu per rekening dan perubahan wajib tercatat, tetapi tidak dijelaskan apakah perubahan mengoreksi seluruh histori atau membuat adjustment pada tanggal tertentu. | Saldo historis dapat berubah setelah laporan diterbitkan. | Modelkan saldo awal sebagai ledger entry pertama. Setelah transaksi berikutnya ada, perubahan harus berupa adjustment/reversal, bukan update nilai lama. |
| A-12 | **Transfer atomik belum lengkap.** Transfer membutuhkan akses ke asal dan tujuan, tetapi tidak dijelaskan apakah keduanya harus satu workspace/currency, bagaimana status/correction/reconciliation diwariskan, dan apakah transfer ke rekening terarsip boleh dilakukan. | Saldo dan authorization dapat inkonsisten. | Wajibkan satu workspace dan currency, dua rekening berbeda dan aktif, capability pada kedua rekening, satu transaction ID dengan dua entry yang commit atomik, serta reversal atomik untuk koreksi. |
| A-13 | **Utang/piutang terlalu luas dan belum cukup dispesifikasi.** Tidak ada aturan alokasi pembayaran, overpayment, pembatalan pembayaran, urutan status, currency, atau koreksi. Namun fitur masuk acceptance criteria MVP. | M4 berisiko menjadi subsystem akuntansi tersendiri dan membuat scope MVP tidak realistis. | Milestone-gate setelah ledger stabil. Definisikan allocation per pembayaran, larang overpayment, hitung status dari aggregate pembayaran efektif, dan gunakan ledger transaction tertaut untuk settlement. Alternatif lebih aman: keluarkan dari MVP validasi awal. |
| A-14 | **Lampiran belum memiliki batas dan lifecycle.** Ukuran/format masih pertanyaan terbuka; belum ada retensi, quota, malware failure state, EXIF stripping, atau perilaku setelah transaksi dibatalkan. | Risiko biaya, malware, privasi, dan storage orphan. | Tetapkan allowlist MIME berdasarkan content sniffing, ukuran/jumlah, quarantine + scan, private object storage, metadata stripping untuk gambar, retention, deletion policy, dan signed URL singkat. |
| A-15 | **Perubahan membership/access saat request berjalan tidak didefinisikan.** Wireframe memiliki error “akses telah berubah”, tetapi PRD tidak menetapkan re-authorization pada commit. | Pengguna dapat menyimpan transaksi setelah akses dicabut. | Otorisasi ulang di server pada write/commit, bukan hanya saat form dibuka. Audit grant/revoke dan invalidasi session/cache authorization. |
| A-16 | **Timezone dan period boundary kurang jelas.** Tanggal transaksi mengikuti timezone workspace, tetapi tidak ada aturan DST, perubahan timezone, timestamp audit, backdating/future dating, atau cut-off laporan. | Transaksi dapat masuk periode laporan berbeda dan audit ordering membingungkan. | Simpan audit timestamp UTC dan transaction date sebagai local date + immutable workspace timezone reference. Batasi perubahan timezone dan definisikan backdate/future-date policy. |
| A-17 | **Ekspor tidak memiliki kontrak keamanan/operasional.** PDF/Excel diwajibkan, ekspor besar async, tetapi tidak ada expiry, encryption, formula injection defense, job authorization recheck, atau batas ukuran. | Kebocoran data dan spreadsheet formula injection. | Re-check scope saat job dibuat dan file diunduh; escape formula-leading cells; private temporary storage; signed URL berumur pendek; retention dan audit download; batas ukuran serta status job. |
| A-18 | **Acceptance criteria belum mencakup concurrency/failure.** Kriteria “berubah tepat satu kali” tidak menyebut concurrent expenses, partial failure transfer, retry lintas timeout, atau recalculation. | Integritas saldo bisa lulus happy path tetapi gagal di produksi. | Tambahkan scenario test atomik/idempotent: request duplikat, dua expense concurrent, rollback satu sisi transfer, reversal/replacement, dan rebuild saldo dari ledger menghasilkan nilai sama. |

### Temuan sedang — memperjelas testability dan scope

| ID | Temuan | Rekomendasi perubahan |
|---|---|---|
| A-19 | Target kinerja “2 detik pada koneksi wajar” tidak terukur. | Tentukan percentile, perangkat/jaringan, dataset, dan titik ukur, misalnya p75 LCP ≤ 2,5 detik pada mobile mid-tier/4G dan API list p95 ≤ 500 ms untuk 100 ribu transaksi/workspace. |
| A-20 | Tidak ada target availability, RPO, RTO, retention audit, atau recovery verification. | Tambahkan SLO dan angka: availability, backup interval, RPO/RTO, restore drill, serta periode retensi audit/export/attachment. |
| A-21 | Rate limiting dan brute-force protection tidak memiliki scope/threshold. | Definisikan per endpoint/identity/IP, response, lockout aman, dan observability; hindari lockout yang dapat dipakai untuk denial-of-service akun. |
| A-22 | Kategori “digabungkan melalui proses terkontrol” tidak dijelaskan. | Definisikan apakah transaksi lama dipindah atau alias diterapkan; audit perubahan dan dampak laporan historis. |
| A-23 | Search/filter “server-side” di wireframe belum menjadi requirement API: sort, pagination stability, timezone, dan kombinasi filter tidak ditetapkan. | Definisikan default sort (`transaction_date DESC, id DESC`), cursor/page semantics, URL encoding, dan filter yang didukung. |
| A-24 | Metrik keberhasilan tidak punya baseline, target, window, atau aturan privasi telemetry. | Tambahkan target numerik setelah instrumentasi baseline dan definisikan event minimization/retention. |
| A-25 | Scope MVP sangat besar: identity, fine-grained authorization, ledger, audit, correction, debt/receivable, public projection, attachments, PDF/Excel, dan reports. | Jadikan M1–M3 sebagai MVP internal dan M5 sebagai public beta gate; M4 dan M6 advanced exports dapat mengikuti setelah integrity/security criteria lulus. |
| A-26 | PRD dan coded prototype dapat disalahartikan sama. Prototype menggunakan data statis dan menyimulasikan save, sedangkan requirement produksi membutuhkan server enforcement. | Pertahankan label eksplisit bahwa prototype hanya validasi UX; jangan gunakan client-side state/validation sebagai referensi arsitektur keamanan atau ledger. |

### Keputusan yang harus ditutup

Sebelum implementasi produksi, pemilik produk perlu menetapkan:

1. Kardinalitas workspace–organization–project dan ownership rekening.
2. Algoritme akses: capability, project scope, account scope, dan hak owner.
3. Strategi koreksi ledger dan definisi rekonsiliasi.
4. Kebijakan saldo negatif beserta otoritas pengaktifannya.
5. IDR-only atau multi-currency.
6. Public DTO dan kebijakan nama pihak/lampiran publik.
7. Batas serta lifecycle lampiran.
8. Apakah utang/piutang tetap dalam MVP awal atau ditunda.

---

## 1. Ringkasan Eksekutif

AmanahKas adalah aplikasi web multiuser untuk mencatat, mengendalikan, melaporkan, dan mempublikasikan aktivitas keuangan organisasi atau proyek. Produk ditujukan bagi bendahara yang membutuhkan pencatatan lebih terstruktur daripada spreadsheet, tetapi tetap sederhana untuk digunakan dalam kegiatan komunitas, yayasan, pembangunan, kepanitiaan, rumah ibadah, sekolah, atau proyek mandiri.

Produk menggabungkan pencatatan kas, beberapa rekening, transfer internal, saldo awal, utang-piutang, bukti transaksi, kategori fleksibel, laporan, ekspor, audit perubahan, dan halaman transparansi publik opsional.

## 2. Latar Belakang dan Masalah

- Pencatatan kas sering tersebar di buku, chat, kuitansi, dan spreadsheet yang berbeda.
- Satu organisasi dapat memiliki beberapa rekening, kas tunai, dan proyek, tetapi saldo gabungan sulit dipantau.
- Koreksi transaksi sering menghapus jejak perubahan dan menurunkan kepercayaan.
- Laporan kepada anggota atau publik membutuhkan pekerjaan manual dan berisiko membuka data sensitif.
- Pembagian tanggung jawab bendahara per rekening atau proyek sulit diterapkan secara aman.

## 3. Visi, Sasaran, dan Non-Sasaran

### 3.1 Visi

Menjadi alat bendahara yang sederhana, aman, dan transparan untuk setiap organisasi dan proyek.

### 3.2 Sasaran MVP

- Membuat pencatatan kas masuk dan kas keluar cepat, konsisten, dan dapat ditelusuri.
- Menghasilkan saldo yang benar untuk setiap rekening serta gabungan organisasi/proyek.
- Mendukung kerja beberapa bendahara dengan akses terbatas sesuai tanggung jawabnya.
- Menyediakan laporan operasional dan publik tanpa membocorkan informasi sensitif.
- Memungkinkan koreksi tanpa menghilangkan histori transaksi.

### 3.3 Non-sasaran MVP

- Bukan layanan perbankan, dompet digital, payment gateway, atau penyimpan dana.
- Tidak melakukan rekonsiliasi bank otomatis atau integrasi mutasi bank pada MVP.
- Tidak menggantikan software akuntansi double-entry dan pelaporan pajak penuh.
- Tidak menyediakan payroll, inventory, procurement, atau invoice komersial lengkap.

## 4. Pengguna dan Peran

| Peran | Kemampuan utama | Batasan |
|---|---|---|
| Pemilik organisasi | Mengatur profil, bendahara, rekening, proyek, dan transparansi | Tidak otomatis dapat mengubah transaksi jika tidak diberi akses bendahara |
| Bendahara | Mencatat dan mengelola transaksi sesuai scope akses | Hanya proyek dan rekening yang diberikan |
| Publik | Melihat halaman, saldo ringkas, dan transaksi yang dipublikasikan | Tanpa login; tidak dapat melihat data privat atau melakukan perubahan |

Satu orang dapat memiliki lebih dari satu peran. Akses efektif harus mengikuti prinsip least privilege dan merupakan gabungan scope organisasi, proyek, dan rekening yang diberikan. Lihat A-02 dan A-03 karena algoritme gabungan dan hak baca owner belum ditetapkan.

## 5. Model Organisasi dan Kepemilikan Data

- Organisasi dapat memiliki banyak proyek.
- Proyek juga dapat berdiri sendiri tanpa organisasi induk.
- Organisasi atau proyek dapat memiliki beberapa rekening: bank, e-wallet, atau kas tunai.
- Bendahara dapat diberi akses ke seluruh organisasi, proyek tertentu, rekening tertentu, atau kombinasi keduanya.
- Transaksi selalu memiliki konteks pemilik, rekening, tanggal, nominal, dan jenis transaksi.

> **Audit:** Kardinalitas dan tenant boundary belum lengkap. Lihat A-01.

## 6. Ruang Lingkup Fungsional MVP

### 6.1 Onboarding dan Workspace

- Pengguna membuat organisasi atau proyek mandiri.
- Pengguna mengisi nama, deskripsi, logo opsional, mata uang utama, dan zona waktu.
- Pemilik membuat rekening dan memasukkan saldo awal.
- Pemilik mengundang bendahara dan menentukan scope aksesnya.
- Pemilik memilih apakah halaman publik diaktifkan.

### 6.2 Rekening

| Kebutuhan | Aturan |
|---|---|
| Jenis | Bank, kas tunai, atau dompet elektronik |
| Identitas | Nama rekening wajib; bank/nomor rekening dan pemilik rekening opsional serta sensitif |
| Saldo | Dihitung dari saldo awal dan seluruh transaksi efektif |
| Status | Aktif atau diarsipkan; rekening dengan histori tidak dapat dihapus permanen |
| Akses | Dapat dibatasi ke bendahara tertentu |

### 6.3 Jenis Transaksi

| Jenis | Dampak saldo | Aturan penting |
|---|---|---|
| Kas masuk | Menambah rekening | Kategori pemasukan; pihak terkait opsional |
| Kas keluar | Mengurangi rekening | Kategori pengeluaran; dapat menyertakan bukti |
| Transfer | Kurangi asal, tambah tujuan | Satu transaksi dua sisi; tidak dihitung sebagai pendapatan/beban |
| Saldo awal | Menetapkan posisi awal | Satu per rekening; perubahan wajib tercatat |
| Utang | Tidak langsung mengubah kas | Memiliki kreditur, nilai, jatuh tempo, status, dan pembayaran terkait |
| Piutang | Tidak langsung mengubah kas | Memiliki debitur, nilai, jatuh tempo, status, dan penerimaan terkait |

### 6.4 Data Transaksi

| Field | Wajib | Catatan |
|---|---:|---|
| Jenis transaksi | Ya | Masuk, keluar, transfer, saldo awal, utang, atau piutang |
| Tanggal transaksi | Ya | Mengikuti zona waktu workspace |
| Nominal | Ya | Lebih besar dari nol; presisi mata uang |
| Rekening | Ya* | Tidak wajib saat pencatatan utang/piutang sebelum pelunasan |
| Kategori | Ya* | Tidak berlaku untuk transfer dan saldo awal |
| Pihak terkait | Tidak | Nama penyetor, penerima, debitur, atau kreditur |
| Nomor referensi | Tidak | Nomor kuitansi, transfer, atau dokumen |
| Catatan | Tidak | Keterangan operasional |
| Lampiran | Tidak | Foto atau dokumen kuitansi; mendukung lebih dari satu file |
| Visibilitas publik | Ya | Privat atau publik; default mengikuti pengaturan workspace |

### 6.5 Kategori

- Sistem menyediakan kategori bawaan untuk pemasukan dan pengeluaran.
- Bendahara berwenang dapat membuat, mengganti nama, mengurutkan, dan mengarsipkan kategori.
- Kategori dapat berlaku global dalam organisasi atau khusus proyek.
- Kategori yang sudah digunakan tidak dapat dihapus permanen; hanya diarsipkan atau digabungkan melalui proses terkontrol.

### 6.6 Utang dan Piutang

- Status: belum dibayar, dibayar sebagian, lunas, atau dibatalkan.
- Pelunasan utang membuat transaksi kas keluar yang tertaut; penerimaan piutang membuat kas masuk yang tertaut.
- Pembayaran sebagian diperbolehkan dan sisa dihitung otomatis.
- Tanggal jatuh tempo bersifat opsional; aplikasi menampilkan yang mendekati atau melewati jatuh tempo.
- Utang dan piutang tidak memengaruhi saldo kas sebelum terjadi pembayaran atau penerimaan.

> **Audit:** Allocation, overpayment, koreksi, dan lifecycle pembayaran belum ditentukan. Lihat A-13.

### 6.7 Pusat Transaksi dan Relasi

Sistem hanya memiliki lima jenis transaksi: **Kas Masuk, Kas Keluar, Transfer, Utang, dan Piutang**. Uang muka/panjar adalah Kas Keluar berstatus belum terealisasi, bukan jenis tersendiri. Pengembalian, kekurangan, pembayaran utang, dan penerimaan piutang dicatat sebagai Kas Masuk/Kas Keluar yang terhubung ke transaksi induk.

Semua transaksi muncul dalam satu daftar **Transaksi**. Jenis dan status `Belum selesai`/`Selesai` menjadi filter pada halaman yang sama. Satu transaksi dapat memiliki banyak transaksi terkait sampai outstanding nol dan transaksi ditutup.

Tombol `Tambah transaksi` membuka panel dengan tab jenis `Kas masuk`, `Kas keluar`, `Transfer`, `Uang muka`, `Utang`, dan `Piutang`; form tepat di bawah tab menyesuaikan pilihan tanpa navigasi halaman.

Pertanggungjawaban Dana menangani uang muka yang diberikan kepada anggota untuk kebutuhan dengan biaya aktual yang belum diketahui. Satu pertanggungjawaban menjadi induk bagi estimasi, pencairan, realisasi, bukti, pengembalian, reimbursement, dan koreksi terkait. Induk dan seluruh aktivitas turunannya tetap dapat dicari serta difilter dari daftar Transaksi yang sama.

#### Flow inti

1. **Buat permintaan dana** — bendahara memilih anggota, menulis keperluan, estimasi total, target pertanggungjawaban, dan rincian estimasi opsional. Estimasi belum mengubah kas.
2. **Cairkan uang muka** — bendahara memilih rekening dan nominal. Sistem mencatat kas keluar tertaut dan status menjadi `Menunggu pertanggungjawaban`.
3. **Catat realisasi** — bendahara menambahkan item aktual, kategori, nominal, tanggal, dan bukti. Realisasi dapat disimpan bertahap.
4. **Hitung selisih otomatis** — sistem membandingkan dana tersedia dengan biaya aktual:
   - sama: `Siap diselesaikan`;
   - dana lebih: `Menunggu pengembalian`;
   - dana kurang: `Perlu tambahan bayar`.
5. **Selesaikan selisih** — kelebihan dicatat sebagai kas masuk pengembalian; kekurangan dicatat sebagai kas keluar reimbursement. Keduanya dapat dilakukan sebagian.
6. **Tutup pertanggungjawaban** — status `Selesai` hanya ketika outstanding nol dan data wajib lengkap.
7. **Koreksi** — perubahan finansial setelah selesai menggunakan reversal/pengganti tertaut dengan alasan dan audit trail.

#### Semantik unified activity

| Jenis aktivitas | Dampak kas | Dampak pemasukan/biaya |
|---|---:|---|
| Kas masuk | Bertambah | Pemasukan bertambah |
| Kas keluar | Berkurang | Biaya bertambah |
| Transfer | Total workspace nol | Bukan pemasukan/biaya |
| Uang muka | Berkurang | Belum menjadi biaya |
| Realisasi uang muka | Tidak berubah | Biaya aktual bertambah |
| Pengembalian uang muka | Bertambah | Bukan pemasukan |
| Reimbursement | Berkurang | Bukan biaya kedua |
| Utang/piutang baru | Tidak berubah | Ditampilkan sebagai non-kas sampai settlement |

- Estimasi tidak mengubah saldo atau laporan biaya.
- Pencairan uang muka mengurangi saldo rekening, tetapi belum menjadi biaya aktual.
- Item realisasi menentukan biaya aktual dan hanya dihitung satu kali.
- Pengembalian menambah saldo rekening, tetapi bukan pendapatan operasional.
- Reimbursement mengurangi saldo rekening, tetapi bukan biaya kedua.
- Dana tersedia dihitung sebagai `pencairan + reimbursement - pengembalian`.
- Outstanding dihitung sebagai `dana tersedia - biaya aktual`; positif berarti anggota harus mengembalikan, negatif berarti organisasi harus membayar anggota.

#### Status

`Draft` → `Menunggu pertanggungjawaban` → `Siap diselesaikan` / `Menunggu pengembalian` / `Perlu tambahan bayar` → `Selesai`.

Status dihitung dari transaksi efektif dan kelengkapan data, bukan dipilih bebas oleh pengguna.

## 7. Koreksi, Audit, dan Integritas Data

- Transaksi yang belum direkonsiliasi dapat diedit dengan audit trail.
- Setelah direkonsiliasi, transaksi tidak diedit langsung: bendahara membatalkannya dan membuat transaksi pengganti yang saling terhubung.
- Audit trail menyimpan aktor, waktu, alasan, nilai lama, dan nilai baru.
- Transaksi keuangan tidak dapat dihapus permanen.
- Pembatalan wajib menyertakan alasan.
- Status transaksi: aktif, dikoreksi, dibatalkan, atau pengganti.
- Saldo dan laporan hanya menggunakan transaksi efektif; pasangan koreksi tetap dapat ditelusuri.
- Pada halaman publik, transaksi menampilkan label koreksi/pembatalan tanpa memperlihatkan audit internal atau data sensitif.

> **Audit:** Strategi ledger immutable, definisi rekonsiliasi, dan status efektif belum konsisten. Lihat A-04, A-05, dan A-10.

## 8. Transparansi Publik dan Privasi

### 8.1 Prinsip

Halaman publik bersifat opsional. Jika diaktifkan, setiap transaksi memiliki kontrol visibilitas sendiri. Sistem harus memisahkan informasi transaksi yang boleh dipublikasikan dari data sensitif yang selalu privat.

### 8.2 Informasi publik

- Nama dan deskripsi organisasi/proyek serta logo.
- Ringkasan saldo dan periode laporan jika diaktifkan.
- Transaksi yang ditandai publik: tanggal, jenis, kategori, nominal, dan deskripsi publik.
- Status koreksi atau pembatalan serta pembaruan terakhir.

### 8.3 Informasi yang selalu privat secara default

- Nomor rekening lengkap, identitas pemilik rekening, email, nomor telepon, alamat, dan data login.
- Lampiran kuitansi/dokumen sampai bendahara secara eksplisit menyatakan aman dipublikasikan.
- Catatan internal, histori perubahan rinci, IP address, dan metadata keamanan.
- Nama pihak terkait dapat diganti deskripsi publik atau disamarkan.

> **Audit:** Implementasi memerlukan public DTO allowlist terpisah, bukan sanitasi serializer internal. Lihat A-07.

## 9. Laporan dan Ekspor

| Laporan | Filter minimum | Keluaran |
|---|---|---|
| Arus kas | Periode, rekening, proyek, kategori | Saldo awal periode, kas masuk, kas keluar, saldo akhir |
| Saldo rekening | Tanggal posisi, proyek | Saldo per rekening dan total gabungan |
| Kategori/proyek | Periode, jenis transaksi | Ringkasan dan rincian per kategori/proyek |
| Utang-piutang | Status, pihak, jatuh tempo | Nilai awal, pembayaran, sisa, keterlambatan |
| Buku transaksi | Periode dan seluruh dimensi utama | Daftar transaksi kronologis dengan status |

- Ekspor PDF untuk laporan yang siap dibagikan atau dicetak.
- Ekspor Excel untuk analisis lanjutan, dengan kolom stabil dan tanpa data yang tidak diizinkan.
- Laporan privat mengikuti akses pengguna; laporan publik hanya berisi transaksi yang dipublikasikan.

## 10. Alur Utama Pengguna

### 10.1 Mencatat kas keluar

1. Bendahara memilih organisasi/proyek dan rekening yang dapat diakses.
2. Bendahara memilih Kas Keluar, tanggal, nominal, dan kategori.
3. Bendahara menambahkan pihak terkait, referensi, catatan, dan lampiran bila tersedia.
4. Bendahara menentukan apakah transaksi terlihat publik.
5. Sistem memvalidasi data, menyimpan transaksi, memperbarui saldo, dan mencatat audit event.

### 10.2 Transfer antar-rekening

1. Bendahara memilih rekening asal dan tujuan yang dapat diakses.
2. Sistem menolak rekening asal dan tujuan yang sama.
3. Setelah disimpan, sistem membuat satu identitas transfer dengan dua ledger entry atomik.
4. Jika salah satu sisi gagal disimpan, seluruh transfer dibatalkan.

### 10.3 Mempertanggungjawabkan dana anggota

1. Bendahara membuat permintaan atas nama anggota dan mencairkan uang muka dari rekening yang dapat diakses.
2. Bendahara mencatat item biaya aktual dan bukti secara bertahap.
3. Sistem menghitung selisih tanpa menganggap uang muka sebagai biaya aktual.
4. Jika dana berlebih, bendahara mencatat pengembalian ke rekening asal atau rekening lain yang diizinkan.
5. Jika dana kurang, bendahara mencatat reimbursement kepada anggota dari rekening yang diizinkan.
6. Sistem menutup pertanggungjawaban saat outstanding nol dan mempertahankan seluruh transaksi terkait dalam timeline.

### 10.4 Publik melihat laporan

1. Pengunjung membuka URL publik organisasi atau proyek tanpa login.
2. Sistem menampilkan ringkasan dan transaksi yang diizinkan saja.
3. Pengunjung dapat memfilter periode/kategori dan membuka detail aman.

## 11. Persyaratan Hak Akses

| Aksi | Pemilik | Bendahara berscope | Publik |
|---|---|---|---|
| Atur organisasi/proyek | Ya | Tidak | Tidak |
| Kelola rekening | Ya | Jika diberi wewenang | Tidak |
| Catat transaksi | Jika juga bendahara | Ya, dalam scope | Tidak |
| Edit/batalkan transaksi | Jika juga bendahara | Ya, dalam scope | Tidak |
| Atur visibilitas transaksi | Ya | Ya, dalam scope | Tidak |
| Lihat laporan privat | Ya | Sesuai scope | Tidak |
| Lihat laporan publik | Ya | Ya | Ya |
| Undang/cabut bendahara | Ya | Tidak | Tidak |

> **Audit:** Hak baca owner dan kombinasi scope belum konsisten dengan least privilege. Lihat A-02 dan A-03.

## 12. Persyaratan Nonfungsional

### 12.1 Keamanan

- Autentikasi wajib untuk seluruh fungsi internal; sesi dan kredensial menggunakan praktik keamanan modern.
- Otorisasi diverifikasi di server pada setiap permintaan, bukan hanya disembunyikan di UI.
- Lampiran disimpan privat dan diakses melalui URL sementara yang terotorisasi.
- Rate limiting, proteksi brute force, validasi file, dan audit aktivitas sensitif.

### 12.2 Reliabilitas dan konsistensi

- Perubahan saldo dan transfer dilakukan secara atomik.
- Nominal disimpan sebagai integer unit terkecil mata uang, bukan floating point.
- Idempotency mencegah transaksi ganda akibat retry atau double-click.
- Backup terjadwal dan prosedur pemulihan diuji sebelum penggunaan produksi luas.

### 12.3 Usability dan aksesibilitas

- Mobile-first karena pencatatan sering dilakukan saat kegiatan berlangsung.
- Format tanggal, waktu, dan mata uang mengikuti lokal pengguna; default Indonesia/IDR.
- Form dapat digunakan dengan keyboard dan screen reader; kontras memenuhi WCAG 2.1 AA.

### 12.4 Kinerja

- Halaman utama dan laporan umum ditargetkan tampil dalam 2 detik pada koneksi wajar.
- Daftar transaksi menggunakan pagination dan filter server-side.
- Ekspor besar diproses asinkron dan pengguna menerima status penyelesaian.

> **Audit:** NFR perlu angka dan kondisi ukur. Lihat A-19 sampai A-21.

## 13. Aturan Bisnis Kritis

| ID | Aturan |
|---|---|
| BR-01 | Nominal transaksi harus lebih besar dari nol. |
| BR-02 | Kas keluar tidak boleh membuat saldo negatif kecuali workspace mengaktifkan izin saldo negatif. |
| BR-03 | Transfer hanya sah jika kedua ledger entry berhasil secara atomik. |
| BR-04 | Transfer tidak masuk perhitungan pemasukan atau pengeluaran. |
| BR-05 | Transaksi yang telah direkonsiliasi hanya dapat dikoreksi melalui pembatalan dan pengganti. |
| BR-06 | Transaksi yang memiliki histori tidak dapat dihapus permanen. |
| BR-07 | Pengguna hanya dapat mengakses rekening dan proyek dalam scope-nya. |
| BR-08 | Halaman publik hanya memuat transaksi berstatus publik dan field aman. |
| BR-09 | Utang/piutang baru memengaruhi kas saat pembayaran/penerimaan dicatat. |
| BR-10 | Kategori terpakai hanya dapat diarsipkan, bukan dihapus. |
| BR-11 | Estimasi pertanggungjawaban tidak mengubah saldo atau laporan biaya. |
| BR-12 | Pengembalian uang muka bukan pendapatan dan reimbursement bukan biaya kedua. |
| BR-13 | Total pengembalian atau reimbursement tidak boleh melebihi outstanding efektif. |
| BR-14 | Pertanggungjawaban hanya dapat selesai ketika outstanding nol dan data wajib lengkap. |
| BR-15 | Pencairan, realisasi, pengembalian, reimbursement, dan koreksi harus tertaut ke satu pertanggungjawaban. |

## 14. Acceptance Criteria MVP

- Bendahara dapat membuat kas masuk/keluar dan saldo rekening berubah tepat satu kali.
- Transfer menghasilkan saldo asal dan tujuan yang benar tanpa memengaruhi laporan arus kas eksternal.
- Bendahara tanpa akses tidak dapat membaca atau mengubah rekening/proyek melalui UI maupun API.
- Edit transaksi menyimpan histori lengkap; transaksi terekonsiliasi tidak dapat diedit langsung.
- Pembatalan dan transaksi pengganti tertaut, serta saldo akhir tetap konsisten.
- Utang/piutang mendukung pembayaran sebagian dan menghitung sisa dengan benar.
- Transaksi privat tidak muncul di halaman publik, API publik, PDF publik, maupun Excel publik.
- Data sensitif tidak muncul pada source halaman, metadata lampiran, atau response publik.
- Laporan per rekening, kategori, proyek, dan periode sama dengan hasil agregasi transaksi efektif.
- Ekspor PDF dan Excel mengikuti filter serta hak akses pengguna.
- Bendahara dapat mencairkan uang muka dan saldo rekening berkurang tepat satu kali tanpa mengakui estimasi sebagai biaya.
- Biaya aktual pertanggungjawaban berasal dari total item realisasi dan tidak dihitung ulang saat reimbursement dibayar.
- Kelebihan dana membuat pengembalian tertaut yang menambah kas tanpa menambah pendapatan.
- Kekurangan dana membuat reimbursement tertaut yang mengurangi kas tanpa menggandakan biaya.
- Pengembalian dan reimbursement sebagian memperbarui outstanding; settlement hanya selesai saat outstanding nol.
- Detail pertanggungjawaban memperlihatkan semua pencairan, item, bukti, settlement, dan koreksi dalam satu timeline internal.

> **Audit:** Tambahkan skenario concurrency, retry, rollback, dan ledger rebuild dari A-18.

## 15. Ukuran Keberhasilan

| Metrik | Definisi awal |
|---|---|
| Activation | Workspace membuat rekening dan transaksi pertama dalam 24 jam setelah dibuat |
| Weekly active treasurer | Bendahara yang membuat, mengoreksi, atau meninjau laporan dalam 7 hari |
| Completion rate | Persentase form transaksi yang berhasil disimpan setelah mulai diisi |
| Correction rate | Persentase transaksi yang diedit/dibatalkan; dipantau untuk mendeteksi UX bermasalah |
| Public transparency adoption | Persentase workspace yang mengaktifkan halaman publik dan mempublikasikan transaksi |
| Balance integrity | Tidak ada selisih antara ledger dan saldo hasil perhitungan ulang |

## 16. Tahapan Implementasi

| Tahap | Cakupan |
|---|---|
| M1 — Fondasi | Akun, workspace, organisasi/proyek, rekening, role dan scope akses |
| M2 — Ledger | Kas masuk/keluar, saldo awal, kategori, lampiran, audit dasar |
| M2.5 — Pertanggungjawaban | Permintaan dana, pencairan, realisasi, pengembalian, reimbursement, dan outstanding anggota |
| M3 — Kontrol | Transfer atomik, rekonsiliasi, koreksi, pembatalan, transaksi pengganti |
| M4 — Kewajiban | Utang-piutang, pembayaran sebagian, jatuh tempo |
| M5 — Transparansi | Halaman publik, visibilitas per transaksi, sanitasi data |
| M6 — Pelaporan | Dashboard, laporan, filter, PDF, Excel, hardening dan QA |

## 17. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Cakupan MVP terlalu besar | Bangun milestone vertikal; utang-piutang dikerjakan setelah ledger dan koreksi stabil |
| Kebocoran data di halaman publik | Gunakan public projection/DTO terpisah, allowlist field, dan automated privacy tests |
| Saldo tidak konsisten | Ledger immutable, transaksi database atomik, idempotency key, dan proses recalculation |
| Hak akses kompleks | Policy terpusat, deny-by-default, matrix test per role/scope |
| Lampiran berbahaya | Validasi MIME/ukuran, malware scan, private storage, URL sementara |

## 18. Keputusan dan Pertanyaan Lanjutan

### 18.1 Keputusan yang sudah disepakati

- Satu workspace mendukung organisasi dengan proyek maupun proyek mandiri.
- Satu organisasi/proyek memiliki beberapa rekening.
- Beberapa bendahara diperbolehkan dengan akses per proyek atau rekening.
- Transaksi langsung tercatat tanpa approval.
- Visibilitas publik diatur per transaksi.
- MVP mendukung kas, transfer, saldo awal, utang-piutang, lampiran, referensi, pihak terkait, kategori, laporan, PDF, dan Excel.

### 18.2 Perlu diputuskan sebelum desain final

- Apakah saldo negatif dilarang secara default dan siapa yang dapat mengaktifkannya?
- Definisi serta proses rekonsiliasi manual pada MVP.
- Batas ukuran, jumlah, dan format lampiran.
- Apakah nama pihak terkait publik secara default disamarkan atau dihilangkan?
- Apakah pemilik organisasi harus selalu dapat melihat seluruh transaksi walau bukan bendahara?
- Apakah MVP hanya mendukung IDR atau multi-currency sejak awal?

## Lampiran A — Entitas Data Tingkat Tinggi

| Entitas | Relasi utama |
|---|---|
| User | Memiliki membership dan role pada workspace |
| Workspace | Mewadahi organisasi atau proyek mandiri |
| Organization | Memiliki proyek, rekening, kategori, dan pengaturan publik |
| Project | Opsional berada di organisasi; memiliki rekening/kategori/transaksi |
| Account | Milik organisasi/proyek; memiliki ledger entry |
| Transaction | Identitas bisnis transaksi, status, visibilitas, pihak, bukti |
| LedgerEntry | Dampak debit/kredit terhadap rekening; transfer memiliki dua entry |
| Category | Global organisasi atau khusus proyek |
| DebtReceivable | Utang/piutang dan relasi pembayaran/penerimaan |
| Attachment | File privat yang tertaut ke transaksi |
| FundAccountability | Induk permintaan, anggota, estimasi, status, dan seluruh settlement terkait |
| ExpenseItem | Realisasi biaya aktual, kategori, tanggal, dan bukti dalam pertanggungjawaban |
| AuditEvent | Perubahan, aktor, waktu, alasan, before/after |

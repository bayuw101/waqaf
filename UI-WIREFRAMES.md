# AmanahKas — Low-Fidelity UI Wireframes

Status: Draft for product/design review  
Standard: Morfosis UI  
Scope: Shell, onboarding, dashboard, transaction list, cash form, transaction detail, and mobile variants

## 1. Wireframe conventions

These wireframes describe hierarchy and behavior, not final visual polish.

- `[ Button ]` — action
- `( Select ▾ )` — select or context switcher
- `[________]` — field
- `●` — selected option/status
- `○` — unselected option
- `⋯` — overflow actions
- `🔒` — private
- `◎` — public
- `↑ / ↓ / ⇄` — expense, income, and transfer
- Desktop reference frame: 1440 × 900
- Mobile reference frame: 390 × 844
- Tablet breakpoint: 768px
- Wide desktop breakpoint: 1200px

All monetary values use tabular numerals. Color supplements labels and icons but never replaces them.

## 2. Application shell

### Desktop shell

```text
┌──────┬───────────────────────────────────────────────────────────────────────┐
│  AK  │ AmanahKas   (Yayasan Amanah ▾) / (Proyek Utama ▾)         ◐  🔔  BA │
│      ├───────────────────────────────────────────────────────────────────────┤
│  ▣   │ ╭───────────────────────────────────────────────────────────────────╮ │
│  ⇅   │ │ Sticky page header                                                │ │
│  ◷   │ ├───────────────────────────────────────────────────────────────────┤ │
│  ▤   │ │                    Scrollable page content                        │ │
│  ◎   │ │                                                                   │ │
│  ⚙   │ ╰───────────────────────────────────────────────────────────────────╯ │
└──────┴───────────────────────────────────────────────────────────────────────┘
 66px
```

Sidebar destinations: Ringkasan, Transaksi, Utang & Piutang, Laporan, Transparansi, Pengaturan.

- Sidebar is fixed, icon-only, and provides accessible labels/tooltips.
- Top context selectors persist through navigation.
- Main scrolling is isolated inside the floating surface.
- Context changes refresh data after confirmed selection.
- Restricted users see `Akses terbatas` beside context.

### Mobile shell

```text
┌──────────────────────────────────────┐
│ AK  Proyek Utama ▾        🔔      BA │
├──────────────────────────────────────┤
│          Scrollable content          │
├──────────────────────────────────────┤
│  ▣        ⇅       ＋       ▤       ⋯ │
│ Ringkas Transaksi Tambah  Laporan Lain│
└──────────────────────────────────────┘
```

- Workspace selection moves into the context sheet.
- The central action opens the transaction chooser.
- Content receives bottom padding so navigation never obscures it.
- Form pages use a sticky cancel/save bar.

## 3. Onboarding

### Flow

```text
Welcome → Create workspace → Choose organization/independent project
→ Profile → First account + opening balance → Invite treasurer (optional)
→ Public transparency (optional) → Ready → Add first transaction
```

Progress saves after each completed step and resumes at the first incomplete required step.

### Desktop account step

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ AK AmanahKas                                                        Help    │
├─────────────────────────────────────────────────────────────────────────────┤
│     Setup workspace                                           Step 3 of 6   │
│     ●────────●────────●────────○────────○────────○                          │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │ Create your first account                                       │     │
│     │ Account type *       ( Bank ▾ )                                 │     │
│     │ Account name *       [ Bank Operasional______________________ ] │     │
│     │ Opening balance *    [ Rp 10.000.000_________________________ ] │     │
│     │ As of date *         [ 19/08/2026____________________________ ] │     │
│     │ Account number · Optional · Private                            │     │
│     │                      [ •••• •••• •••• 4312__________________ ] │     │
│     │                           [ Back ] [ Save and continue ]         │     │
│     └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Setup card maximum width is about 640px.
- Required fields precede optional fields.
- Currency is inherited from the workspace.
- Opening balance may be zero; ordinary transaction amounts may not.
- Leaving a dirty step requires discard confirmation.

### Mobile account step

```text
┌──────────────────────────────────────┐
│ ←  Setup workspace       Step 3 of 6 │
│ ●────●────●────○────○────○           │
├──────────────────────────────────────┤
│ Create your first account            │
│ Account type *                       │
│ ( Bank ▾                           ) │
│ Account name *                       │
│ [ Bank Operasional                 ] │
│ Opening balance *                    │
│ [ Rp 10.000.000                    ] │
│ As of date *                         │
│ [ 19/08/2026                       ] │
│ Account number · Optional · Private  │
│ [ •••• •••• •••• 4312             ] │
├──────────────────────────────────────┤
│ [ Back ]         [ Save and continue ]│
└──────────────────────────────────────┘
```

The action bar moves above the virtual keyboard and never obscures the active field.

## 4. Dashboard — Ringkasan

### Desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Ringkasan                                      1–31 Aug 2026 ▾ [ + Transaksi]│
│ Proyek Utama · Semua rekening                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Total saldo dalam akses      │ │ Kas masuk       │ │ Kas keluar      │ │
│ │ Rp48.750.000                 │ │ Rp12.500.000 ↓  │ │ Rp7.250.000 ↑  │ │
│ │ 3 rekening                   │ │ Periode ini     │ │ Periode ini     │ │
│ └──────────────────────────────┘ └──────────────────┘ └──────────────────┘ │
│ ┌──────────────────────────────────────────┐ ┌────────────────────────────┐ │
│ │ Arus kas                                 │ │ Rekening                   │ │
│ │       ╭───╮                ╭────          │ │ Bank Operasional  31,25 jt │ │
│ │ ──────╯   ╰──────╮   ╭────╯              │ │ Kas Proyek        12,50 jt │ │
│ │                   ╰──╯                    │ │ E-Wallet            5,0 jt │ │
│ └──────────────────────────────────────────┘ └────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ ┌────────────────────────────┐ │
│ │ Transaksi terbaru             Lihat →    │ │ Perlu perhatian            │ │
│ │ ↓ Donasi Jumat       +2.500.000 ◎        │ │ 2 piutang terlambat        │ │
│ │ ↑ Konsumsi rapat       -450.000 🔒        │ │ 1 utang jatuh tempo 3 hari │ │
│ │ ⇄ Bank → Kas         1.000.000 🔒         │ │ [ Lihat kewajiban ]        │ │
│ └──────────────────────────────────────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Balance cards apply account filters to Transactions.
- Transfers do not affect income/expense summaries.
- Period changes refresh summaries, chart, and activity together.
- Partial totals are explicitly labeled `Berdasarkan akses Anda`.
- Empty workspaces show a setup checklist, not zero-filled analytics.

### Mobile

```text
┌──────────────────────────────────────┐
│ Ringkasan               Agu 2026 ▾   │
│ Proyek Utama                         │
├──────────────────────────────────────┤
│ Total saldo dalam akses              │
│ Rp48.750.000 · 3 rekening            │
│ ┌────────────────┐ ┌───────────────┐ │
│ │ Kas masuk      │ │ Kas keluar    │ │
│ │ Rp12.500.000   │ │ Rp7.250.000  │ │
│ └────────────────┘ └───────────────┘ │
│ Aksi cepat                           │
│ [ ↓ Masuk ] [ ↑ Keluar ] [ ⇄ Pindah ]│
│ Arus kas                             │
│ ┌──────────────────────────────────┐ │
│ │        ╭──╮      ╭────           │ │
│ │ ───────╯  ╰──────╯               │ │
│ └──────────────────────────────────┘ │
│ Rekening                       Lihat →│
│ Bank Operasional          31.250.000 │
│ Kas Proyek                12.500.000 │
│ Transaksi terbaru         Lihat →    │
│ ↓ Donasi Jumat       +2.500.000 ◎    │
│ ↑ Konsumsi rapat       -450.000 🔒    │
└──────────────────────────────────────┘
```

## 5. Transaction list

### Desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Transaksi           [ Cari transaksi… ] [ Filter 3 ] [ Export ▾ ] [ + ]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [1–31 Agu ×] [Bank Operasional ×] [Masuk + Keluar ×]        Hapus semua   │
│ Tanggal    Deskripsi       Kategori       Rekening      Status       Nominal│
│ ─────────────────────────────────────────────────────────────────────────── │
│ 19 Agu     Donasi Jumat    Donasi         Bank Op.      ● Aktif             │
│            REF-108 · ◎ Publik                           +Rp2.500.000     ⋯  │
│ 18 Agu     Konsumsi rapat  Konsumsi       Kas Proyek    ● Aktif             │
│            🔒 Privat                                      -Rp450.000     ⋯  │
│ 17 Agu     Bank ke kas     Transfer       Bank → Kas    ● Aktif             │
│            🔒 Privat                                     Rp1.000.000     ⋯  │
│ 15 Agu     Peralatan       Operasional    Bank Op.      ○ Dikoreksi         │
│            Diganti TRX-0042                              -Rp750.000      ⋯  │
│ Menampilkan 1–25 dari 148                           ‹ 1 2 3 4 5 ›          │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Search and filtering execute server-side.
- Confirmed filter state is represented in the URL.
- Rows are keyboard-focusable and open detail.
- Cancelled/corrected records stay searchable.
- Export inherits current filters and access scope.

### Mobile

```text
┌──────────────────────────────────────┐
│ Transaksi                         ＋  │
│ [ Cari transaksi…               ] ⚙ │
│ [1–31 Agu ×] [Bank Op. ×]            │
├──────────────────────────────────────┤
│ HARI INI                             │
│ ┌──────────────────────────────────┐ │
│ │ Donasi Jumat        +Rp2.500.000│ │
│ │ Donasi · Bank Op.                │ │
│ │ 10:32 · ◎ Publik       ● Aktif  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Konsumsi rapat        -Rp450.000│ │
│ │ Konsumsi · Kas Proyek            │ │
│ │ 09:15 · 🔒 Privat      ● Aktif  │ │
│ └──────────────────────────────────┘ │
│ 17 AGU 2026                         │
│ ┌──────────────────────────────────┐ │
│ │ Bank → Kas          Rp1.000.000 │ │
│ │ Transfer · 14:11 · 🔒 Privat     │ │
│ └──────────────────────────────────┘ │
│             [ Muat lagi ]            │
└──────────────────────────────────────┘
```

Mobile uses `Muat lagi`, not tiny numbered pagination.

### Filters

```text
Filter transaksi
Periode       [ 01/08/2026 — 31/08/2026 ]
Jenis         [ Masuk, Keluar             ▾ ]
Status        [ Aktif                     ▾ ]
Proyek        [ Proyek Utama              ▾ ]
Rekening      [ Bank Operasional          ▾ ]
Kategori      [ Semua                     ▾ ]
Visibilitas   ○ Semua  ○ Publik  ○ Privat
[ Reset ]                         [ Terapkan 3 filter ]
```

Desktop uses a popover/right sheet; mobile uses a bottom sheet. Filters query only after confirmation.

## 6. Transaction chooser

```text
Tambah transaksi
┌─────────────────┐ ┌─────────────────┐
│ ↓ Kas masuk     │ │ ↑ Kas keluar    │
└─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│ ⇄ Transfer      │ │ ◷ Utang         │
└─────────────────┘ └─────────────────┘
┌─────────────────┐
│ ◷ Piutang       │
└─────────────────┘
```

Opening balance stays in onboarding/account management rather than routine transaction entry.

## 7. Income/expense form

### Desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Tambah kas keluar                                  Draf belum disimpan    │
├─────────────────────────────────────────────────────────────────────────────┤
│       ┌─────────────────────────────────────────────────────────────┐       │
│       │ Nominal *      Rp [ 450.000______________________________ ] │       │
│       │ Rekening *        ( Kas Proyek ▾ )                          │       │
│       │ Saldo setelah transaksi: Rp12.050.000                       │       │
│       │ Tanggal *          [ 19/08/2026 ]                           │       │
│       │ Kategori *         ( Konsumsi ▾ )                           │       │
│       │ Pihak terkait      [ Warung Sejahtera____________________ ] │       │
│       │ Nomor referensi    [ KWT-018_____________________________ ] │       │
│       │ Catatan internal   [ Konsumsi rapat…_____________________ ] │       │
│       │ Lampiran           [ ＋ Tambah kuitansi ] Privat default    │       │
│       │ Visibilitas        ● Privat        ○ Publik                 │       │
│       │ Deskripsi publik   [____________________________________ ] │       │
│       │                           [ Batal ] [ Simpan kas keluar ]    │       │
│       └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Project defaults to current context but can change within scope.
- Account options update when project changes.
- Amount accepts localized input and stores minor units.
- Projected balance appears after a valid expense amount.
- Public description only appears when Public is selected.
- Internal notes never copy automatically into public description.
- Attachments remain private until explicitly approved.

### Mobile

```text
┌──────────────────────────────────────┐
│ ←  Tambah kas keluar                 │
├──────────────────────────────────────┤
│ Nominal *                            │
│ Rp [ 450.000                       ] │
│ Rekening *                           │
│ ( Kas Proyek ▾                     ) │
│ Saldo setelah: Rp12.050.000          │
│ Tanggal *                            │
│ [ 19/08/2026                       ] │
│ Kategori *                           │
│ ( Konsumsi ▾                       ) │
│ Pihak terkait                        │
│ [ Warung Sejahtera                 ] │
│ Nomor referensi                      │
│ [ KWT-018                          ] │
│ Catatan internal                     │
│ [ Konsumsi rapat…                  ] │
│ Lampiran                             │
│ [ ＋ Tambah kuitansi ]               │
│ Visibilitas                          │
│ [ 🔒 Privat ▾                      ] │
├──────────────────────────────────────┤
│ [ Batal ]       [ Simpan pengeluaran ]│
└──────────────────────────────────────┘
```

The sticky bar appears once dirty and stays above the keyboard.

### Validation

| Condition | Indonesian message |
|---|---|
| Missing amount | `Masukkan nominal transaksi.` |
| Amount ≤ 0 | `Nominal harus lebih besar dari Rp0.` |
| Missing account | `Pilih rekening.` |
| Missing category | `Pilih kategori.` |
| Invalid date | `Masukkan tanggal yang valid.` |
| Insufficient balance | `Saldo rekening tidak mencukupi untuk transaksi ini.` |
| Changed access | `Akses Anda ke rekening ini telah berubah. Pilih rekening lain.` |
| Duplicate retry | Show the existing saved transaction. |
| Save failure | Preserve input and show a persistent retry banner. |

Save is disabled and shows progress while pending.

## 8. Transaction detail

### Desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Detail transaksi                    ◎ Publik       [ Edit ] [ ⋯ ]         │
│   TRX-2026-0048 · Aktif                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │ Kas keluar                                │ │ Dampak saldo              │ │
│ │ -Rp450.000                                │ │ Kas Proyek                │ │
│ │ 19 Agu 2026 · 09:15 WIB                   │ │ 12.500.000 → 12.050.000   │ │
│ │ Kategori       Konsumsi                   │ │ Belum direkonsiliasi      │ │
│ │ Pihak terkait  Warung Sejahtera           │ │ Edit langsung diizinkan. │ │
│ │ Rekening       Kas Proyek                 │ └───────────────────────────┘ │
│ │ Referensi      KWT-018                    │                               │
│ └───────────────────────────────────────────┘ ┌───────────────────────────┐ │
│ ┌───────────────────────────────────────────┐ │ Pratinjau publik          │ │
│ │ Catatan internal                          │ │ 19 Agu · Konsumsi         │ │
│ │ Konsumsi rapat untuk 12 relawan.          │ │ -Rp450.000                │ │
│ └───────────────────────────────────────────┘ │ Konsumsi rapat            │ │
│ Lampiran: receipt-018.jpg · 🔒 Privat          └───────────────────────────┘ │
│ Riwayat audit                                                              │
│ ● Dibuat oleh Budi · 19 Agu 2026, 09:16                                    │
│ ● Visibilitas menjadi Publik · 19 Agu 2026, 09:20                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Direct edit appears only when permitted.
- Reconciled records show `Batalkan dan buat pengganti` instead.
- Cancellation requires a reason and previews financial impact.
- Audit before/after details are internal and permission-controlled.

### Mobile

```text
┌──────────────────────────────────────┐
│ ←  Detail transaksi              ⋯  │
│ TRX-2026-0048 · ● Aktif              │
├──────────────────────────────────────┤
│ Kas keluar                           │
│ -Rp450.000                           │
│ 19 Agu 2026 · 09:15 WIB              │
│ ◎ Publik                              │
│ DETAIL                               │
│ Kategori             Konsumsi        │
│ Rekening             Kas Proyek      │
│ Pihak terkait        Warung Sejahtera│
│ Referensi            KWT-018         │
│ DAMPAK SALDO                         │
│ Rp12.500.000 → Rp12.050.000          │
│ PRATINJAU PUBLIK                     │
│ Konsumsi · -Rp450.000                │
│ [ Lihat versi publik ]               │
│ LAMPIRAN                             │
│ receipt-018.jpg      🔒 Privat        │
│ RIWAYAT AUDIT                        │
│ ● Dibuat oleh Budi                   │
│ ● Visibilitas diubah                 │
├──────────────────────────────────────┤
│ [ Edit transaksi ]                   │
└──────────────────────────────────────┘
```

## 9. Correction and cancellation

### Reconciled banner

```text
Transaksi telah direkonsiliasi
Transaksi ini tidak dapat diedit langsung. Batalkan dan buat transaksi
pengganti tertaut agar jejak keuangan tetap utuh.
                                      [ Batalkan dan buat pengganti ]
```

### Cancellation dialog

```text
Batalkan transaksi?
Dampak pengeluaran Rp450.000 akan dihapus dari laporan dan saldo Kas
Proyek dihitung ulang. Catatan asli tetap ada dalam riwayat audit.

Alasan *
[ Salah memilih rekening____________________________________________ ]

[ Pertahankan ]                              [ Batalkan transaksi ]
```

### Replacement chain

```text
Rantai koreksi
TRX-0048  Dibatalkan
    ↓ digantikan oleh
TRX-0051  Aktif
[ Lihat transaksi asli ] [ Lihat pengganti ]
```

## 10. Shared states

- Dashboard empty: setup checklist with next action.
- Transactions empty: explanation plus `Tambah transaksi`.
- Filtered empty: explanation plus `Hapus filter`.
- Read-only: show `Anda memiliki akses lihat saja`.
- Save failure: preserve all data and show persistent `Coba lagi`.
- Skeletons preserve final geometry; no full-page spinner for core pages.
- Access denied does not expose entity details.

## 11. Accessibility and privacy

- Full keyboard support for navigation, rows, filters, dialogs, and forms.
- `Enter`/`Space` opens a focused transaction row.
- Dialog focus is trapped and restored to its trigger.
- `Escape` never silently discards a dirty form.
- Use Morfosis blue focus rings and visual focus order.
- Polite announcements cover save success, balance update, export readiness, and filter results.
- Validation summary receives focus and links to invalid fields.
- Account identifiers are masked by default.
- Public preview renders the real sanitized projection.
- Private data is excluded from public markup and client payloads.

## 12. Product assumptions represented

- IDR-only MVP.
- Negative balances prohibited by default.
- Owners can read private transactions but need treasurer scope to mutate.
- Public counterparty names hidden by default.
- Public balance publication controlled separately.
- Project and account restrictions use intersection.
- Attachments remain private unless approved per file.
- Opening balance belongs to onboarding/account management.

## 13. Next design pass

After approval, build one coded static prototype covering:

1. Desktop/mobile application shell
2. Dashboard
3. Transaction list and filters
4. Cash expense form with validation
5. Transaction detail
6. Public/private preview

Use representative Indonesian content and realistic values. Data can remain static; persistence, authentication, exports, attachments, and backend authorization are outside prototype scope.

## 14. Pusat Transaksi Terpadu

Semua aktivitas keuangan berada di satu halaman Transaksi. Pertanggungjawaban, utang, dan piutang bukan menu utama; semuanya merupakan jenis/filter pada daftar yang sama.

### Daftar dan filter jenis

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Transaksi             [ Cari transaksi… ] [ Filter ] [ Export ] [ + ]      │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Semua] [Kas masuk] [Kas keluar] [Transfer] [Utang] [Piutang]             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 25 Agu  ↓ Donasi Jumat                Bank Operasional   +Rp2.500.000       │
│ 24 Agu  ↗ Uang muka renovasi · Andi   Kas Proyek        -Rp3.000.000       │
│ 24 Agu  ✓ Realisasi cat · PTJ-38      Non-kas            Rp2.850.000       │
│ 23 Agu  ↩ Pengembalian · PTJ-37       Bank Operasional    +Rp500.000       │
│ 14 Agu  ◷ Utang sewa tenda            Non-kas            Rp1.800.000       │
└─────────────────────────────────────────────────────────────────────────────┘
```

Filter jenis mengubah daftar di tempat. Filter lanjutan periode, rekening, proyek, kategori, status, pihak terkait, dan visibilitas tetap berada pada halaman ini.

### Form adaptif dalam panel

Tombol `+ Transaksi` membuka right-pull sheet pada desktop dan panel penuh pada mobile:

```text
┌────────────────────────────────────────────┐
│ Tambah transaksi                         × │
│ Pilih jenis, lalu lengkapi form.            │
├────────────────────────────────────────────┤
│ [Masuk] [Keluar] [Transfer]                │
│ [Uang muka] [Utang] [Piutang]              │
├────────────────────────────────────────────┤
│ Form sesuai tab yang aktif                  │
│ ┌────────────────┐ ┌────────────────────┐  │
│ │ Nominal        │ │ Rekening          │  │
│ └────────────────┘ └────────────────────┘  │
│ ┌────────────────┐ ┌────────────────────┐  │
│ │ Tanggal        │ │ Kategori/Pihak    │  │
│ └────────────────┘ └────────────────────┘  │
│                                             │
│                     [ Batal ] [ Simpan ]    │
└────────────────────────────────────────────┘
```

- Tab berada di atas dan form langsung menyesuaikan di bawahnya.
- Berpindah tab tidak membuka halaman atau chooser lain.
- Tab dapat digunakan dengan keyboard dan memiliki selected/focus state.
- Floating label, field 44px, button compact, right sheet, status badge, spacing, dan responsive shell mengikuti Morfoschools.

## 15. Pertanggungjawaban Dana dalam Pusat Transaksi

### Flow inti

```text
Buat permintaan → Cairkan dana → Catat realisasi → Hitung selisih
→ Pengembalian / Tambahan bayar / Langsung selesai → Selesai
```

- Estimasi tidak mengubah kas.
- Pencairan adalah kas keluar tertaut, tetapi belum menjadi biaya aktual.
- Item realisasi dan nota menentukan biaya aktual.
- Pengembalian adalah kas masuk non-pendapatan.
- Tambahan bayar adalah reimbursement non-biaya agar biaya tidak dihitung dua kali.
- Semua aktivitas berada dalam satu timeline pertanggungjawaban.

### Daftar desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pertanggungjawaban               [ Cari anggota… ] [ Status ▾ ] [ + Baru ] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Belum dilaporkan      Menunggu kembali       Perlu dibayar                  │
│ Rp4.200.000 · 2       Rp500.000 · 1           Rp350.000 · 1                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Keperluan             Anggota       Dana       Realisasi   Selisih   Status │
│ Pembelian cat         Andi          3,0 jt     3,5 jt      -500 rb   Bayar  │
│ Konsumsi relawan      Siti          2,0 jt     1,5 jt      +500 rb   Kembali│
│ ATK rapat             Raka          750 rb     750 rb       0        Selesai│
└─────────────────────────────────────────────────────────────────────────────┘
```

Mobile menggunakan kartu dengan keperluan, anggota, selisih, status, dan satu action utama. Search dan filter tetap di header.

### Form permintaan dan pencairan

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Berikan dana ke anggota                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Anggota *              [ Andi Pratama_______________________________ ]      │
│ Keperluan *            [ Cat, kuas, thinner untuk renovasi aula_____ ]      │
│ Estimasi total *       Rp [ 3.000.000______________________________ ]      │
│ Target laporan *       [ 30/08/2026 ]                                      │
│ Rincian opsional       Cat 2,5 jt · Kuas 300 rb · Thinner 200 rb [ Edit ]  │
│                                                                             │
│ Rekening pencairan *   ( Kas Proyek ▾ )                                    │
│ Dana diberikan *       Rp [ 3.000.000______________________________ ]      │
│ Saldo setelah cair     Rp9.500.000                                         │
│                                  [ Simpan draf ] [ Cairkan dana & buat ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

Rincian estimasi bersifat opsional agar pencairan cepat. Mobile menggunakan satu kolom dan sticky action bar.

### Workspace detail

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Pembelian cat · Andi       PTJ-2026-0038      ● Perlu tambahan bayar     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Dana dicairkan ───── Realisasi dicatat ───── Selesaikan ───── Selesai      │
│                                                                             │
│ Estimasi       Dana tersedia       Realisasi aktual       Selisih           │
│ Rp3.000.000    Rp3.000.000         Rp3.500.000            -Rp500.000        │
│ ┌─────────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Realisasi                              │ │ Bayar kekurangan            │ │
│ │ Cat dinding · Nota ✓       2.850.000  │ │ Andi telah menalangi       │ │
│ │ Kuas & thinner · Nota ✓      650.000  │ │ Rp500.000                  │ │
│ │ [ + Tambah realisasi ]                 │ │ [ Bayar Rp500.000 ]        │ │
│ └─────────────────────────────────────────┘ └─────────────────────────────┘ │
│ Timeline: dana dicairkan → nota ditambah → biaya diperbarui                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

Panel kanan berubah otomatis:

- Selisih `0`: `Selesaikan pertanggungjawaban`.
- Selisih positif: `Catat pengembalian Rp…`.
- Selisih negatif: `Bayar kekurangan Rp…`.

Pengembalian dan reimbursement dapat sebagian. Setelah submit, outstanding dan status dihitung ulang.

### Validasi dan shared states

| Kondisi | Pesan |
|---|---|
| Anggota kosong | `Pilih anggota penerima dana.` |
| Keperluan kosong | `Jelaskan kebutuhan dana.` |
| Nominal pencairan kosong | `Masukkan dana yang diberikan.` |
| Dana melebihi saldo | `Saldo rekening tidak mencukupi.` |
| Realisasi kosong | `Tambahkan minimal satu realisasi sebelum menyelesaikan.` |
| Settlement melebihi outstanding | `Nominal melebihi selisih yang harus diselesaikan.` |
| Nota belum lengkap | `Lengkapi bukti atau tandai alasan bukti tidak tersedia.` |

- Draft mempertahankan input.
- Kegagalan save menampilkan retry tanpa menghapus data.
- Status dan warna selalu disertai label teks.
- Public preview mengecualikan nama anggota, nota, catatan internal, dan timeline audit.
- Dialog memulihkan fokus ke trigger; Escape tidak membuang form kotor.

# Backlog & Rencana Pengembangan FinFlo (TASKS.md)

Dokumen ini merangkum hasil investigasi menyeluruh terhadap arsitektur, kode, dan fitur FinFlo. Daftar tugas disusun berdasarkan prioritas implementasi untuk memandu pengembangan berkelanjutan.

---

## Prioritas 1: Kesiapan Produksi & Keamanan (High Priority)

### [SEC-01] Migrasi Manajemen Sesi ke HttpOnly Cookies & JWT
- **Latar Belakang:** Sesi otentikasi saat ini disimpan di `localStorage` (`finflo_auth_user`). Hal ini rentan terhadap eksploitasi XSS dan dapat dimanipulasi secara manual melalui konsol peramban.
- **Rencana Tindakan:**
  - Implementasikan pembuatan JWT token yang ditandatangani saat login/verifikasi.
  - Simpan token di dalam cookie dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure`.
  - Pasang middleware Next.js (`middleware.ts`) untuk memvalidasi token pada rute yang dilindungi.
- **Kriteria Selesai (DoD):** State otentikasi tersinkronisasi aman melalui cookie terenkripsi, data lokal tidak dapat dipalsukan.

### [SEC-02] Pembatasan Frekuensi Permintaan (Rate Limiting) pada API Autentikasi
- **Latar Belakang:** Endpoint `/api/auth/login`, `/api/auth/signup`, `/api/auth/resend-code`, dan `/api/auth/forgot-password` perlu dilindungi dari serangan *brute force*.
- **Rencana Tindakan:**
  - Tambahkan middleware pembatas frekuensi berbasis memori atau Redis (maksimal 5 percobaan per menit per IP).
  - Tampilkan pesan kesalahan bersahabat jika pengguna melebihi batas percobaan.
- **Kriteria Selesai (DoD):** Percobaan berulang di atas ambang batas menghasilkan status HTTP 429 Too Many Requests.

---

## Prioritas 2: Penyempurnaan Logika Finansial & Modul Hutang/Piutang (Core Logic)

### [DEBT-01] Riwayat Rinci Pembayaran per Tagihan (Payment History Modal)
- **Latar Belakang:** Pengguna ingin melihat jejak cicilan yang sudah dibayarkan untuk setiap kartu hutang/piutang (kapan dibayar, berapa nominalnya, dan dari dompet apa).
- **Rencana Tindakan:**
  - Buat komponen modal atau *drawer* riwayat cicilan untuk setiap kartu tagihan.
  - Query transaksi dengan filter `debtId = target.id` yang diurutkan dari yang terbaru.
  - Tampilkan tanggal, nominal cicilan, dan dompet yang digunakan.
- **Kriteria Selesai (DoD):** Pengguna dapat mengklik kartu hutang/piutang untuk melihat rincian riwayat cicilan masa lalu.

### [DEBT-02] Sistem Pengingat Jatuh Tempo (Due Date Notification)
- **Latar Belakang:** Keterlambatan membayar cicilan atau paylater sering berakibat pada denda administrasi.
- **Rencana Tindakan:**
  - Tambahkan banner notifikasi peringatan di bagian atas dashboard untuk tagihan yang jatuh tempo dalam H-3 atau hari ini.
  - Opsi pengiriman email pengingat harian otomatis untuk pengguna dengan status Pro jika ada tagihan mendekati jatuh tempo.
- **Kriteria Selesai (DoD):** Muncul pengingat visual yang jelas pada dashboard untuk tagihan mendesak.

### [TRX-01] Dukungan Biaya Admin pada Transaksi Transfer & Top-up
- **Latar Belakang:** Di Indonesia, transfer antar-bank atau top-up e-wallet sering dikenakan biaya admin (misal BI-Fast Rp 2.500 atau biaya top-up Rp 1.000). Kolom `fee` sudah ada pada tipe transaksi namun belum diaktifkan di antarmuka input modal.
- **Rencana Tindakan:**
  - Tambahkan input opsional "Biaya Admin" pada modal transaksi transfer antar-dompet.
  - Potong saldo dompet pengirim sebesar `amount + fee`, sementara saldo dompet penerima hanya bertambah sebesar `amount`.
- **Kriteria Selesai (DoD):** Biaya admin terpotong akurat pada dompet sumber tanpa menambah saldo dompet tujuan.

---

## Prioritas 3: Filter, Pencarian & Ekspor Data (Usability & Data Portability)

### [FILTER-01] Pencarian Teks & Filter Rentang Tanggal Kustom pada Riwayat Transaksi
- **Latar Belakang:** Tab Transaksi saat ini hanya memfilter berdasarkan bulan kalender tunggal (`YYYY-MM`).
- **Rencana Tindakan:**
  - Tambahkan bilah pencarian instan (*search bar*) berdasarkan judul deskripsi atau catatan transaksi.
  - Sediakan pemilih rentang tanggal kustom (*date range picker* dari tanggal A sampai tanggal B).
  - Tambahkan tombol pintas filter tipe transaksi (*Semua*, *Pemasukan*, *Pengeluaran*, *Transfer*).
- **Kriteria Selesai (DoD):** Pengguna dapat mencari transaksi tertentu secara instan tanpa harus berpindah-pindah bulan.

### [EXPORT-01] Ekspor Laporan ke Format CSV / Excel (.xlsx)
- **Latar Belakang:** Pengguna sering membutuhkan data keuangan mentah untuk kebutuhan pembukuan Excel atau pelaporan pajak SPT tahunan.
- **Rencana Tindakan:**
  - Buat modul pembangun berkas CSV/Excel di sisi peramban atau API.
  - Kolom meliputi: Tanggal, Tipe, Kategori, Nominal (Rp), Dompet Sumber, Dompet Tujuan, Deskripsi, dan Status.
- **Kriteria Selesai (DoD):** Tersedia tombol "Unduh CSV / Excel" di menu Profil atau Riwayat Transaksi.

### [EXPORT-02] Cetak Laporan Keuangan Bulanan Format PDF Siap Pakai
- **Latar Belakang:** Pengguna FinFlo Pro menginginkan ringkasan keuangan bulanan yang elegan untuk dokumentasi pribadi.
- **Rencana Tindakan:**
  - Susun template cetak HTML/CSS khusus cetak (`@media print`) yang memuat rekap arus kas, grafik alokasi anggaran, status pilar 50/30/20, dan daftar tagihan.
  - Sediakan tombol pintas "Cetak Laporan PDF" dengan hasil cetak rapi 1 hingga 2 halaman.
- **Kriteria Selesai (DoD):** Tampilan cetak PDF bebas dari elemen tombol navigasi, terformat bersih dan profesional.

---

## Prioritas 4: Pengalaman Seluler & Fitur Lanjutan (Mobile & Modern Features)

### [PWA-01] Konfigurasi Progressive Web App (PWA) & Kemampuan Offline
- **Latar Belakang:** Mayoritas pengguna mencatat pengeluaran harian melalui ponsel pintar mereka.
- **Rencana Tindakan:**
  - Buat berkas `manifest.json` lengkap dengan ikon resolusi tinggi (192px, 512px) dan warna tema FinFlo.
  - Daftarkan service worker sederhana untuk caching aset statis dan antarmuka dasar.
- **Kriteria Selesai (DoD):** Peramban seluler (Chrome/Safari) menampilkan opsi "Tambahkan ke Layar Utama" (Add to Home Screen) seperti aplikasi native.

### [REC-01] Fitur Transaksi Berulang Bulanan (Recurring Transactions)
- **Latar Belakang:** Pengeluaran rutin seperti sewa kos, langganan internet, tagihan BPJS, atau cicilan berulang setiap bulan di tanggal yang sama.
- **Rencana Tindakan:**
  - Buat tabel `RecurringTransaction` di Prisma dengan jadwal frekuensi (bulanan, mingguan).
  - Tampilkan daftar pengingat satu klik di Dashboard pada tanggal jatuh tempo untuk mencatat pengeluaran tanpa perlu mengetik ulang.
- **Kriteria Selesai (DoD):** Pengguna dapat mengonfirmasi pencatatan tagihan rutin dengan satu ketukan tombol.

### [A11Y-01] Standarisasi Aksesibilitas & Uji Kontras Warna
- **Latar Belakang:** Memastikan antarmuka ramah bagi semua pengguna termasuk mereka yang memiliki keterbatasan visual.
- **Rencana Tindakan:**
  - Pastikan seluruh elemen tombol interaktif memiliki `aria-label` yang deskriptif.
  - Uji rasio kontras teks pada Dark Mode dan Light Mode agar memenuhi standar WCAG 2.1 AA (minimal 4.5:1 untuk teks biasa).
- **Kriteria Selesai (DoD):** Seluruh alur utama dapat dinavigasi menggunakan keyboard dan pembaca layar secara mulus.

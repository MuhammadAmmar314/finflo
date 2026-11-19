# Panduan Lengkap Deployment FinFlo ke Vercel (Produksi Publik)

Dokumen ini memandu langkah demi langkah persiapan dan peluncuran FinFlo ke **Vercel** dengan basis data **PostgreSQL Cloud** agar siap diakses oleh publik secara aman, cepat, dan stabil.

---

## 1. Arsitektur Deployment Vercel

```
[Pengguna Publik]
       │
       ▼
 [Vercel Edge CDN] (SSL / HTTPS Otomatis, Kompresi, Asset Caching)
       │
       ▼
[Next.js 14 Serverless Functions] (Route Handlers & SSR)
       │
       ▼ (Prisma Client + Connection Pooling)
[Cloud PostgreSQL] (Neon Tech / Supabase / Vercel Postgres)
```

Karena Vercel berjalan pada lingkungan komputasi *serverless*, server basis data tidak boleh menggunakan `localhost:5432`. FinFlo memerlukan instans PostgreSQL cloud eksternal yang dapat diakses melalui internet dengan proteksi SSL (`sslmode=require`).

---

## 2. Langkah 1: Menyiapkan Basis Data Cloud (Gratis & Direkomendasikan)

Pilihlah salah satu penyedia PostgreSQL cloud berikut (keduanya menyediakan paket gratis tanpa kartu kredit):

### Pilihan A: Neon Database (Paling Direkomendasikan untuk Vercel)
1. Buka [https://neon.tech](https://neon.tech) dan masuk (*Sign up*) menggunakan akun GitHub Anda.
2. Klik **Create Project**, beri nama `finflo-db`, pilih region terdekat (misal `Singapore` / `ap-southeast-1`).
3. Setelah dibuat, salin **Connection String** yang disediakan:
   ```
   postgresql://username:password@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/finflo?sslmode=require
   ```

### Pilihan B: Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat project baru `finflo`.
2. Buka menu **Project Settings** > **Database**.
3. Salin Connection String bertipe **URI** (Connection Pooling mode Transaction pada port 6543 atau Session port 5432).

---

## 3. Langkah 2: Mendorong Skema Tabel ke Database Cloud

Sebelum deploy ke Vercel atau sesaat setelah mendapatkan Connection String cloud, buat seluruh 9 tabel FinFlo di database cloud tersebut.

Di komputer lokal Anda:
1. Buka terminal proyek FinFlo.
2. Jalankan perintah `db push` dengan menyertakan URL database cloud Anda:
   ```bash
   npx prisma db push --accept-data-loss
   ```
   *(Atau ubah sementara `DATABASE_URL` di `.env` lokal Anda ke URL cloud Neon, lalu jalankan `npx prisma db push`)*.
3. *(Opsional)* Jika ingin mengunggah data akun demo awal:
   ```bash
   npx prisma db seed
   ```
4. Seluruh tabel (`User`, `Wallet`, `ExpenseCategory`, `IncomeCategory`, `Transaction`, `SavingsGoal`, `Debt`, `VerificationCode`, `LicenseKey`) sekarang telah siap di cloud.

---

## 4. Langkah 3: Menyiapkan Repositori GitHub

Pastikan seluruh perubahan lokal telah tersimpan dan siap dipush ke GitHub:
1. Periksa status git:
   ```bash
   git status
   ```
2. Buat repositori baru di GitHub (misal `username/finflo`).
3. Hubungkan repositori lokal dan dorong kode ke GitHub:
   ```bash
   git remote add origin https://github.com/username/finflo.git
   git branch -M main
   git push -u origin main
   ```

---

## 5. Langkah 4: Menghubungkan Repositori ke Vercel

1. Masuk ke [https://vercel.com](https://vercel.com) menggunakan akun GitHub Anda.
2. Di dashboard Vercel, klik tombol **Add New...** > **Project**.
3. Pilih repositori `finflo` dari daftar repositori GitHub Anda dan klik **Import**.
4. Di bagian **Build and Output Settings**:
   - Framework Preset: `Next.js` (Otomatis terdeteksi).
   - Build Command: `prisma generate && next build` (Otomatis dari `package.json`).
   - Output Directory: `.next` (Default).
   - Install Command: `npm install` (Default).

---

## 6. Langkah 5: Mengisi Environment Variables di Vercel

Pada halaman konfigurasi proyek Vercel sebelum mengklik Deploy, buka accordion **Environment Variables** dan tambahkan variabel berikut:

| Nama Variabel | Wajib / Opsional | Contoh Nilai | Keterangan |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Wajib** | `postgresql://user:pass@ep-xyz.neon.tech/finflo?sslmode=require` | URL koneksi ke PostgreSQL cloud Anda |
| `NEXT_PUBLIC_APP_URL` | Opsional | `https://finflo.vercel.app` (atau domain kustom Anda) | URL dasar aplikasi untuk redirect publik |
| `NEXT_PUBLIC_LYNK_PRO_URL` | Opsional | `https://lynk.id/finflo/finflo-pro` | Tautan tombol upgrade paket Pro |
| `SMTP_HOST` | Opsional | `smtp.gmail.com` / `smtp.resend.com` | Host server SMTP untuk pengiriman OTP email |
| `SMTP_PORT` | Opsional | `587` | Port SMTP (587 untuk TLS atau 465 untuk SSL) |
| `SMTP_USER` | Opsional | `finflo.app@gmail.com` | Alamat email / username SMTP |
| `SMTP_PASS` | Opsional | `abcd efgh ijkl mnop` (App Password) | Password aplikasi akun email |
| `SMTP_FROM` | Opsional | `"FinFlo" <noreply@finflo.app>` | Alamat pengirim email yang tampil di inbox |

> **Catatan Pengiriman Email:** Jika variabel `SMTP_*` belum diisi saat rilis pertama, sistem FinFlo tidak akan crash. Sistem secara aman akan menjalankan simulasi lokal yang menampilkan kode OTP verifikasi pada konsol server dan banner notifikasi antarmuka.

---

## 7. Langkah 6: Klik Deploy & Verifikasi

1. Klik tombol **Deploy** di Vercel.
2. Vercel akan menjalankan:
   - `npm install`
   - `prisma generate` (Membuat klien Prisma khusus arsitektur serverless Linux)
   - `next build` (Mengompilasi 19 rute halaman dan API)
3. Setelah proses selesai (biasanya 1 hingga 2 menit), Vercel akan menampilkan animasi sukses dan memberikan URL publik aplikasi Anda (misal `https://finflo.vercel.app`).

---

## 8. Checklist Pengujian Pasca-Deploy (Public Launch Checklist)

Setelah website aktif di Vercel, lakukan uji verifikasi langsung pada URL publik:

- [ ] **1. Pemuatan Halaman:** Buka URL di peramban desktop dan ponsel, pastikan halaman termuat cepat tanpa error konsol.
- [ ] **2. Pendaftaran Akun Baru (*Sign Up*):** Coba buat akun baru menggunakan email riil.
- [ ] **3. Verifikasi Akun:** Masukkan kode OTP verifikasi 6-digit.
- [ ] **4. Manajemen Dompet:** Tambah dompet baru dan pastikan saldo tersimpan ke database cloud.
- [ ] **5. Catat Transaksi:** Tambah transaksi pengeluaran dan pemasukan, verifikasi perubahan saldo dompet.
- [ ] **6. Target Impian:** Tambah target baru, coba setor tabungan dan tarik dana tabungan, pastikan realisasi anggaran tidak berkurang.
- [ ] **7. Hutang & Piutang:** Tambah catatan piutang dengan opsi potong dompet, lalu coba terima pelunasan.
- [ ] **8. Uji Rollback Transaksi:** Hapus transaksi pembayaran cicilan, pastikan sisa tagihan hutang pulih otomatis.
- [ ] **9. Refresh Halaman (F5):** Tekan refresh berkali-kali untuk memastikan hidrasi data dari PostgreSQL cloud berjalan instan tanpa kehilangan data.
- [ ] **10. Tampilan Mode Gelap (Dark Mode):** Uji tombol ganti tema gelap dan terang pada menu profil.

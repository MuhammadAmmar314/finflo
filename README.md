# FinFlo - Modern Financial Planner & Cashflow Tracker (Next.js & Prisma)

Aplikasi Financial Planner modern, interaktif, responsif, dengan arsitektur **Database PostgreSQL via Prisma ORM** yang siap dideploy langsung ke **Vercel**.

![FinFlo Preview](/assets/reference-mockup.jpg)

---

## 🚀 Arsitektur Database & Backend

FinFlo menggunakan **Prisma ORM** dengan database relasional **PostgreSQL** (didukung penuh oleh **Vercel Postgres**, **Neon**, **Supabase**, atau database PostgreSQL lokal):

- **Data Models:**
  - `User`: Akun pengguna, level paket (`free`/`pro`), dan sesi autentikasi.
  - `Wallet`: Manajemen dompet (Cash, Bank, E-Wallet) dengan sinkronisasi saldo otomatis.
  - `ExpenseCategory`: Kategori pengeluaran dengan alokasi persentase budgeting (maksimal 100%).
  - `IncomeCategory`: Kategori pemasukan (Gaji, Bonus, Freelance, dll).
  - `Transaction`: Pencatatan arus kas (Expense, Income, Transfer) yang dikelola secara atomik (`prisma.$transaction`).
  - `Debt`: Pelacakan tagihan Paylater, Hutang, dan Piutang terurut berdasarkan jatuh tempo terdekat.

- **RESTful API Endpoints (`app/api/`):**
  - `/api/auth/me`: Verifikasi & pendaftaran sesi pengguna.
  - `/api/wallets`: Operasi CRUD dompet & validasi kuota Free Tier.
  - `/api/categories`: Operasi CRUD kategori & validasi alokasi kuota $\le 100\%$.
  - `/api/transactions`: Pencatatan transaksi dan penyesuaian saldo dompet atomik.
  - `/api/debts`: Pelacakan tagihan & pembayaran cicilan potong saldo dompet.
  - `/api/sync`: Sinkronisasi massal data client ke database cloud.

- **Client Resilience:**
  - Menggunakan arsitektur *offline-first & optimistic updates*: aplikasi tetap berfungsi cepat dan mulus menggunakan penyimpanan lokal (`localStorage`) serta otomatis menyinkronkan data ke PostgreSQL saat server database terhubung.

---

## ⚙️ Konfigurasi Database (`DATABASE_URL`)

Salin berkas `.env.example` menjadi `.env.local` dan masukkan string koneksi database PostgreSQL Anda:

```bash
cp .env.example .env.local
```

### 1. Vercel Postgres / Neon (Gratis & Direkomendasikan untuk Vercel)
Buat database di [Neon.tech](https://neon.tech) atau Vercel Dashboard ➔ Storage ➔ Postgres:
```env
DATABASE_URL="postgresql://user:password@ep-sample-123456.us-east-1.aws.neon.tech/finflo?sslmode=require"
```

### 2. Supabase
Buat project di [Supabase.com](https://supabase.com):
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 3. PostgreSQL Lokal
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finflo?schema=public"
```

---

## 🛠️ Perintah Database (Prisma CLI)

```bash
# Generate Prisma Client
npm run db:generate

# Dorong skema database ke database aktif (tanpa perlu migrate file)
npm run db:push

# Isi database dengan data demo awal (Budi Pratama, BCA, GoPay, transaksi, tagihan)
npm run db:seed

# Buka Prisma Studio (GUI database visual di browser)
npx prisma studio
```

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka aplikasi di peramban
# http://localhost:3000
```

---

## ☁️ Panduan Deploy ke Vercel

1. Push repository ke GitHub:
   ```bash
   git add .
   git commit -m "feat: database foundation with Prisma and PostgreSQL"
   git push origin main
   ```
2. Di Vercel Dashboard, buat **New Project** dari repositori GitHub ini.
3. Tambahkan environment variable `DATABASE_URL` di pengaturan Vercel (Project Settings ➔ Environment Variables).
4. Klik **Deploy**! Skrip `postinstall` di `package.json` akan otomatis menjalankan `prisma generate` saat proses build Vercel.

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 FinFlo. Dibuat untuk distribusi produk digital (Lynk.id) dan penggunaan komersial.

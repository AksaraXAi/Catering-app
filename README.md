# CateringApp - White-Label Multi-Tenant Catering Management System

Aplikasi web full-stack modern untuk manajemen usaha catering, pemesanan online oleh pelanggan via link khusus (`/catering/slug`), dashboard pemilik, kalender acara, produksi harian, kalkulasi bahan baku & resep, manajemen pengiriman dengan integrasi WhatsApp & Google Maps, serta laporan omzet dan ekspor CSV.

---

## 🚀 Fitur Utama

1. **Halaman Publik Pelanggan (`/catering/:slug`)**:
   - Branding usaha (Logo, Nama, Deskripsi, No. WA, Alamat).
   - Katalog menu dengan foto, harga porsi, & kategori.
   - Formulir pemesanan interaktif (porsi, tanggal acara, jam kirim, nama, WA, alamat, catatan).
   - Auto-fill data pelanggan lama berdasarkan nomor WhatsApp.
   - Halaman konfirmasi pesanan instan dengan nomor order, rincian DP, sisa tagihan, dan tombol WhatsApp langsung.

2. **Dashboard Pemilik Catering**:
   - Ringkasan statistik (Total order, order hari ini, order mendatang, omzet, piutang, status proses).
   - **Manajemen Order**: Filter status, ubah detail, catat pembayaran bertahap, cetak invoice digital.
   - **Kalender Order**: Tampilan kalender interaktif dengan indikator beban/peringatan jika pesanan membludak di hari yang sama.
   - **Menu & Paket**: Tambah, edit, hapus, upload gambar lokal, toggle status aktif.
   - **Data Pelanggan**: Riwayat order per pelanggan, kontak cepat WhatsApp.
   - **Pembayaran**: Tracking DP, pelunasan, sisa pembayaran, dan riwayat mutasi.
   - **Produksi**: Rekap harian jumlah porsi box yang harus dimasak berdasarkan tanggal acara.
   - **Bahan Baku & Resep**: Kalkulasi otomatis kebutuhan bahan (beras, ayam, telur, box) vs stok gudang & kekurangan belanja.
   - **Pengiriman (Delivery)**: Daftar jadwal kirim hari ini, tombol chat WhatsApp, dan tombol navigasi Google Maps.
   - **Laporan & Analytics**: Grafik omzet harian/mingguan/bulanan, menu terlaris, piutang, serta tombol **Export CSV**.
   - **Pengaturan Usaha**: Ubah info catering, slug URL, info rekening, dan warna tema.

3. **Multi-Tenant & Super Admin**:
   - Isolasi data ketat berdasarkan `tenantId`.
   - Super Admin dapat membuat, mengedit, dan menonaktifkan tenant catering.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, REST API
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Auth**: JWT (JSON Web Token), bcrypt password hashing
- **File Upload**: Multer (Local disk storage `/uploads`)
- **Containerization**: Docker, Docker Compose, Nginx Reverse Proxy

---

## 📁 Struktur Direktori

```text
cateringapp/
├── prisma/
│   ├── schema.prisma                  # Skema database PostgreSQL
│   ├── seed.ts                        # Script seeding data demo
│   └── migrations/                    # File migrasi database SQL
├── server/
│   ├── db.ts                          # Database layer (Prisma + Local fallback engine)
│   ├── auth.ts                        # Middleware & JWT generator
│   ├── seed-data.ts                   # Data inisial demo Bu Siti
│   └── routes/
│       ├── auth.ts                    # Login & session
│       ├── tenants.ts                 # Multi-tenant CRUD
│       ├── menus.ts                   # Paket & menu
│       ├── orders.ts                  # Pesanan & kalkulasi
│       ├── customers.ts               # Database pelanggan
│       ├── payments.ts                # Pembayaran & pelunasan
│       ├── production.ts              # Rekap porsi produksi
│       ├── ingredients.ts             # Stok bahan & resep kalkulator
│       ├── delivery.ts                # Pengiriman & kurir
│       ├── reports.ts                 # Omzet & CSV export
│       └── upload.ts                  # Upload foto lokal
├── src/
│   ├── api/client.ts                  # REST API client
│   ├── context/AuthContext.tsx        # Auth state management
│   ├── components/                    # Modal, Navbar, Sidebar, Invoice, Badge
│   └── pages/
│       ├── public/                    # Halaman order pelanggan & konfirmasi
│       └── admin/                     # Seluruh modul dashboard pemilik
├── uploads/                           # Direktori upload file gambar
├── Dockerfile                         # Build container produksi
├── docker-compose.yml                 # Orkestrasi Node.js + PostgreSQL + Nginx
├── nginx.conf                         # Reverse proxy config
└── package.json
```

---

## 🖥️ Panduan Deployment di VPS Linux Ubuntu (Step-by-Step)

Ikuti langkah-langkah berikut untuk menjalankan CateringApp di VPS Ubuntu 20.04 / 22.04 / 24.04:

### 1. Install Docker & Docker Compose di VPS

Login via SSH ke VPS Anda:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user ke grup docker
sudo usermod -aG docker $USER
newgrp docker

# Pastikan Docker & Compose terinstall
docker --version
docker compose version
```

### 2. Clone atau Upload Source Code ke VPS

```bash
# Buat direktori aplikasi
mkdir -p /var/www/cateringapp
cd /var/www/cateringapp

# Upload file proyek Anda (via Git, SFTP, atau rsync)
# Contoh via Git:
# git clone <repo_url> .
```

### 3. Konfigurasi File `.env`

Salin contoh environment dan sesuaikan secret:
```bash
cp .env.example .env
nano .env
```

Isi variabel penting:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=PasswordDatabaseKuatAnda123!
POSTGRES_DB=catering_db

DATABASE_URL="postgresql://postgres:PasswordDatabaseKuatAnda123!@db:5432/catering_db?schema=public"
JWT_SECRET="kunci_rahasia_jwt_produksi_cateringapp_acak_panjang"
PORT=3000
NODE_ENV=production
APP_URL="http://domaincateringanda.com"
```

### 4. Jalankan Aplikasi dengan Docker Compose

Cukup jalankan satu perintah:
```bash
docker compose up -d --build
```
Perintah ini akan secara otomatis:
- Menjalankan container PostgreSQL 16
- Menunggu database sehat
- Membangun container aplikasi Node.js (React dist + Express server)
- Menjalankan `prisma migrate deploy` untuk membuat tabel
- Menjalankan `prisma seed` untuk mengisi data demo "Catering Bu Siti"
- Menjalankan Nginx reverse proxy di port 80

### 5. Memeriksa Status Container & Log

```bash
# Lihat status container
docker compose ps

# Lihat log aplikasi secara real-time
docker compose logs -f app
```

### 6. Akun Login Bawaan (Demo Seed)

Setelah instalasi selesai, buka browser di alamat IP atau domain VPS Anda:
- **Halaman Pemilik Catering**: `http://IP_VPS/` atau klik menu "Login Pemilik"
  - **Email**: `busiti@catering.com`
  - **Password**: `password123`
- **Halaman Publik Pelanggan**: `http://IP_VPS/catering/busiti`
- **Super Admin (Kelola Semua Catering)**:
  - **Email**: `admin@cateringapp.com`
  - **Password**: `password123`

### 7. Pengaturan SSL / HTTPS (Let's Encrypt dengan Certbot)

Jika Anda mengarahkan domain (misal `cateringapp.com`):
```bash
sudo apt install -y certbot python3-certbot-nginx
# Stop sementara nginx container jika ingin generate certbot standalone:
# certbot certonly --standalone -d cateringapp.com
```
Atau pasang Certbot langsung di host dan arahkan proxy ke `http://127.0.0.1:3000`.

### 8. Cara Update Aplikasi ke Versi Baru

Ketika ada pembaruan kode:
```bash
cd /var/www/cateringapp
git pull origin main
docker compose build app
docker compose up -d app
docker compose exec app npx prisma migrate deploy
```

### 9. Cara Backup Database PostgreSQL

Untuk mencadangkan data harian:
```bash
# Export file dump SQL
docker compose exec -T db pg_dump -U postgres catering_db > backup_$(date +%F_%H%M%S).sql

# Untuk restore jika diperlukan:
# docker compose exec -T db psql -U postgres -d catering_db < backup_file.sql
```

### 10. Cara Menjalankan Secara Lokal untuk Pengembangan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan Prisma generate
npx prisma generate

# 3. Jalankan development server
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---
© 2026 CateringApp. All Rights Reserved.

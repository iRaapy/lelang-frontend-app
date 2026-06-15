# Lelang App — Frontend (Vue 3)

Frontend SPA untuk platform lelang daring realtime, dibangun dengan Vue 3 (Composition API), Vite, Pinia, Vue Router, Laravel Echo, dan Axios.

## Anggota Kelompok

| NIM | Nama |
|-----|------|
| 2401010013 | I Rai Agus Aditya Prayuda |
| 2401010011 | Ni Putu Reina Puspita |
| 2401010008 | Dewa Ayu Manisha Candra |

## Tech Stack

- Vue 3 (Composition API) + Vite
- Vue Router — navigasi antar halaman
- Pinia — state management (auth & auctions)
- Laravel Echo + pusher-js — koneksi WebSocket ke Laravel Reverb
- Axios — konsumsi REST API

## Fitur

- Registrasi, login, logout (terintegrasi Sanctum token-based)
- Daftar lelang dengan filter status (Semua/Aktif/Terjadwal/Selesai) dan pencarian
- Detail lelang dengan:
  - Harga tertinggi & countdown waktu realtime
  - Riwayat penawaran yang ter-update otomatis tanpa refresh (via WebSocket)
  - Notifikasi outbid realtime (banner)
  - Pengumuman pemenang realtime saat lelang berakhir
  - Jumlah penonton aktif (presence channel)
  - Tombol "Beli Sekarang" (Buy Now) jika tersedia
- Dashboard "Lelang Saya": buat, edit, hapus lelang (hanya saat status `scheduled`), upload multi-foto

## Prasyarat

- Node.js >= 18
- npm
- Backend Laravel (`aplikasi_lelang`) sudah berjalan — lihat README backend untuk instalasi

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/iRaapy/lelang-frontend.git
cd lelang-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi environment

```bash
copy .env.example .env
```

Edit `.env`, sesuaikan dengan konfigurasi backend:

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=lelangkey
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

> Nilai `VITE_REVERB_*` harus **sama persis** dengan konfigurasi `REVERB_*` di `.env` backend.

## Menjalankan Aplikasi (Development)

Pastikan backend (`aplikasi_lelang`) sudah berjalan dengan 4 proses berikut (lihat README backend):
- `php artisan serve`
- `php artisan reverb:start`
- `php artisan queue:work`
- `php artisan schedule:work`

Lalu jalankan frontend:

```bash
npm run dev
```

Aplikasi tersedia di `http://localhost:5173`.

## Akun Demo

Gunakan akun hasil seeder backend:

| Role | Email | Password |
|------|-------|----------|
| Penjual | penjual@demo.com | password |
| Penawar 1 | penawar1@demo.com | password |
| Penawar 2 | penawar2@demo.com | password |

## Struktur Folder
src/

├── api/

│   └── axios.js          # Konfigurasi Axios + interceptor token

├── echo/

│   └── echo.js            # Konfigurasi Laravel Echo (Reverb)

├── stores/

│   ├── auth.js            # Pinia: autentikasi & koneksi Echo

│   └── auctions.js        # Pinia: state lelang, bid, realtime update

├── router/

│   └── index.js           # Vue Router + auth guard

├── views/

│   ├── LoginView.vue

│   ├── RegisterView.vue

│   ├── AuctionListView.vue     # Daftar lelang

│   ├── AuctionDetailView.vue   # Detail + bidding realtime

│   ├── AuctionFormView.vue     # Create/edit lelang

│   └── MyAuctionsView.vue      # Dashboard penjual

├── components/

│   ├── CountdownTimer.vue

│   └── BidList.vue

├── App.vue

├── main.js

└── style.css              # Design system global

## Realtime: Kanal WebSocket yang Digunakan

| Kanal | Tipe | Event | Fungsi |
|-------|------|-------|--------|
| `auction.{id}` | Private | `BidPlaced`, `AuctionEnded` | Update harga, bid list, countdown, pemenang |
| `App.Models.User.{id}` | Private | `BidderOutbid` | Notifikasi personal saat tergeser |
| `presence-auction.{id}` | Presence | - | Jumlah penonton aktif |

## Build untuk Production

```bash
npm run build
```

Output akan tersedia di folder `dist/`.

## Catatan

- Pastikan backend CORS (`config/cors.php`) mengizinkan origin frontend (`FRONTEND_URL` di `.env` backend harus sama dengan URL frontend, contoh `http://localhost:5173`).
- Validasi penawaran (bid) dilakukan di sisi server; frontend hanya menampilkan pesan error dari API.
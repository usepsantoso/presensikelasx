# 📋 Sistem Presensi Kelas X - SMA Regina Pacis Surakarta

Aplikasi web presensi digital modern untuk siswa Kelas X SMA Regina Pacis Surakarta (Tahun Ajaran 2026/2027), dilengkapi dengan tanda tangan digital siswa, rekapitulasi data kehadiran dengan proteksi password admin, dan integrasi Google Spreadsheet sebagai database cloud rekapan presensi.

---

## 🌟 Fitur Utama

1. **Formulir Presensi Siswa**:
   - Pemilihan Kelas X lengkap (Kelas X A hingga X J)
   - Nomor Absen otomatis (1 s.d 38)
   - Status Kehadiran: **Hadir**, **Izin**, **Sakit**, dan **Alpha**
   - Kolom alasan/keterangan dinamis untuk siswa yang izin atau sakit
   - Tanggal otomatis terkunci sesuai hari aktif
   - **Tanda Tangan Digital Siswa** langsung dari layar smartphone atau komputer

2. **Rekapitulasi Kehadiran & Dashboard Admin**:
   - Terproteksi kode akses / PIN Admin
   - Ringkasan statistik kehadiran secara real-time
   - Filter berdasarkan Kelas (X A - X J) dan Status kehadiran
   - Pencarian berdasarkan Nama Siswa atau Nomor Absen
   - Pratinjau tanda tangan digital siswa
   - **Ekspor Data ke CSV / Excel**
   - Fitur Cetak (Print View) laporan presensi

3. **Database Google Spreadsheet (Cloud Sync)**:
   - Terhubung langsung dengan akun Google Anda menggunakan Google Sheets API
   - Otomatis membuat dokumen Google Spreadsheet: *"Presensi Kelas X - SMA Regina Pacis Surakarta"*
   - Pengiriman presensi baru otomatis tersimpan dan tertulis ke baris Google Sheet
   - Fitur **"Sinkronkan ke Sheet"** untuk sinkronisasi seluruh data ke cloud
   - Fitur **"Tarik dari Sheet"** untuk mengambil data terbaru dari Google Spreadsheet

---

## 🚀 Cara 1: Deploy Cepat via GitHub Pages (Tanpa Perlu Terminal/Node.js)

Metode ini adalah cara paling instan dan mudah:
1. Buka aplikasi, klik tombol **"Panduan & Deploy GitHub"**.
2. Klik tombol **"Unduh Standalone index.html"**.
3. Buka akun GitHub Anda dan buat repository baru di [github.com/new](https://github.com/new):
   - Masukkan nama repository (contoh: `presensi-regina-pacis`).
   - Pilih opsi **Public**.
   - Klik **Create repository**.
4. Di halaman repository, pilih tautan **"uploading an existing file"**.
5. Tarik dan lepas (drag & drop) file `index.html` yang baru diunduh.
6. Klik tombol hijau **Commit changes**.
7. Masuk ke tab **Settings** > menu **Pages** di sebelah kiri.
8. Pada bagian **Build and deployment** > pilih Branch: `main` (folder: `/root`), lalu klik **Save**.
9. Tunggu 1–2 menit, website Anda sudah aktif di:
   `https://<username-github>.github.io/presensi-regina-pacis/`

---

## 💻 Cara 2: Push Repository Lengkap (Vite + React + TypeScript)

Jika Anda ingin mengelola seluruh kode sumber Vite React:

### 1. Inisialisasi Git Lokal
```bash
git init
git add .
git commit -m "feat: Sistem Presensi Kelas X SMA Regina Pacis Surakarta"
git branch -M main
```

### 2. Hubungkan ke Repository GitHub
Buat repository baru di GitHub, lalu hubungkan dengan perintah:
```bash
git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPOSITORY>.git
git push -u origin main
```

### 3. Aktifkan GitHub Actions untuk GitHub Pages
File otomatisasi telah tersedia di `.github/workflows/deploy.yml`.
- Masuk ke repository GitHub > **Settings** > **Pages**
- Pada **Source**, ubah dari *Deploy from a branch* menjadi **GitHub Actions**
- Setiap kali Anda push ke branch `main`, GitHub akan otomatis membangun dan merilis website presensi Anda!

---

## 🛠️ Pengembangan Lokal (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Akses di browser
# Buka http://localhost:3000
```

---

## 🏫 Identitas Sekolah
- **Institusi**: SMA Regina Pacis Surakarta
- **Alamat**: Jl. Adi Sucipto No.45, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57143
- **Semangat**: *Serviam* (Aku Mengabdi)
- **Motto**: *Growing Meaningfully, Impacting Lives*

# Panduan Deploy KawruhBhumi Lab

Panduan ini ditulis untuk orang yang **belum pernah deploy website**. Tidak perlu
tahu server, Docker, atau konfigurasi jaringan. KawruhBhumi Lab adalah situs statis:
setelah di-build, isinya hanya HTML, CSS, JavaScript, font, dan gambar. Tidak ada
database, API, atau kunci rahasia.

> Inti alurnya: **build → unggah folder `dist/` → selesai.**
> Routing memakai `HashRouter` (alamat berawalan `#/`), jadi tidak perlu aturan
> rewrite di hosting mana pun.

---

## 0. Yang perlu disiapkan

1. **Akun GitHub** (gratis) — untuk menyimpan kode dan menghubungkannya ke
   hosting. Buat di <https://github.com/signup>.
2. **Akun Vercel** (gratis) — <https://vercel.com/signup>. Daftar dengan akun
   GitHub agar repositori bisa langsung dipilih.
3. **Node.js versi 22 atau lebih baru** di komputer — <https://nodejs.org>
   (pilih LTS). Cek dengan:

   ```bash
   node -v
   npm -v
   ```

4. Folder proyek KawruhBhumi Lab yang berisi `package.json`.

Tidak perlu kartu kredit. Paket gratis Vercel cukup untuk proyek ini.

---

## 1. Uji build di komputer sendiri

Buka terminal di folder proyek, lalu jalankan:

```bash
npm install
npm run build
```

Jika berhasil, akan muncul folder **`dist/`**. Folder inilah yang akan
di-deploy — bukan seluruh folder proyek.

Uji hasilnya secara lokal:

```bash
python3 -m http.server 8080 --directory dist
```

Buka <http://localhost:8080>. Jika halaman muncul dan simulator berjalan,
build sudah benar. Uji juga lebar ponsel (±390px): tombol **Controls** harus
membuka bottom sheet, tombol Close/Escape menutupnya, dan grafik tetap menjadi
fokus utama.

### 1.1 Single-file HTML (opsional)

Untuk distribusi satu berkas:

```bash
npm run build:single
```

Hasilnya adalah **`dist-single/index.html`** dengan seluruh JavaScript, CSS, dan
font di dalamnya. Worker inversi HVSR juga di-inline, jadi tidak ada berkas
worker terpisah. Sajikan tetap lewat server lokal:

```bash
python3 -m http.server 8080 --directory dist-single
```

> Jangan membuka `dist/index.html` dengan klik dua kali. Browser modern
> memblokir modul JavaScript dari `file://`, sehingga halaman akan kosong.
> Selalu lewat server (contoh di atas) atau hosting.

### 1.2 Verifikasi rilis R6

Build final v2.7 sudah melewati pemeriksaan berikut sebelum disinkronkan ke
cermin D::

- 178/178 tes, `npx tsc -b`, lint, `build`, dan `build:single` lulus;
- worker inversi HVSR berjalan inline di `dist/` dan `dist-single/` tanpa
  berkas worker eksternal;
- CSV/PNG di ketujuh workspace dan worksheet/kunci jawaban guru terunduh valid;
- panduan pengguna PDF EN/ID (22 halaman, ber-bookmark) terunduh dari beranda dan tersedia di
  `dist/guides/` maupun `dist-single/guides/`;
- PDF ketujuh workspace 4–5 halaman, memuat ringkasan grafik, tanpa toolbar
  Plotly atau teks petunjuk cetak;
- seluruh rute utama pada 390px tanpa target kecil, overflow, atau error
  konsol; single-file GPR/HVSR juga bersih.

Jika Anda mengubah kode setelah titik ini, jalankan ulang perintah pada
bagian 1 dan checklist bagian 8 sebelum men-deploy.

---

## 2. Unggah kode ke GitHub

Jika proyek belum berupa repositori Git:

```bash
git init
git add .
git commit -m "KawruhBhumi Lab"
git branch -M main
```

Buat repositori baru di GitHub (tombol **New repository**), beri nama misalnya
`kawruhbhumi-lab`, **jangan** centang "Add a README" (kita sudah punya), lalu
salin perintah yang muncul. Contoh:

```bash
git remote add origin https://github.com/NAMA-ANDA/kawruhbhumi-lab.git
git push -u origin main
```

Segarkan halaman GitHub — semua berkas proyek harus terlihat. Folder
`node_modules/` dan `dist/` tidak perlu diunggah (sudah diabaikan `.gitignore`);
hosting akan membuat build sendiri.

---

## 3. Deploy ke Vercel (cara termudah, gratis)

### 3.1 Lewat dashboard (disarankan)

1. Masuk ke <https://vercel.com> lalu klik **Add New… → Project**.
2. Di daftar **Import Git Repository**, pilih repositori `kawruhbhumi-lab`.
   Jika belum muncul, klik **Adjust GitHub App Permissions** dan beri akses ke
   repositori tersebut.
3. Vercel biasanya mendeteksi Vite otomatis. Pastikan pengaturannya:

   | Pengaturan | Nilai |
   | --- | --- |
   | Framework Preset | **Vite** |
   | Root Directory | `.` (biarkan kosong/default) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
   | Node.js Version | **22.x** atau **24.x** |

4. Klik **Deploy**. Tunggu 1–3 menit.
5. Setelah selesai muncul tautan seperti
   `https://kawruhbhumi-lab-xxxx.vercel.app`. Buka tautannya.

### 3.2 Lewat terminal (alternatif)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Saat ditanya, terima nilai default; pastikan **Output Directory** diisi `dist`.
Perintah ini mengunggah proyek dan membuat URL produksi.

### 3.3 Memperbarui situs

Setiap kali kode di-push ke GitHub, Vercel otomatis membuat build baru:

```bash
git add .
git commit -m "Perbarui konten"
git push
```

Tidak ada langkah unggah manual.

---

## 4. Alternatif hosting gratis

### Netlify

**Cara drag-and-drop (tanpa GitHub):**

1. Jalankan `npm run build` di komputer.
2. Buka <https://app.netlify.com/drop>.
3. Seret folder **`dist`** ke halaman tersebut.
4. Selesai — Netlify memberi URL. Untuk memperbarui, ulangi langkah ini dan
   seret folder `dist` yang baru.

**Lewat GitHub:** **Add new site → Import an existing project**, pilih repo,
lalu isi Build command `npm run build` dan Publish directory `dist`.

### Cloudflare Pages

1. Masuk ke <https://dash.cloudflare.com> → **Workers & Pages → Create →
   Pages → Connect to Git**.
2. Pilih repositori.
3. Build command: `npm run build`; Build output directory: `dist`.
4. Klik **Save and Deploy**.

### Server statis / kampus

Salin **isi** folder `dist/` ke direktori web server (misalnya
`/var/www/kawruhbhumi-lab/`). Tidak ada konfigurasi khusus. Jika memakai Nginx:

```nginx
server {
    listen 80;
    server_name contoh.domain.ac.id;
    root /var/www/kawruhbhumi-lab;
    index index.html;
}
```

Karena routing berbasis hash (`#/teori/...`), tidak diperlukan `try_files`
untuk SPA.

---

## 5. Hal yang sering salah

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Halaman kosong saat dibuka lokal | Membuka `index.html` via `file://` | Jalankan server statis (bagian 1) |
| Build gagal: `tsc: not found` | `npm install` belum dijalankan | Jalankan `npm install` |
| Build gagal: versi Node terlalu lama | Node < 22 | Pasang Node 22/24, atau atur Node.js Version di Vercel |
| Tampilan tanpa CSS / grafik kosong | Output Directory salah | Pastikan `dist`, bukan root proyek |
| 404 saat refresh halaman dalam | Seharusnya tidak terjadi dengan `#/` | Pastikan URL memakai `#/`, mis. `/teori` → `/#/teori` |
| Font/grafik lambat saat pertama dibuka | Plotly dimuat malas (lazy) | Normal; muat berikutnya lebih cepat |

---

## 6. Domain sendiri (opsional)

Di Vercel: **Project → Settings → Domains → Add**, masukkan domain, lalu ikuti
instruksi DNS dari penyedia domain. HTTPS disediakan otomatis. Untuk keperluan
akademik, subdomain seperti `kawruhbhumi.namakampus.ac.id` juga bisa.

---

## 7. Keamanan dan rahasia

- Proyek ini **tidak memakai API key, token, atau environment variable**.
- Jangan pernah menaruh kata sandi/ token di kode atau di repositori publik.
- Jika suatu saat menambahkan layanan pihak ketiga, simpan kuncinya di menu
  **Environment Variables** hosting, bukan di Git.

---

## 8. Checklist sebelum menyerahkan tautan

- [ ] `npx tsc -b`, `npm run lint`, `npm test` lulus.
- [ ] `npm run build` dan `npm run build:single` selesai tanpa error.
- [ ] Halaman utama, `#/metode`, `#/teori`, dan ketujuh simulator terbuka.
- [ ] Toggle EN/ID berfungsi dan bertahan setelah refresh.
- [ ] Ekspor CSV/PNG berfungsi di workspace; worksheet/kunci jawaban terunduh.
- [ ] Panduan pengguna PDF EN dan ID terunduh dari beranda.
- [ ] Inversi HVSR selesai dan menampilkan “Inversion result”.
- [ ] Cetak salah satu workspace menghasilkan PDF dengan ringkasan grafik.
- [ ] Tautan `#/disclaimer` dan alamat email tampil.
- [ ] URL produksi diuji dari ponsel (mode data seluler, bukan hanya Wi-Fi).

Selesai. Jika ada langkah yang membingungkan, kirim tangkapan layar pesan error
ke **kholis.nh3@gmail.com**.

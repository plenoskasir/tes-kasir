# 📋 PANDUAN INTEGRASI FITUR BARU — Abunawas Kasir
## Semua perubahan sesuai daftar Final Optimasi Sistem Kasir & Dashboard

---

## CARA PASANG (3 langkah)

### Langkah 1 — Upload file ke repo GitHub

Upload 2 file ini ke root repo `plenoskasir/tes-kasir`:
- `addon-features.js`
- `addon-styles.css`

### Langkah 2 — Tambahkan di `index.html`

Di bagian `<head>`, tepat sebelum `<link rel="stylesheet" href="style.css">`:
```html
<link rel="stylesheet" href="addon-styles.css">
```

Di bagian akhir `<body>`, sebelum `</body>`:
```html
<script src="addon-features.js"></script>
```

### Langkah 3 — Tambahkan HTML snippets di bawah ini ke index.html

---

## HTML SNIPPETS YANG PERLU DITAMBAHKAN KE `index.html`

### A. Widget Boss di Dashboard (sudah di-inject otomatis via JS)
Tidak perlu tambah manual — `addon-features.js` akan inject `#boss-widget-addon` secara otomatis di atas `#d-stats`.

---

### B. Tambah field "Metode Pembayaran" di form transaksi (pg-input)

Cari bagian `<div class="card-t">Pembayaran</div>` di dalam `#pg-input`, tambahkan setelah `<div class="field" id="fi-dp-wrap">`:

```html
<div class="field">
  <label>Metode Pembayaran</label>
  <div class="radio-btn-group" style="flex-wrap:wrap;">
    <label class="radio-lbl"><input type="radio" name="fi_metode" value="Cash" checked> 💵 Cash</label>
    <label class="radio-lbl"><input type="radio" name="fi_metode" value="Transfer"> 🏦 Transfer</label>
    <label class="radio-lbl"><input type="radio" name="fi_metode" value="QRIS"> 📱 QRIS</label>
    <label class="radio-lbl"><input type="radio" name="fi_metode" value="E-Wallet"> 💳 E-Wallet</label>
    <label class="radio-lbl"><input type="radio" name="fi_metode" value="DP/Cicilan"> 💸 DP/Cicilan</label>
  </div>
</div>
```

---

### C. Tambah Status Transaksi di form transaksi

Cari bagian setelah `<div class="card-t">Selesaikan Transaksi</div>`, tambahkan:

```html
<div class="field">
  <label>Status Order</label>
  <select id="fi-status-trx" style="font-family:var(--fn);font-size:14px;font-weight:700;">
    <option value="Proses">⚙️ Proses</option>
    <option value="Lunas">✅ Lunas</option>
    <option value="DP">💵 DP</option>
    <option value="Pending">⏳ Pending</option>
    <option value="Selesai">🎉 Selesai</option>
  </select>
</div>
```

---

### D. Tambah tombol Export di halaman Backup (pg-backup)

Cari `<div class="card"><div class="card-t">Export Data Offline</div>`, ganti isinya dengan:

```html
<div class="card"><div class="card-t">Export Data</div>
  <div class="export-btn-group" style="margin-bottom:12px;">
    <button class="btn btn-green" style="padding:14px;" onclick="exportExcel()">📗 Export Excel (.xlsx)</button>
    <button class="btn btn-blue" style="padding:14px;" onclick="exportPDFLaporan()">📄 Export PDF Laporan</button>
    <button class="btn btn-ghost" style="padding:14px;border:2px solid var(--bdr);" onclick="exportCSVLengkap()">📊 Export CSV</button>
  </div>
  <div style="font-size:11px;color:var(--tx3);line-height:1.6;">
    <b>Excel</b>: Semua transaksi + pengeluaran dalam format .xlsx<br>
    <b>PDF</b>: Laporan bulanan siap cetak<br>
    <b>CSV</b>: Data mentah untuk analisa di spreadsheet
  </div>
</div>
```

---

### E. Tambah info Auto Backup di halaman Backup

Tambahkan sebelum `</div>` penutup `#pg-backup`:

```html
<div class="card" style="border:1px solid rgba(16,185,129,0.3); background:var(--green-l);">
  <div class="card-t" style="color:var(--green-d);">☁️ Auto Backup Otomatis</div>
  <p style="font-size:13px;color:var(--tx2);margin:0 0 12px;line-height:1.6;">
    Sistem akan otomatis backup data ke Google Sheets setiap <b>10 menit</b> selama URL Web App sudah disimpan.
  </p>
  <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
    <span style="color:var(--tx3);font-weight:600;">Backup terakhir:</span>
    <span id="last-backup-time" style="font-weight:800;color:var(--green-d);">Belum pernah</span>
  </div>
</div>
```

---

### F. Tambah No WA Boss di Pengaturan Toko

Di `#pg-setting`, cari bagian `<div class="card-t">C. Pengaturan QRIS & Ongkir</div>`, tambahkan field berikut di dalamnya:

```html
<div class="field">
  <label>No WA Boss (untuk notifikasi otomatis)</label>
  <input type="text" id="set-no-boss" placeholder="08xxxxxxxxxx" style="font-family:var(--mono);font-weight:700;">
  <div style="font-size:11px;color:var(--tx3);margin-top:4px;">Notifikasi otomatis dikirim ke WA Boss saat ada transaksi masuk, lunas, atau DP.</div>
</div>
<div class="field">
  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
    <input type="checkbox" id="set-notif-boss" style="width:20px;height:20px;accent-color:var(--green-d);">
    <span>Aktifkan Notifikasi Otomatis ke WA Boss</span>
  </label>
</div>
```

Tambahkan juga di fungsi `simpanSetting()` di `script.js`:
```javascript
// Tambahkan sebelum _DB.set(db) di simpanSetting()
db.noBoss = document.getElementById('set-no-boss')?.value || '';
db.setting = db.setting || {};
db.setting.notifBoss = document.getElementById('set-notif-boss')?.checked || false;
```

---

### G. Tombol WA di tabel transaksi

Di fungsi `renderTrx()` di `script.js`, pada bagian render baris tabel, tambahkan tombol:

```javascript
// Tambahkan di kolom aksi transaksi
`<button class="btn btn-sm btn-wa-boss" onclick="kirimWACustomer('${t.wa}','notaTransaksi',${JSON.stringify(t).replace(/'/g,"\\'")})" title="Kirim nota via WA" style="padding:4px 8px;font-size:11px;">📲</button>`
```

---

### H. Tambah panel template WA (bisa masuk ke pg-setting atau modal)

```html
<!-- Tambahkan ke pg-setting atau buat halaman baru -->
<div class="card" style="margin-top:20px;">
  <div class="card-t">📱 Template WhatsApp</div>
  <div style="display:flex;flex-direction:column;gap:10px;">
    <div style="background:var(--surf2);padding:12px;border-radius:10px;border:1px solid var(--bdr);">
      <div style="font-size:12px;font-weight:800;color:var(--tx3);margin-bottom:6px;">Nota Transaksi</div>
      <div style="font-size:12px;color:var(--tx2);line-height:1.6;white-space:pre-line;">🧾 *NOTA TRANSAKSI*
[Nama Toko]
━━━━━━━━━━━━━━━━━━
No : [ID]
Tgl: [Tanggal]
[Item1] [qty]x Rp [harga]
━━━━━━━━━━━━━━━━━━
Total: Rp [total]
Bayar: Rp [dibayar]
Sisa : Rp [sisa]

Terima kasih! 🙏</div>
    </div>
    <!-- Tambahkan template lainnya sesuai kebutuhan -->
  </div>
</div>
```

---

## PERUBAHAN DI `script.js`

### 1. Simpan metode bayar saat transaksi

Di fungsi `simpanTrxPage()` atau `buatObjTrx()`, tambahkan:
```javascript
metode_bayar: document.querySelector('input[name="fi_metode"]:checked')?.value || 'Cash',
status_trx  : document.getElementById('fi-status-trx')?.value || 'Proses',
shift       : getCurrentShift(), // lihat fungsi di bawah
```

### 2. Fungsi detect shift otomatis

Tambahkan fungsi ini di `script.js`:
```javascript
function getCurrentShift() {
  const jam = new Date().getHours();
  if (jam >= 6  && jam < 14) return 'Pagi';
  if (jam >= 14 && jam < 20) return 'Siang';
  return 'Malam';
}
```

### 3. Histori harga saat update barang

Di fungsi `simpanBarang()` atau `openModalBarang()` (bagian save), tambahkan:
```javascript
// Cek apakah harga berubah
const brgLama = (db.brg || []).find(b => b.kode === kode);
if (brgLama && brgLama.harga !== hargaBaru) {
  simpanHistoriHarga(kode, brgLama.harga, hargaBaru, _currentUser?.nama);
}
```

### 4. Inject tombol "Histori Harga" di tabel barang

Di fungsi `renderBrg()`, tambahkan di kolom aksi:
```javascript
`<button class="btn btn-sm btn-ghost" onclick="renderHistoriHargaModal('${b.kode}','${b.nama}')" style="padding:4px 8px;font-size:11px;">📋</button>`
```

### 5. Simpan setting No WA Boss

Di fungsi `simpanSetting()`, tambahkan:
```javascript
db.noBoss = document.getElementById('set-no-boss')?.value || db.noBoss || '';
if (db.setting) db.setting.notifBoss = document.getElementById('set-notif-boss')?.checked || false;
```

Dan di `loadSetting()`:
```javascript
document.getElementById('set-no-boss').value = db.noBoss || '';
document.getElementById('set-notif-boss').checked = db.setting?.notifBoss || false;
```

---

## PERUBAHAN DI `receipt.html` / `receipt-template.js`

### Perbaikan tampilan nota mobile

Di `receipt.html`, pastikan toolbar bawah (action buttons) menggunakan class `nota-action-bar`:

```html
<div class="nota-action-bar preview-actions">
  <button class="preview-btn preview-btn-ghost" onclick="window.history.back()">← Kembali</button>
  <button class="preview-btn preview-btn-primary" onclick="doPrint()">🖨️ Print</button>
  <!-- tambah tombol lain -->
</div>
```

---

## FITUR YANG SUDAH BUILT-IN DI `addon-features.js`

| Fitur | Status | Catatan |
|-------|--------|---------|
| ⌨️ Keyboard shortcuts PC | ✅ Auto-aktif | Enter/F2/ESC/Ctrl+P |
| 🎨 Warna status (hijau/kuning/merah) | ✅ Auto-aktif | fungsi `renderStatusBadge()` |
| 🔔 Toast notifikasi | ✅ Auto-aktif | fungsi `showToast()` |
| ☁️ Auto backup 10 menit | ✅ Auto-aktif | perlu URL sheet tersimpan |
| 📊 Filter laporan | ✅ Auto-inject | inject ke `#pg-laporan` |
| 📈 Grafik laporan | ✅ Auto-render | 5 chart |
| 📋 Histori harga | ✅ Siap pakai | fungsi `renderHistoriHargaModal()` |
| ✏️ Log edit nota | ✅ Siap pakai | fungsi `catatLogEditNota()` |
| 📴 Offline mode | ✅ Auto-aktif | banner + sync queue |
| 📗 Export Excel | ✅ Siap pakai | fungsi `exportExcel()` |
| 📄 Export PDF | ✅ Siap pakai | fungsi `exportPDFLaporan()` |
| 📊 Export CSV | ✅ Siap pakai | fungsi `exportCSVLengkap()` |
| 📱 Template WA | ✅ Siap pakai | `window.WA_TEMPLATES` |
| 📲 Kirim WA Boss | ✅ Siap pakai | fungsi `kirimWABoss()` |
| 📲 Kirim WA Customer | ✅ Siap pakai | fungsi `kirimWACustomer()` |
| 💳 Multi metode bayar | ✅ Siap pakai | perlu HTML snippet B |
| 🏷️ Status transaksi | ✅ Siap pakai | fungsi `updateStatusTrx()` |
| 📦 Widget Dashboard Boss | ✅ Auto-inject | dengan target bulan |
| 👤 Customer detail | ✅ Siap pakai | fungsi `getCustDetail()` |
| 📱 Responsive mobile | ✅ Auto CSS | via addon-styles.css |
| 🔒 Audit log | ✅ Auto-aktif | fungsi `addAuditLog()` |

---

## COMMIT MESSAGE YANG DISARANKAN

```
feat: tambah addon fitur final optimasi kasir

- Keyboard shortcuts (Enter/F2/ESC/Ctrl+P) untuk PC
- Filter laporan: harian/mingguan/bulanan/tahunan/per kasir/shift
- Grafik laporan: penjualan, profit, pengeluaran, terlaris, transaksi/hari
- Histori harga barang + tanggal update
- Edit nota + audit log siapa yang edit
- Auto backup 10 menit ke Google Sheets
- Export Excel (XLSX), PDF, CSV
- Offline mode + auto sync saat koneksi kembali
- Dashboard card konsisten, widget Boss lengkap
- Warna status: hijau/kuning/merah
- Toast notifications
- Template & kirim WA Boss otomatis (transaksi/lunas/DP/setoran)
- Multi metode pembayaran (Cash/Transfer/QRIS/E-Wallet/DP)
- Status transaksi (DP/Pending/Proses/Lunas/Selesai)
- Audit log lengkap
- Responsive mobile/tablet — no horizontal scroll
- Nota mobile: tombol compact & sejajar
```

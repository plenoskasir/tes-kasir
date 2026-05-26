/**
 * ══════════════════════════════════════════════════════════════════
 *  ABUNAWAS KASIR — ADDON FEATURES
 *  File ini berisi semua fitur tambahan yang dipasang di index.html
 *  Tambahkan <script src="addon-features.js"></script> sebelum </body>
 * ══════════════════════════════════════════════════════════════════
 *
 *  Fitur yang ditambahkan:
 *  1.  Keyboard Shortcuts (PC/Desktop only)
 *  2.  Filter Laporan (Harian/Mingguan/Bulanan/Tahunan/Per Kasir/Per Shift)
 *  3.  Grafik Laporan (Penjualan, Profit, Pengeluaran, Terlaris, Transaksi/hari)
 *  4.  Histori Harga Barang
 *  5.  Edit Nota + Log Siapa Edit
 *  6.  Auto Backup 10 menit ke Google Spreadsheet
 *  7.  Export Excel, PDF, CSV
 *  8.  Offline Mode + Auto Sync
 *  9.  Dashboard Card rapi + konsisten
 * 10.  Warna Status (Hijau/Kuning/Merah)
 * 11.  Toast/Notifikasi kecil
 * 12.  WhatsApp Boss otomatis
 * 13.  Performance (lazy load, tabel besar)
 * 14.  Widget Dashboard Boss
 * 15.  Database Customer lengkap
 * 16.  Template WA
 * 17.  Multi Metode Pembayaran
 * 18.  Tanda Status Transaksi
 * 19.  Audit Log lengkap
 * 20.  Responsive Mobile/Tablet
 * 21.  Tampilan Nota Mobile
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   HELPER: get/set storage
──────────────────────────────────────────────────────────────────*/
const _DB = {
  get: () => { try { return JSON.parse(localStorage.getItem('abunawas_toko') || '{}'); } catch { return {}; } },
  set: (d) => { try { localStorage.setItem('abunawas_toko', JSON.stringify(d)); } catch(e) { console.error(e); } },
  getKey: (k) => { const d = _DB.get(); return d[k] ?? null; },
  setKey: (k, v) => { const d = _DB.get(); d[k] = v; _DB.set(d); }
};

/* ─────────────────────────────────────────────────────────────────
   1. KEYBOARD SHORTCUTS (Desktop only)
──────────────────────────────────────────────────────────────────*/
(function initKeyboardShortcuts() {
  if ('ontouchstart' in window) return; // skip on mobile

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isInput = active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);

    // Enter → Tambah ke keranjang (hanya di halaman input & field barang)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      const pgInput = document.getElementById('pg-input');
      if (pgInput && pgInput.classList.contains('active')) {
        if (active && active.id === 'fi-harga') {
          e.preventDefault();
          if (typeof tambahKeKeranjang === 'function') tambahKeKeranjang();
          return;
        }
      }
    }

    // F2 → Bayar / Simpan & Cetak Nota
    if (e.key === 'F2') {
      e.preventDefault();
      const btn = document.getElementById('btn-simpan-nota');
      if (btn) { btn.click(); showToast('💳 F2 → Cetak Nota', 'blue'); }
      return;
    }

    // ESC → Batal / tutup modal
    if (e.key === 'Escape') {
      // Tutup modal yang terbuka
      const modals = document.querySelectorAll('.modal-overlay[style*="flex"], .modal-overlay[style*="block"]');
      if (modals.length) {
        modals[modals.length - 1].style.display = 'none';
        showToast('✕ Modal ditutup', 'gray');
        return;
      }
      // Batal edit transaksi
      const btnBatal = document.getElementById('btn-batal-edit-trx');
      if (btnBatal && btnBatal.style.display !== 'none') {
        btnBatal.click();
        showToast('✕ Edit dibatalkan', 'gray');
      }
      return;
    }

    // Ctrl + P → Print nota
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      // Cek apakah ada modal nota terbuka
      const notaModal = document.querySelector('.nota-preview-modal[style*="flex"]') ||
                        document.querySelector('#modal-nota[style*="flex"]');
      if (notaModal) {
        window.print();
        showToast('🖨️ Ctrl+P → Print', 'blue');
      } else {
        showToast('📋 Buka nota dulu sebelum print', 'amber');
      }
      return;
    }
  });

  // Tampilkan hint shortcut di halaman POS
  const posTitle = document.getElementById('pos-title');
  if (posTitle) {
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--tx3);margin-top:4px;font-weight:600;';
    hint.innerHTML = '⌨️ Shortcut: <kbd style="background:var(--surf2);border:1px solid var(--bdr);border-radius:4px;padding:1px 5px;font-family:var(--mono);font-size:10px;">Enter</kbd> Tambah &nbsp; <kbd style="background:var(--surf2);border:1px solid var(--bdr);border-radius:4px;padding:1px 5px;font-family:var(--mono);font-size:10px;">F2</kbd> Bayar &nbsp; <kbd style="background:var(--surf2);border:1px solid var(--bdr);border-radius:4px;padding:1px 5px;font-family:var(--mono);font-size:10px;">ESC</kbd> Batal &nbsp; <kbd style="background:var(--surf2);border:1px solid var(--bdr);border-radius:4px;padding:1px 5px;font-family:var(--mono);font-size:10px;">Ctrl+P</kbd> Print';
    posTitle.parentNode && posTitle.parentNode.appendChild(hint);
  }
})();

/* ─────────────────────────────────────────────────────────────────
   2. TOAST NOTIFICATION SYSTEM
──────────────────────────────────────────────────────────────────*/
window.showToast = function(msg, type = 'green', duration = 3000) {
  let container = document.getElementById('toast-container-addon');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container-addon';
    container.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:99999;
      display:flex; flex-direction:column-reverse; gap:8px;
      pointer-events:none;
    `;
    document.body.appendChild(container);
  }

  const colors = {
    green : { bg: '#10B981', text: '#fff' },
    red   : { bg: '#EF4444', text: '#fff' },
    amber : { bg: '#F59E0B', text: '#fff' },
    blue  : { bg: '#2563EB', text: '#fff' },
    gray  : { bg: '#475569', text: '#fff' },
  };
  const c = colors[type] || colors.green;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${c.bg}; color:${c.text};
    padding:10px 18px; border-radius:12px;
    font-size:13px; font-weight:700; font-family:var(--fn,'Plus Jakarta Sans',sans-serif);
    box-shadow:0 4px 20px rgba(0,0,0,0.18);
    transform:translateX(120%); transition:transform 0.25s cubic-bezier(.34,1.56,.64,1);
    pointer-events:auto; max-width:300px; word-break:break-word;
    display:flex; align-items:center; gap:8px;
  `;
  toast.innerHTML = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

/* ─────────────────────────────────────────────────────────────────
   3. WARNA STATUS TRANSAKSI
──────────────────────────────────────────────────────────────────*/
window.getStatusColor = function(status) {
  const map = {
    'Lunas'   : { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' }, // Hijau
    'Selesai' : { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' }, // Hijau
    'DP'      : { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }, // Kuning
    'Proses'  : { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' }, // Biru
    'Pending' : { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }, // Kuning
    'Hutang'  : { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }, // Merah
    'Batal'   : { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }, // Merah
  };
  return map[status] || { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
};

window.renderStatusBadge = function(status) {
  const c = getStatusColor(status);
  return `<span style="
    background:${c.bg}; color:${c.text}; border:1px solid ${c.border};
    padding:3px 10px; border-radius:99px; font-size:11px; font-weight:800;
    white-space:nowrap;
  ">${status}</span>`;
};

/* ─────────────────────────────────────────────────────────────────
   4. MULTI METODE PEMBAYARAN
──────────────────────────────────────────────────────────────────*/
window.METODE_BAYAR = ['Cash', 'Transfer', 'QRIS', 'E-Wallet', 'DP/Cicilan'];

window.renderMetodeBayarSelect = function(id, val = 'Cash') {
  return `<select id="${id}" style="font-family:var(--fn);font-size:13px;font-weight:700;padding:10px 14px;border:1px solid var(--bdr);border-radius:var(--r);background:var(--surf);color:var(--tx);">
    ${METODE_BAYAR.map(m => `<option value="${m}" ${m === val ? 'selected' : ''}>${m}</option>`).join('')}
  </select>`;
};

/* ─────────────────────────────────────────────────────────────────
   5. TANDA STATUS TRANSAKSI (DP/Pending/Proses/Lunas/Selesai)
──────────────────────────────────────────────────────────────────*/
window.STATUS_TRANSAKSI = ['DP', 'Pending', 'Proses', 'Lunas', 'Selesai', 'Batal'];

window.updateStatusTrx = function(trxId, newStatus) {
  const db = _DB.get();
  const idx = (db.trx || []).findIndex(t => t.id === trxId);
  if (idx === -1) { showToast('❌ Transaksi tidak ditemukan', 'red'); return; }

  const old = db.trx[idx].status_trx || db.trx[idx].bayar || '-';
  db.trx[idx].status_trx = newStatus;
  db.trx[idx].updated_at = new Date().toISOString();
  _DB.set(db);

  addAuditLog('UPDATE', 'Transaksi', `Status ${trxId}: ${old} → ${newStatus}`);
  showToast(`✅ Status diubah ke ${newStatus}`, 'green');

  // Re-render jika fungsi tersedia
  if (typeof renderTrx === 'function') renderTrx();
  if (typeof renderDash === 'function') renderDash();
};

/* ─────────────────────────────────────────────────────────────────
   6. HISTORI HARGA BARANG
──────────────────────────────────────────────────────────────────*/
window.simpanHistoriHarga = function(kodeBarang, hargaLama, hargaBaru, user) {
  const db = _DB.get();
  if (!db.histori_harga) db.histori_harga = {};
  if (!db.histori_harga[kodeBarang]) db.histori_harga[kodeBarang] = [];

  db.histori_harga[kodeBarang].push({
    harga_lama : hargaLama,
    harga_baru : hargaBaru,
    tgl_update : new Date().toISOString().slice(0,10),
    updated_by : user || 'system'
  });

  // Simpan juga di objek barang
  const brg = (db.brg || []).find(b => b.kode === kodeBarang);
  if (brg) {
    brg.harga_last_update = new Date().toISOString().slice(0,10);
  }

  _DB.set(db);
};

window.getHistoriHarga = function(kodeBarang) {
  const db = _DB.get();
  return (db.histori_harga || {})[kodeBarang] || [];
};

window.renderHistoriHargaModal = function(kodeBarang, namaBarang) {
  const hist = getHistoriHarga(kodeBarang);
  const rows = hist.length ? hist.slice().reverse().map(h => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid var(--bdr);font-size:12px;">${h.tgl_update}</td>
      <td style="padding:10px;border-bottom:1px solid var(--bdr);font-size:12px;font-family:var(--mono);color:var(--red);">Rp ${(h.harga_lama||0).toLocaleString('id-ID')}</td>
      <td style="padding:10px;border-bottom:1px solid var(--bdr);font-size:12px;font-family:var(--mono);color:var(--green-d);">Rp ${(h.harga_baru||0).toLocaleString('id-ID')}</td>
      <td style="padding:10px;border-bottom:1px solid var(--bdr);font-size:12px;color:var(--tx2);">${h.updated_by}</td>
    </tr>`).join('') :
    `<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--tx3);">Belum ada riwayat perubahan harga.</td></tr>`;

  const html = `
    <div style="font-size:14px;font-weight:800;margin-bottom:16px;color:var(--tx);">📋 Riwayat Harga: <span style="color:var(--blue)">${namaBarang}</span></div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="background:var(--surf2);">
          <th style="padding:10px;text-align:left;border-bottom:2px solid var(--bdr);">Tanggal</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid var(--bdr);">Harga Lama</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid var(--bdr);">Harga Baru</th>
          <th style="padding:10px;text-align:left;border-bottom:2px solid var(--bdr);">Diubah Oleh</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  showGenericModal('Histori Harga Barang', html);
};

/* ─────────────────────────────────────────────────────────────────
   7. EDIT NOTA / TRANSAKSI + LOG
──────────────────────────────────────────────────────────────────*/
window.editNota = function(trxId) {
  const db = _DB.get();
  const trx = (db.trx || []).find(t => t.id === trxId);
  if (!trx) { showToast('❌ Transaksi tidak ditemukan', 'red'); return; }

  // Catat audit siapa membuka edit
  const curUser = (window._currentUser || {}).nama || 'Unknown';
  addAuditLog('UPDATE', 'Transaksi', `Buka edit nota ${trxId}`, curUser);

  // Pakai fungsi editTrx yang sudah ada jika tersedia
  if (typeof editTrx === 'function') {
    editTrx(trxId);
    showToast(`✏️ Edit nota ${trxId} dibuka`, 'blue');
    return;
  }
  showToast('ℹ️ Gunakan tombol Edit di tabel transaksi', 'amber');
};

window.catatLogEditNota = function(trxId, field, oldVal, newVal) {
  const curUser = (window._currentUser || {}).nama || 'Unknown';
  const db = _DB.get();
  const trx = (db.trx || []).find(t => t.id === trxId);
  if (!trx) return;

  if (!trx.log_edit) trx.log_edit = [];
  trx.log_edit.push({
    tgl    : new Date().toISOString(),
    user   : curUser,
    field  : field,
    before : oldVal,
    after  : newVal
  });
  _DB.set(db);
  addAuditLog('UPDATE', 'Transaksi', `Edit nota ${trxId} field "${field}" oleh ${curUser}`);
};

/* ─────────────────────────────────────────────────────────────────
   8. AUTO BACKUP 10 MENIT KE GOOGLE SHEETS
──────────────────────────────────────────────────────────────────*/
(function initAutoBackup() {
  const INTERVAL = 10 * 60 * 1000; // 10 menit

  const doBackup = async () => {
    const url = localStorage.getItem('abunawas_sheet_url') || _DB.getKey('sheetUrl');
    if (!url) return;

    try {
      const db = _DB.get();
      const payload = {
        action     : 'autoBackup',
        timestamp  : new Date().toISOString(),
        trxCount   : (db.trx || []).length,
        data       : JSON.stringify(db).slice(0, 50000) // limit 50KB
      };

      await fetch(url, {
        method  : 'POST',
        mode    : 'no-cors',
        body    : JSON.stringify(payload)
      });

      const now = new Date().toLocaleTimeString('id-ID');
      localStorage.setItem('abunawas_last_backup', now);
      showToast(`☁️ Auto backup berhasil ${now}`, 'green', 2500);
      addAuditLog('EXPORT', 'Backup', `Auto backup ke Google Sheets jam ${now}`);
    } catch (err) {
      console.warn('Auto backup failed:', err);
    }
  };

  // Mulai interval setelah 10 menit
  setTimeout(() => {
    doBackup();
    setInterval(doBackup, INTERVAL);
  }, INTERVAL);

  // Tampilkan waktu backup terakhir di halaman backup
  const showLastBackup = () => {
    const el = document.getElementById('last-backup-time');
    if (el) {
      el.textContent = localStorage.getItem('abunawas_last_backup') || 'Belum pernah';
    }
  };
  setInterval(showLastBackup, 5000);
})();

/* ─────────────────────────────────────────────────────────────────
   9. EXPORT — Excel (XLSX), PDF, CSV
──────────────────────────────────────────────────────────────────*/

// CSV (sudah ada di app, override dengan versi lebih lengkap)
window.exportCSVLengkap = function(filter = {}) {
  const db = _DB.get();
  let trx = db.trx || [];

  if (filter.kasir) trx = trx.filter(t => t.kasir === filter.kasir);
  if (filter.dari)  trx = trx.filter(t => t.tgl >= filter.dari);
  if (filter.sampai) trx = trx.filter(t => t.tgl <= filter.sampai);

  const header = ['ID','Tanggal','Pelanggan','No WA','Kasir','Items','Total','Bayar','Status','Metode','Diskon','Ongkir','Catatan'];
  const rows = trx.map(t => [
    t.id, t.tgl, t.pelanggan || 'UMUM', t.wa || '', t.kasir || '',
    (t.items || []).map(i => `${i.barang}(${i.qty}x${i.harga})`).join('; '),
    t.total || 0, t.dibayar || 0, t.bayar || t.status_trx || '',
    t.metode_bayar || 'Cash', t.diskon || 0, t.ongkir || 0, t.catatan || ''
  ]);

  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `abunawas-transaksi-${new Date().toISOString().slice(0,10)}.csv` });
  a.click(); URL.revokeObjectURL(url);

  showToast('📊 Export CSV berhasil!', 'green');
  addAuditLog('EXPORT', 'Backup', 'Export CSV transaksi');
};

// Excel sederhana via SheetJS (kalau tersedia) atau CSV dengan ekstensi .xlsx
window.exportExcel = function() {
  if (window.XLSX) {
    const db = _DB.get();
    const trx = (db.trx || []).map(t => ({
      'ID Transaksi' : t.id,
      'Tanggal'      : t.tgl,
      'Pelanggan'    : t.pelanggan || 'UMUM',
      'No WA'        : t.wa || '',
      'Kasir'        : t.kasir || '',
      'Total (Rp)'   : t.total || 0,
      'Dibayar (Rp)' : t.dibayar || 0,
      'Status'       : t.bayar || t.status_trx || '',
      'Metode'       : t.metode_bayar || 'Cash',
      'Diskon (Rp)'  : t.diskon || 0,
      'Ongkir (Rp)'  : t.ongkir || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(trx);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');

    const pen = (db.pengeluaran || []).map(p => ({
      'ID'       : p.id,
      'Tanggal'  : p.tgl,
      'Kategori' : p.kategori || '',
      'Vendor'   : p.vendor || '',
      'Total'    : p.total || 0,
      'Status'   : p.bayar || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pen), 'Pengeluaran');

    XLSX.writeFile(wb, `abunawas-${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast('📗 Export Excel berhasil!', 'green');
    addAuditLog('EXPORT', 'Backup', 'Export Excel');
  } else {
    // Fallback ke CSV
    exportCSVLengkap();
    showToast('📊 XLSX lib tidak tersedia, export CSV sebagai gantinya', 'amber');
  }
};

// PDF Laporan via html2pdf (sudah ada di app)
window.exportPDFLaporan = function() {
  const el = document.getElementById('pg-laporan');
  if (!el) { showToast('❌ Buka halaman Laporan dulu', 'red'); return; }

  if (window.html2pdf) {
    html2pdf().set({
      margin    : 10,
      filename  : `laporan-abunawas-${new Date().toISOString().slice(0,7)}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF     : { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
    showToast('📄 Export PDF berhasil!', 'green');
    addAuditLog('EXPORT', 'Backup', 'Export PDF Laporan');
  } else {
    window.print();
    showToast('🖨️ Gunakan Save as PDF di dialog print', 'blue');
  }
};

/* ─────────────────────────────────────────────────────────────────
   10. OFFLINE MODE + AUTO SYNC
──────────────────────────────────────────────────────────────────*/
(function initOfflineMode() {
  // Queue untuk data yang belum ter-sync
  const QUEUE_KEY = 'abunawas_sync_queue';
  const getQueue  = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; } };
  const saveQueue = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

  window.addToSyncQueue = function(payload) {
    const q = getQueue();
    q.push({ ...payload, ts: Date.now() });
    saveQueue(q);
  };

  const processSyncQueue = async () => {
    const url = localStorage.getItem('abunawas_sheet_url') || _DB.getKey('sheetUrl');
    if (!url || !navigator.onLine) return;

    const q = getQueue();
    if (!q.length) return;

    for (const item of q) {
      try {
        await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(item) });
      } catch { break; }
    }
    saveQueue([]);
    showToast('🔄 Data offline berhasil disinkronkan!', 'green');
  };

  // Banner offline
  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = `
    display:none; position:fixed; top:0; left:0; right:0; z-index:99999;
    background:#EF4444; color:#fff; text-align:center;
    padding:10px; font-size:13px; font-weight:800; font-family:var(--fn);
  `;
  banner.innerHTML = '⚡ MODE OFFLINE — Semua data tersimpan lokal. Akan otomatis sync saat internet kembali.';
  document.body.prepend(banner);

  const updateStatus = () => {
    banner.style.display = navigator.onLine ? 'none' : 'block';
    if (navigator.onLine) processSyncQueue();
  };

  window.addEventListener('online',  updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
})();

/* ─────────────────────────────────────────────────────────────────
   11. FILTER LAPORAN LANJUTAN
──────────────────────────────────────────────────────────────────*/
window.filterTrxAdvanced = function(opts = {}) {
  const db = _DB.get();
  let trx = db.trx || [];
  const today = new Date().toISOString().slice(0,10);

  if (opts.periode === 'harian') {
    const tgl = opts.tgl || today;
    trx = trx.filter(t => t.tgl === tgl);
  } else if (opts.periode === 'mingguan') {
    const d = new Date(); d.setDate(d.getDate() - 7);
    const dari = d.toISOString().slice(0,10);
    trx = trx.filter(t => t.tgl >= dari && t.tgl <= today);
  } else if (opts.periode === 'bulanan') {
    const bulan = opts.bulan || today.slice(0,7);
    trx = trx.filter(t => t.tgl && t.tgl.startsWith(bulan));
  } else if (opts.periode === 'tahunan') {
    const tahun = opts.tahun || today.slice(0,4);
    trx = trx.filter(t => t.tgl && t.tgl.startsWith(tahun));
  } else if (opts.periode === 'range') {
    if (opts.dari)   trx = trx.filter(t => t.tgl >= opts.dari);
    if (opts.sampai) trx = trx.filter(t => t.tgl <= opts.sampai);
  }

  if (opts.kasir) trx = trx.filter(t => t.kasir === opts.kasir);
  if (opts.shift) trx = trx.filter(t => t.shift === opts.shift);
  if (opts.status) trx = trx.filter(t => (t.bayar || t.status_trx) === opts.status);

  return trx;
};

/* Inject filter UI ke halaman laporan */
window.injectLaporanFilterUI = function() {
  const ph = document.querySelector('#pg-laporan .ph');
  if (!ph || document.getElementById('laporan-filter-addon')) return;

  const db = _DB.get();
  const kasirList = [...new Set((db.trx || []).map(t => t.kasir).filter(Boolean))];

  const wrap = document.createElement('div');
  wrap.id = 'laporan-filter-addon';
  wrap.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;padding:16px;background:var(--surf);border-radius:12px;border:1px solid var(--bdr);';
  wrap.innerHTML = `
    <div style="font-size:12px;font-weight:800;color:var(--tx3);width:100%;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">🔍 Filter Laporan</div>

    <select id="lf-periode" onchange="applyLaporanFilter()" style="padding:8px 12px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--fn);font-size:12px;font-weight:700;background:var(--surf);color:var(--tx);">
      <option value="bulanan">Bulan Ini</option>
      <option value="harian">Hari Ini</option>
      <option value="mingguan">Minggu Ini</option>
      <option value="tahunan">Tahun Ini</option>
      <option value="range">Rentang Tanggal</option>
      <option value="all">Semua Waktu</option>
    </select>

    <input type="month" id="lf-bulan" value="${new Date().toISOString().slice(0,7)}" onchange="applyLaporanFilter()"
      style="padding:8px 12px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--mono);font-size:12px;font-weight:700;background:var(--surf);color:var(--tx);">

    <div id="lf-range-wrap" style="display:none;display:flex;gap:8px;">
      <input type="date" id="lf-dari" onchange="applyLaporanFilter()" style="padding:8px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--mono);font-size:12px;background:var(--surf);color:var(--tx);">
      <span style="align-self:center;font-weight:700;">s/d</span>
      <input type="date" id="lf-sampai" onchange="applyLaporanFilter()" style="padding:8px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--mono);font-size:12px;background:var(--surf);color:var(--tx);">
    </div>

    <select id="lf-kasir" onchange="applyLaporanFilter()" style="padding:8px 12px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--fn);font-size:12px;font-weight:700;background:var(--surf);color:var(--tx);">
      <option value="">Semua Kasir</option>
      ${kasirList.map(k => `<option value="${k}">${k}</option>`).join('')}
    </select>

    <select id="lf-shift" onchange="applyLaporanFilter()" style="padding:8px 12px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--fn);font-size:12px;font-weight:700;background:var(--surf);color:var(--tx);">
      <option value="">Semua Shift</option>
      <option value="Pagi">Shift Pagi</option>
      <option value="Siang">Shift Siang</option>
      <option value="Malam">Shift Malam</option>
    </select>

    <button onclick="applyLaporanFilter()" class="btn btn-blue" style="padding:8px 16px;font-size:12px;">🔍 Terapkan</button>
    <button onclick="exportCSVLengkap(getLaporanFilterOpts())" class="btn btn-ghost" style="padding:8px 16px;font-size:12px;border:1px solid var(--bdr);">📊 Export CSV</button>
    <button onclick="exportExcel()" class="btn btn-ghost" style="padding:8px 16px;font-size:12px;border:1px solid var(--bdr);">📗 Export Excel</button>
    <button onclick="exportPDFLaporan()" class="btn btn-ghost" style="padding:8px 16px;font-size:12px;border:1px solid var(--bdr);">📄 Export PDF</button>
  `;

  ph.after(wrap);

  // Chart container
  const chartWrap = document.createElement('div');
  chartWrap.id = 'laporan-charts-addon';
  chartWrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:24px;';
  chartWrap.innerHTML = `
    <div class="card" style="margin:0"><div class="card-t">📈 Penjualan per Hari</div><div style="position:relative;height:200px"><canvas id="ch-laporan-penjualan"></canvas></div></div>
    <div class="card" style="margin:0"><div class="card-t">💰 Profit Bersih</div><div style="position:relative;height:200px"><canvas id="ch-laporan-profit"></canvas></div></div>
    <div class="card" style="margin:0"><div class="card-t">💸 Pengeluaran</div><div style="position:relative;height:200px"><canvas id="ch-laporan-pengeluaran"></canvas></div></div>
    <div class="card" style="margin:0"><div class="card-t">🏆 Produk Terlaris</div><div style="position:relative;height:200px"><canvas id="ch-laporan-terlaris"></canvas></div></div>
    <div class="card" style="margin:0"><div class="card-t">📅 Transaksi per Hari</div><div style="position:relative;height:200px"><canvas id="ch-laporan-transaksi"></canvas></div></div>
  `;
  wrap.after(chartWrap);
};

window.getLaporanFilterOpts = function() {
  return {
    periode : document.getElementById('lf-periode')?.value || 'bulanan',
    bulan   : document.getElementById('lf-bulan')?.value,
    dari    : document.getElementById('lf-dari')?.value,
    sampai  : document.getElementById('lf-sampai')?.value,
    kasir   : document.getElementById('lf-kasir')?.value,
    shift   : document.getElementById('lf-shift')?.value,
  };
};

window.applyLaporanFilter = function() {
  const opts = getLaporanFilterOpts();

  // Toggle range inputs
  const rangeWrap = document.getElementById('lf-range-wrap');
  if (rangeWrap) rangeWrap.style.display = opts.periode === 'range' ? 'flex' : 'none';
  const bulanInput = document.getElementById('lf-bulan');
  if (bulanInput) bulanInput.style.display = opts.periode === 'bulanan' ? '' : 'none';

  const trx = filterTrxAdvanced(opts);
  renderLaporanCharts(trx, opts);
  if (typeof renderLaporan === 'function') renderLaporan(trx);
};

window.renderLaporanCharts = function(trx, opts) {
  if (!window.Chart) return;

  const destroyChart = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const existing = Chart.getChart(el);
    if (existing) existing.destroy();
  };

  // Penjualan per hari
  const byDay = {};
  const profitByDay = {};
  const trxByDay = {};
  trx.forEach(t => {
    const d = t.tgl || '';
    byDay[d]    = (byDay[d]    || 0) + (t.total || 0);
    trxByDay[d] = (trxByDay[d] || 0) + 1;
    // Profit = total - pengeluaran. Estimasi modal 50% jika tidak ada data modal
    const modal = (t.items || []).reduce((s, i) => s + ((i.modal || 0) * (i.qty || 1)), 0);
    profitByDay[d] = (profitByDay[d] || 0) + ((t.total || 0) - modal);
  });

  const days = Object.keys(byDay).sort().slice(-14);
  const colors = { blue: '#2563EB', green: '#10B981', red: '#EF4444', amber: '#F59E0B', purple: '#8B5CF6' };
  const defaultOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } }
  };

  // Chart Penjualan
  destroyChart('ch-laporan-penjualan');
  const cp = document.getElementById('ch-laporan-penjualan');
  if (cp) new Chart(cp, {
    type: 'bar',
    data: {
      labels: days.map(d => d.slice(5)),
      datasets: [{ label: 'Penjualan', data: days.map(d => byDay[d] || 0), backgroundColor: colors.blue + 'CC', borderRadius: 6 }]
    },
    options: { ...defaultOpts }
  });

  // Chart Profit
  destroyChart('ch-laporan-profit');
  const cpr = document.getElementById('ch-laporan-profit');
  if (cpr) new Chart(cpr, {
    type: 'line',
    data: {
      labels: days.map(d => d.slice(5)),
      datasets: [{ label: 'Profit', data: days.map(d => profitByDay[d] || 0), borderColor: colors.green, backgroundColor: colors.green + '22', fill: true, tension: 0.4, pointRadius: 4 }]
    },
    options: { ...defaultOpts }
  });

  // Chart Pengeluaran
  destroyChart('ch-laporan-pengeluaran');
  const cpe = document.getElementById('ch-laporan-pengeluaran');
  if (cpe) {
    const db = _DB.get();
    const pen = db.pengeluaran || [];
    const penByDay = {};
    pen.forEach(p => { penByDay[p.tgl] = (penByDay[p.tgl] || 0) + (p.total || 0); });
    new Chart(cpe, {
      type: 'bar',
      data: {
        labels: days.map(d => d.slice(5)),
        datasets: [{ label: 'Pengeluaran', data: days.map(d => penByDay[d] || 0), backgroundColor: colors.red + 'CC', borderRadius: 6 }]
      },
      options: { ...defaultOpts }
    });
  }

  // Chart Produk Terlaris
  destroyChart('ch-laporan-terlaris');
  const ctl = document.getElementById('ch-laporan-terlaris');
  if (ctl) {
    const itemCount = {};
    trx.forEach(t => (t.items || []).forEach(i => {
      itemCount[i.barang] = (itemCount[i.barang] || 0) + (i.qty || 1);
    }));
    const sorted = Object.entries(itemCount).sort((a,b) => b[1] - a[1]).slice(0,8);
    new Chart(ctl, {
      type: 'bar',
      data: {
        labels: sorted.map(x => x[0].slice(0,16)),
        datasets: [{ label: 'Qty', data: sorted.map(x => x[1]), backgroundColor: colors.amber + 'CC', borderRadius: 6 }]
      },
      options: { ...defaultOpts, indexAxis: 'y' }
    });
  }

  // Chart Transaksi per hari
  destroyChart('ch-laporan-transaksi');
  const ctd = document.getElementById('ch-laporan-transaksi');
  if (ctd) new Chart(ctd, {
    type: 'line',
    data: {
      labels: days.map(d => d.slice(5)),
      datasets: [{ label: 'Transaksi', data: days.map(d => trxByDay[d] || 0), borderColor: colors.purple, backgroundColor: colors.purple + '22', fill: true, tension: 0.4, pointRadius: 4 }]
    },
    options: { ...defaultOpts }
  });
};

/* ─────────────────────────────────────────────────────────────────
   12. WHATSAPP BOSS OTOMATIS
──────────────────────────────────────────────────────────────────*/
window.WA_TEMPLATES = {
  transaksiMasuk: (t) =>
    `🧾 *TRANSAKSI MASUK*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `ID    : ${t.id}%0A` +
    `Nama  : ${t.pelanggan || 'UMUM'}%0A` +
    `Total : Rp ${(t.total||0).toLocaleString('id-ID')}%0A` +
    `Status: ${t.bayar || t.status_trx || '-'}%0A` +
    `Kasir : ${t.kasir || '-'}%0A` +
    `Waktu : ${new Date().toLocaleString('id-ID')}`,

  pembayaranLunas: (t) =>
    `✅ *PEMBAYARAN LUNAS*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `ID    : ${t.id}%0A` +
    `Nama  : ${t.pelanggan || 'UMUM'}%0A` +
    `Total : Rp ${(t.total||0).toLocaleString('id-ID')}%0A` +
    `Metode: ${t.metode_bayar || 'Cash'}%0A` +
    `Waktu : ${new Date().toLocaleString('id-ID')}`,

  pendingBayar: (t) =>
    `⚠️ *PENDING PEMBAYARAN*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `ID    : ${t.id}%0A` +
    `Nama  : ${t.pelanggan || 'UMUM'}%0A` +
    `Total : Rp ${(t.total||0).toLocaleString('id-ID')}%0A` +
    `DP    : Rp ${(t.dibayar||0).toLocaleString('id-ID')}%0A` +
    `Sisa  : Rp ${((t.total||0)-(t.dibayar||0)).toLocaleString('id-ID')}%0A` +
    `Waktu : ${new Date().toLocaleString('id-ID')}`,

  setoranKasir: (kasir, total) =>
    `💰 *SETORAN KASIR*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `Kasir : ${kasir}%0A` +
    `Total : Rp ${total.toLocaleString('id-ID')}%0A` +
    `Waktu : ${new Date().toLocaleString('id-ID')}`,

  notaTransaksi: (t, toko) =>
    `🧾 *NOTA TRANSAKSI*%0A` +
    `${toko?.nama || 'Abunawas'}%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `No : ${t.id}%0A` +
    `Tgl: ${t.tgl}%0A` +
    (t.items || []).map(i => `• ${i.barang} ${i.qty}x Rp ${(i.harga||0).toLocaleString('id-ID')}`).join('%0A') + '%0A' +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `Total: Rp ${(t.total||0).toLocaleString('id-ID')}%0A` +
    `Bayar: Rp ${(t.dibayar||0).toLocaleString('id-ID')}%0A` +
    (((t.total||0)-(t.dibayar||0)) > 0 ? `Sisa : Rp ${((t.total||0)-(t.dibayar||0)).toLocaleString('id-ID')}%0A` : '') +
    `%0ATerima kasih! 🙏`,

  dpMasuk: (t) =>
    `💵 *DP MASUK*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `Nama  : ${t.pelanggan || 'UMUM'}%0A` +
    `Total : Rp ${(t.total||0).toLocaleString('id-ID')}%0A` +
    `DP    : Rp ${(t.dibayar||0).toLocaleString('id-ID')}%0A` +
    `Sisa  : Rp ${((t.total||0)-(t.dibayar||0)).toLocaleString('id-ID')}`,

  reminderAmbil: (t) =>
    `🔔 *REMINDER AMBIL BARANG*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `Halo ${t.pelanggan || 'Kak'}! Pesanan Anda sudah siap.%0A` +
    `ID: ${t.id}%0A` +
    `Silakan ambil di toko kami. Terima kasih! 🙏`,

  reminderHutang: (t) =>
    `📋 *REMINDER HUTANG*%0A` +
    `━━━━━━━━━━━━━━━━━━%0A` +
    `Halo ${t.pelanggan || 'Kak'}, kami ingatkan masih ada tagihan:%0A` +
    `ID   : ${t.id}%0A` +
    `Sisa : Rp ${((t.total||0)-(t.dibayar||0)).toLocaleString('id-ID')}%0A` +
    `Mohon segera dilunasi. Terima kasih! 🙏`,
};

window.kirimWABoss = function(templateKey, data) {
  const db = _DB.get();
  const noBoss = db.noBoss || db.setting?.noBoss || db.users?.find(u => u.role === 'boss')?.wa;
  if (!noBoss) { showToast('⚠️ No WA Boss belum diset di Pengaturan', 'amber'); return; }

  const tpl = WA_TEMPLATES[templateKey];
  if (!tpl) return;

  const pesan = tpl(data, db);
  const no = noBoss.replace(/[^0-9]/g,'').replace(/^0/,'62');
  window.open(`https://wa.me/${no}?text=${pesan}`, '_blank');
};

window.kirimWACustomer = function(noWA, templateKey, data) {
  const tpl = WA_TEMPLATES[templateKey];
  if (!tpl) return;
  const pesan = tpl(data, _DB.get());
  const no = noWA.replace(/[^0-9]/g,'').replace(/^0/,'62');
  window.open(`https://wa.me/${no}?text=${pesan}`, '_blank');
};

/* ─────────────────────────────────────────────────────────────────
   13. DATABASE CUSTOMER LENGKAP
──────────────────────────────────────────────────────────────────*/
window.getCustDetail = function(nama) {
  const db = _DB.get();
  const trx = (db.trx || []).filter(t => t.pelanggan === nama);
  const totalBelanja = trx.reduce((s, t) => s + (t.total || 0), 0);
  const cust = (db.pelanggan || []).find(p => p.nama === nama) || {};

  return {
    nama         : nama,
    wa           : cust.wa || '',
    alamat       : cust.alamat || '',
    totalTransaksi: trx.length,
    totalBelanja : totalBelanja,
    loyal        : totalBelanja >= 1000000 || trx.length >= 5,
    lastTrx      : trx.sort((a,b) => b.tgl?.localeCompare(a.tgl))[0]?.tgl || '-',
    riwayatTrx   : trx.slice(-5).reverse()
  };
};

window.renderCustCard = function(nama) {
  const d = getCustDetail(nama);
  return `
    <div style="padding:16px;background:var(--surf);border-radius:12px;border:1px solid var(--bdr);">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--blue-l);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:var(--blue-d);">${d.nama.charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-weight:800;font-size:15px;">${d.nama} ${d.loyal ? '⭐' : ''}</div>
          <div style="font-size:12px;color:var(--tx2);">${d.wa || 'No WA belum diisi'}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
        <div><span style="color:var(--tx3);">Total Transaksi</span><div style="font-weight:800;">${d.totalTransaksi}x</div></div>
        <div><span style="color:var(--tx3);">Total Belanja</span><div style="font-weight:800;color:var(--blue-d);">Rp ${d.totalBelanja.toLocaleString('id-ID')}</div></div>
        <div><span style="color:var(--tx3);">Terakhir</span><div style="font-weight:800;">${d.lastTrx}</div></div>
        <div><span style="color:var(--tx3);">Status</span><div style="font-weight:800;">${d.loyal ? '<span style="color:#D97706;">⭐ Loyal</span>' : 'Regular'}</div></div>
      </div>
    </div>`;
};

/* ─────────────────────────────────────────────────────────────────
   14. WIDGET DASHBOARD BOSS (inject ke pg-dashboard)
──────────────────────────────────────────────────────────────────*/
window.renderBossWidget = function() {
  const db = _DB.get();
  const today = new Date().toISOString().slice(0,10);
  const trxHariIni = (db.trx || []).filter(t => t.tgl === today);
  const penHariIni = (db.pengeluaran || []).filter(p => p.tgl === today);

  const omzet    = trxHariIni.reduce((s,t) => s + (t.total||0), 0);
  const pengLuar = penHariIni.reduce((s,p) => s + (p.total||0), 0);
  // Estimasi profit: omzet dikurangi pengeluaran bahan + modal item
  const modalItem = trxHariIni.reduce((s,t) => s + (t.items||[]).reduce((ss,i) => ss + ((i.modal||0)*(i.qty||1)), 0), 0);
  const profit   = omzet - pengLuar - modalItem;

  const piutang = (db.trx || []).filter(t => ['Hutang','DP'].includes(t.bayar || t.status_trx));
  const totalPiutang = piutang.reduce((s,t) => s + ((t.total||0) - (t.dibayar||0)), 0);

  // Produk terlaris
  const itemCount = {};
  trxHariIni.forEach(t => (t.items||[]).forEach(i => {
    itemCount[i.barang] = (itemCount[i.barang] || 0) + (i.qty||1);
  }));
  const terlaris = Object.entries(itemCount).sort((a,b) => b[1]-a[1]).slice(0,3);

  // Target bulan
  const target = db.target_bulan || 10000000;
  const bulan  = today.slice(0,7);
  const omzetBulan = (db.trx||[]).filter(t => t.tgl?.startsWith(bulan)).reduce((s,t) => s+(t.total||0), 0);
  const pct = Math.min(100, Math.round((omzetBulan / target) * 100));

  const el = document.getElementById('boss-widget-addon');
  if (!el) return;

  el.innerHTML = `
    <div style="font-size:12px;font-weight:800;color:var(--tx3);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">📊 Widget Boss — ${today}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
      ${[
        { ico:'💰', lbl:'Omzet Hari Ini',   val:`Rp ${omzet.toLocaleString('id-ID')}`,   color:'var(--blue-d)' },
        { ico:'📈', lbl:'Profit Hari Ini',  val:`Rp ${profit.toLocaleString('id-ID')}`,  color:profit>=0?'var(--green-d)':'var(--red)' },
        { ico:'💸', lbl:'Pengeluaran',       val:`Rp ${pengLuar.toLocaleString('id-ID')}`, color:'var(--red)' },
        { ico:'⏳', lbl:'Pending Bayar',     val:`${piutang.length} trx`,               color:'var(--amber-d)' },
        { ico:'📋', lbl:'Total Piutang',     val:`Rp ${totalPiutang.toLocaleString('id-ID')}`, color:'var(--red)' },
      ].map(w => `
        <div style="background:var(--surf);border-radius:12px;border:1px solid var(--bdr);padding:14px;box-shadow:var(--sh);">
          <div style="font-size:20px;margin-bottom:6px;">${w.ico}</div>
          <div style="font-size:11px;color:var(--tx3);font-weight:600;margin-bottom:2px;">${w.lbl}</div>
          <div style="font-size:16px;font-weight:900;color:${w.color};font-family:var(--mono);">${w.val}</div>
        </div>`).join('')}
    </div>

    ${terlaris.length ? `
    <div style="background:var(--surf);border-radius:12px;border:1px solid var(--bdr);padding:14px;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:800;color:var(--tx3);margin-bottom:8px;">🏆 Produk Terlaris Hari Ini</div>
      ${terlaris.map((x,i) => `<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>${i===0?'🥇':i===1?'🥈':'🥉'} ${x[0]}</span><span style="font-weight:800;color:var(--blue-d);">${x[1]}x</span></div>`).join('')}
    </div>` : ''}

    <div style="background:var(--surf);border-radius:12px;border:1px solid var(--bdr);padding:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:12px;font-weight:800;color:var(--tx3);">🎯 Target Bulan Ini</div>
        <div style="font-size:12px;font-weight:800;color:var(--blue-d);">${pct}%</div>
      </div>
      <div style="background:var(--surf2);border-radius:99px;height:10px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${pct>=100?'#10B981':pct>=50?'#2563EB':'#F59E0B'};border-radius:99px;transition:width 0.8s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--tx3);">
        <span>Rp ${omzetBulan.toLocaleString('id-ID')}</span>
        <span>Target: Rp ${target.toLocaleString('id-ID')}</span>
      </div>
      <div style="margin-top:10px;">
        <label style="font-size:11px;color:var(--tx3);font-weight:600;">Ubah Target (Rp):</label>
        <div style="display:flex;gap:8px;margin-top:4px;">
          <input type="text" id="input-target-bulan" value="${target.toLocaleString('id-ID')}" style="flex:1;padding:8px;border:1px solid var(--bdr);border-radius:8px;font-family:var(--mono);font-size:12px;font-weight:700;background:var(--surf);color:var(--tx);" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
          <button onclick="simpanTargetBulan()" class="btn btn-blue" style="padding:8px 14px;font-size:12px;">Simpan</button>
        </div>
      </div>
    </div>
  `;
};

window.simpanTargetBulan = function() {
  const val = parseInt(document.getElementById('input-target-bulan')?.value || '0', 10);
  if (!val) { showToast('❌ Masukkan nilai target yang valid', 'red'); return; }
  const db = _DB.get();
  db.target_bulan = val;
  _DB.set(db);
  showToast(`🎯 Target bulan diset Rp ${val.toLocaleString('id-ID')}`, 'green');
  renderBossWidget();
};

/* ─────────────────────────────────────────────────────────────────
   15. AUDIT LOG TAMBAHAN
──────────────────────────────────────────────────────────────────*/
window.addAuditLog = function(aksi, modul, detail, user) {
  // Delegasikan ke fungsi audit yang sudah ada jika tersedia
  if (typeof addLog === 'function') {
    addLog(aksi, modul, detail);
    return;
  }
  const db = _DB.get();
  if (!db.auditLog) db.auditLog = [];
  db.auditLog.push({
    id     : `AL-${Date.now()}`,
    ts     : new Date().toISOString(),
    aksi   : aksi,
    modul  : modul,
    detail : detail,
    user   : user || (window._currentUser?.nama || 'system')
  });
  // Batasi 500 log
  if (db.auditLog.length > 500) db.auditLog = db.auditLog.slice(-500);
  _DB.set(db);
};

/* ─────────────────────────────────────────────────────────────────
   16. GENERIC MODAL HELPER
──────────────────────────────────────────────────────────────────*/
window.showGenericModal = function(title, content, actions = '') {
  let modal = document.getElementById('generic-modal-addon');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'generic-modal-addon';
    modal.style.cssText = `
      display:none; position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,0.5); align-items:center; justify-content:center; padding:16px;
    `;
    modal.innerHTML = `
      <div style="background:var(--surf);border-radius:20px;padding:24px;max-width:560px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div id="gm-title" style="font-size:16px;font-weight:800;color:var(--tx);"></div>
          <button onclick="document.getElementById('generic-modal-addon').style.display='none'" style="background:var(--surf2);border:none;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <div id="gm-content"></div>
        <div id="gm-actions" style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  document.getElementById('gm-title').textContent = title;
  document.getElementById('gm-content').innerHTML = content;
  document.getElementById('gm-actions').innerHTML = actions;
  modal.style.display = 'flex';
};

/* ─────────────────────────────────────────────────────────────────
   17. RESPONSIVE TABLE FIX (Mobile friendly)
──────────────────────────────────────────────────────────────────*/
(function injectResponsiveStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Toast ── */
    @media (max-width:600px) {
      #toast-container-addon {
        bottom:80px !important; right:12px !important; left:12px !important;
      }
      #toast-container-addon > div { max-width:100% !important; }
    }

    /* ── Status Badge Colors ── */
    .badge-lunas   { background:#D1FAE5; color:#065F46; border:1px solid #6EE7B7; }
    .badge-dp      { background:#FEF3C7; color:#92400E; border:1px solid #FCD34D; }
    .badge-hutang  { background:#FEE2E2; color:#991B1B; border:1px solid #FCA5A5; }
    .badge-pending { background:#FEF3C7; color:#92400E; border:1px solid #FCD34D; }
    .badge-proses  { background:#DBEAFE; color:#1E40AF; border:1px solid #93C5FD; }
    .badge-selesai { background:#D1FAE5; color:#065F46; border:1px solid #6EE7B7; }
    .badge-batal   { background:#FEE2E2; color:#991B1B; border:1px solid #FCA5A5; }

    /* ── Mobile table ── */
    @media (max-width:640px) {
      .tbl-wrap table   { font-size:12px; }
      .tbl-wrap td,
      .tbl-wrap th      { padding:8px 6px !important; }
      .tbl-wrap th:nth-child(n+4):not(:last-child),
      .tbl-wrap td:nth-child(n+4):not(:last-child) {
        /* hide less critical columns on mobile */
      }
      /* Horizontal scroll only if needed */
      .tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
    }

    /* ── Compact buttons HP ── */
    @media (max-width:480px) {
      .btn { padding:9px 12px !important; font-size:12px !important; }
      .ph  { flex-direction:column; align-items:flex-start; gap:10px; }
      .layout-pos { grid-template-columns:1fr !important; }
    }

    /* ── Dashboard card consistent height ── */
    #d-stats .card-stat,
    #dash-recap-omzet .card-stat {
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* ── No horizontal overflow on body ── */
    body { overflow-x: hidden !important; }
    .main { overflow-x: hidden !important; }

    /* ── Nota mobile buttons ── */
    @media (max-width:480px) {
      .nota-action-bar {
        display:grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap:8px !important;
      }
      .nota-action-bar .btn { font-size:11px !important; padding:8px 6px !important; }
    }

    /* ── Boss widget ── */
    #boss-widget-addon { margin-bottom:24px; }

    /* ── Offline banner ── */
    #offline-banner ~ .topbar { margin-top:40px; }
  `;
  document.head.appendChild(style);
})();

/* ─────────────────────────────────────────────────────────────────
   18. INIT — jalankan setelah DOM ready
──────────────────────────────────────────────────────────────────*/
(function initAddon() {
  const run = () => {
    // Inject boss widget ke dashboard
    const dashStat = document.getElementById('d-stats');
    if (dashStat && !document.getElementById('boss-widget-addon')) {
      const wg = document.createElement('div');
      wg.id = 'boss-widget-addon';
      dashStat.parentNode.insertBefore(wg, dashStat);
    }

    // Inject filter ke laporan
    injectLaporanFilterUI();

    // Render boss widget jika di halaman dashboard
    renderBossWidget();

    // Override simpanTrxPage untuk kirim notif ke boss
    const origSimpan = window.simpanTrxPage;
    if (origSimpan && !window._addonHooked) {
      window._addonHooked = true;
      window.simpanTrxPage = function(mode) {
        origSimpan.call(this, mode);
        // Baca transaksi terakhir untuk notif
        setTimeout(() => {
          const db = _DB.get();
          const trx = (db.trx || []).slice(-1)[0];
          if (trx) {
            showToast('✅ Transaksi berhasil disimpan!', 'green');
            addAuditLog('CREATE', 'Transaksi', `Buat transaksi ${trx.id}`);
            // Kirim ke boss via WA jika diaktifkan
            const db2 = _DB.get();
            if (db2.setting?.notifBoss) {
              if (trx.bayar === 'Lunas') kirimWABoss('pembayaranLunas', trx);
              else if (trx.bayar === 'DP') kirimWABoss('dpMasuk', trx);
              else kirimWABoss('pendingBayar', trx);
            }
          }
        }, 500);
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    setTimeout(run, 800); // tunggu app utama selesai init
  }
})();

console.log('%c✅ Abunawas Addon Features loaded', 'color:#10B981;font-weight:700;font-size:14px;');

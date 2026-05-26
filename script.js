/* ════════════════ KONFIGURASI GEMINI API ════════════════ */
let apiKey = localStorage.getItem('abunawas_gemini_key') || "";

/* ════════════════ VARIABEL GLOBAL ════════════════ */
var CART = [];
var CART_VND = []; // Keranjang Vendor
var currentEditTrxId = null;

function dMinus(d){ var date = new Date(); date.setDate(date.getDate() - d); return date.toISOString().split('T')[0]; }
function nowDate(){return new Date().toISOString().split('T')[0];}
function nowId(){var d=new Date();return 'INV-'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(trxCtr++).padStart(3,'0');}

function formatRibuan(angka) {
  if(!angka) return '';
  var number_string = angka.toString().replace(/[^,\d]/g, ''),
      split = number_string.split(','),
      sisa  = split[0].length % 3,
      rupiah  = split[0].substr(0, sisa),
      ribuan  = split[0].substr(sisa).match(/\d{3}/gi);
  if(ribuan){
      var separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
  }
  return split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
}

function cleanRibuan(text) {
  if(!text) return 0;
  return parseInt(text.toString().replace(/\./g, '')) || 0;
}

function fmt(n){return Math.round(n).toLocaleString('id-ID');}
function fmtRp(n){return 'Rp '+fmt(n);}

// ═════ LOAD DATA LOCALSTORAGE ═════
var USERS = JSON.parse(localStorage.getItem('abunawas_usr')) || [
  {u:'boss', p:'1234', nama:'Boss Sistem', role:'boss', wa:'08111111111', aktif:true},
  {u:'admin',p:'1234', nama:'Admin Toko',  role:'admin',wa:'08222222222', aktif:true},
  {u:'kasir',p:'1234', nama:'Andi Pratama',role:'kasir',wa:'08333333333', aktif:true}
];

var PEGAWAI = JSON.parse(localStorage.getItem('abunawas_pegawai')) || [
  {nama: 'Udin Finishing', posisi: 'Tukang Cetak'}
];

var TOKO = JSON.parse(localStorage.getItem('abunawas_toko')) || {
  rekening: [
      {bank: 'BCA', no: '73827328327', an: 'a.n ABUNAWAS PERCETAKAN'},
      {bank: 'BRI', no: '19382992013213', an: 'a.n ABUNAWAS PERCETAKAN'}
  ],
  kategoriPengeluaran: ['Operasional Toko', 'Listrik & Air', 'Gaji Karyawan', 'Lain-lain'],
  kategoriProduk: ['Banner & Spanduk', 'Stiker & Label', 'Kartu & ID', 'Cetak Kertas', 'Merchandise', 'Lainnya'],
  satuanJual: ['pcs', 'lembar', 'meter', 'roll', 'rim', 'box'],
  useStok: false,
  ongkirKm: 2000,
  qrisImg: 'qris.png',
  qrisLink: 'https://plenoskasir.github.io/Database-Percetakan-Abunawas/qris.png',
  theme: 'light'
};

if(!TOKO.kategoriProduk) {
    TOKO.kategoriProduk = ['Banner & Spanduk', 'Stiker & Label', 'Kartu & ID', 'Cetak Kertas', 'Merchandise', 'Lainnya'];
}
if(!TOKO.satuanJual) {
    TOKO.satuanJual = ['pcs', 'lembar', 'meter', 'roll', 'rim', 'box'];
}

var PELANGGAN = JSON.parse(localStorage.getItem('abunawas_pel')) || [
  {nama: 'Budi Santoso', wa: '081234567890', alamat: 'Jl. Merdeka No. 1, Kepanjen', id_cust: 'PLG-0001'}
];

var VENDORS = JSON.parse(localStorage.getItem('abunawas_vnd')) || [
  {nama: 'Vendor Spanduk Cepat', kontak: '0899999111'},
  {nama: 'Grosir Kertas Maju', kontak: '0888888222'}
];

var BARANG = JSON.parse(localStorage.getItem('abunawas_brg')) || [
  {kode:'BNR-001',nama:'Banner Flexi', satuan:'meter', kat:'Banner & Spanduk', modal:12000, stok: 0, tiers:[{max:10,h:25000},{max:50,h:20000},{max:9999,h:18000}]},
  {kode:'STK-001',nama:'Stiker Vinyl', satuan:'lembar', kat:'Stiker & Label', modal:6000, stok: 0, tiers:[{max:50,h:15000},{max:100,h:12000},{max:9999,h:10000}]}
];

var BARANG_VENDOR = JSON.parse(localStorage.getItem('abunawas_brgvnd')) || [
  {nama: 'Cetak Banner Flexi 280gr / Meter', vendor: 'Vendor Spanduk Cepat', harga: 12000}
];

var TRX = JSON.parse(localStorage.getItem('abunawas_trx')) || [
  {id:'INV-2026-04-001',tgl:dMinus(0),pelanggan:'Budi Santoso',wa:'081234567890', id_cust:'PLG-0001', no_cetak:'001', alamat:'Jl. Merdeka No. 1, Kepanjen', items:[{kode:'BNR-001',barang:'Banner Flexi',qty:4,harga:25000,total:100000,modal:48000}], total:100000,modal:48000,dibayar:100000,sisa:0,bayar:'Lunas',metode:'Cash',kasir:'Andi Pratama',catatan:'Cetak Highres', diskon:0, ongkir:0, komisiNama:'', komisiNominal:0}
];
var trxCtr = TRX.length > 0 ? parseInt(TRX[0].id.split('-').pop()) + 1 : 1; 

var PENGELUARAN = JSON.parse(localStorage.getItem('abunawas_peng')) || [
  {id:'EXP-001',tgl:dMinus(0), kategori:'Belanja Vendor / Maklon Cetak', vendor:'Toko A', total:350000, status:'Lunas', dibayar:350000, sisa:0, items:[{barang:'Tinta Cetak', qty:1, harga:350000, total:350000}]}
];

var KASBON = JSON.parse(localStorage.getItem('abunawas_kasbon')) || [];
var MODAL_LACI = JSON.parse(localStorage.getItem('abunawas_laci')) || {};

/* ════════════════ THEME TOGGLE ════════════════ */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    let btn = document.getElementById('btn-theme');
    if(btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    TOKO.theme = theme;
    saveDataSilent();
}
function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    if(document.getElementById('pg-dashboard').classList.contains('on')) renderDash(); // re-render charts
}
// Apply default theme on load
applyTheme(TOKO.theme || 'light');


// ═════ SAVE DATA & AUTO SYNC ═════
function saveDataSilent() {
  localStorage.setItem('abunawas_toko', JSON.stringify(TOKO));
}

function saveData() {
  localStorage.setItem('abunawas_trx', JSON.stringify(TRX));
  localStorage.setItem('abunawas_brg', JSON.stringify(BARANG));
  localStorage.setItem('abunawas_brgvnd', JSON.stringify(BARANG_VENDOR));
  localStorage.setItem('abunawas_pel', JSON.stringify(PELANGGAN));
  localStorage.setItem('abunawas_vnd', JSON.stringify(VENDORS));
  localStorage.setItem('abunawas_peng', JSON.stringify(PENGELUARAN));
  localStorage.setItem('abunawas_usr', JSON.stringify(USERS));
  localStorage.setItem('abunawas_pegawai', JSON.stringify(PEGAWAI));
  localStorage.setItem('abunawas_kasbon', JSON.stringify(KASBON));
  localStorage.setItem('abunawas_toko', JSON.stringify(TOKO));
  localStorage.setItem('abunawas_laci', JSON.stringify(MODAL_LACI));
  autoSyncToSheets();
  updatePiutangBadge();
}

var syncTimeout;
function autoSyncToSheets() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(function() {
      syncToSheets(true); // true = mode diam/silent
  }, 5000); 
}

var MENUS = {
  boss:[
    {sec:'Pusat Kendali'},
    {id:'dashboard',label:'Dashboard',ico:'grid'},
    {id:'input',label:'POS Transaksi',ico:'pen'},
    {id:'transaksi',label:'Semua Transaksi',ico:'list'},
    {id:'piutang',label:'Data Piutang',ico:'clock'},
    {sec:'Ruang Boss & Keuangan'},
    {id:'pengeluaran',label:'Belanja Vendor & Pengeluaran',ico:'receipt'},
    {id:'laci',label:'Setoran Laci Kasir',ico:'cash'},
    {id:'kasbon',label:'Kasbon Karyawan',ico:'alert'},
    {id:'hutang-vendor',label:'Hutang ke Vendor',ico:'arrowud'},
    {id:'hutang-pengeluaran',label:'Tagihan Operasional',ico:'arrowud'},
    {sec:'Data Master'},
    {id:'barang',label:'Master Barang Toko',ico:'tag'},
    {id:'barang-vendor',label:'Master Barang Vendor',ico:'tag'},
    {id:'pegawai',label:'Data Akun & Pegawai',ico:'users'},
    {id:'pelanggan',label:'Data Pelanggan',ico:'users'},
    {id:'vendor',label:'Master Vendor',ico:'vendor'},
    {id:'laporan',label:'Laporan Bisnis',ico:'chart'},
    {sec:'AI & Tools'},
    {id:'aiadvisor',label:'🤖 AI Advisor',ico:'ai'},
    {id:'ocr',label:'📸 Foto Nota (OCR)',ico:'camera'},
    {id:'voice',label:'🎙️ Voice Input',ico:'mic'},
    {id:'skor',label:'💯 Skor Finansial',ico:'chart'},
    {id:'tagihan',label:'🔔 Tagihan Rutin',ico:'bell'},
    {id:'kalkulator',label:'🧮 Kalkulator Produksi',ico:'calc'},
    {sec:'Sistem & Pengaturan'},
    {id:'setting',label:'Pengaturan Toko',ico:'gear'},
    {id:'backup',label:'Backup Database',ico:'shield'},
    {id:'audit',label:'🔐 Log Aktivitas',ico:'terminal'}
  ],
  admin:[
    {sec:'Operasional'},
    {id:'dash-admin',label:'Dashboard Admin',ico:'grid'},
    {id:'input',label:'POS Transaksi',ico:'pen'},
    {id:'transaksi',label:'Semua Transaksi',ico:'list'},
    {id:'piutang',label:'Data Piutang',ico:'clock'},
    {sec:'Keuangan Khusus'},
    {id:'pengeluaran',label:'Belanja Vendor',ico:'receipt'},
    {id:'laci',label:'Setoran Laci Kasir',ico:'cash'},
    {id:'kasbon',label:'Kasbon Karyawan',ico:'alert'},
    {id:'hutang-vendor',label:'Hutang Vendor',ico:'arrowud'},
    {id:'hutang-pengeluaran',label:'Tagihan Operasional',ico:'arrowud'},
    {sec:'Master'},
    {id:'barang',label:'Data Barang',ico:'tag'},
    {id:'pegawai',label:'Data Akun & Pegawai',ico:'users'},
    {id:'pelanggan',label:'Data Pelanggan',ico:'users'},
    {id:'vendor',label:'Master Vendor',ico:'vendor'},
    {id:'kalkulator',label:'🧮 Kalkulator Produksi',ico:'calc'}
  ],
  kasir:[
    {sec:'Menu Kasir'},
    {id:'input',label:'POS Transaksi',ico:'pen'},
    {id:'laci',label:'Setoran Shift Saya',ico:'cash'},
    {id:'kasir-riwayat',label:'Riwayat Saya',ico:'list'}
  ]
};

var ICOS={
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  receipt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  cash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>',
  arrowud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>',
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  vendor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  terminal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  ai:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg>'
};

var curUser = null, editBrgIdx = -1;
var bChart = null, pChart = null;
var notaForWA = null;
var currentNotaId = null;

// Helper untuk empty state di tabel
function emptyRow(cols, icon, msg) {
  icon = icon || '📭';
  msg = msg || 'Belum ada data.';
  return '<tr><td colspan="' + cols + '" style="text-align:center; padding:36px 16px;">' +
    '<div style="font-size:36px; margin-bottom:8px; opacity:0.4;">' + icon + '</div>' +
    '<div style="font-size:13px; font-weight:700; color:var(--tx3);">' + msg + '</div>' +
  '</td></tr>';
}

function updatePiutangBadge() {
  var belumLunas = TRX.filter(function(t){ return t.sisa > 0; });
  var el = document.getElementById('topbar-piutang');
  var lbl = document.getElementById('topbar-piutang-label');
  if (!el) return;
  if (belumLunas.length > 0 && curUser && curUser.role !== 'kasir') {
    el.style.display = 'flex';
    lbl.textContent = belumLunas.length + ' Piutang';
  } else {
    el.style.display = 'none';
  }
}

function toast(msg, dur, type) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.className = '';
  // color variants
  if (type === 'error') { el.style.background = '#EF4444'; el.style.color = '#fff'; }
  else if (type === 'warning') { el.style.background = '#F59E0B'; el.style.color = '#fff'; }
  else if (type === 'success') { el.style.background = '#10B981'; el.style.color = '#fff'; }
  else { el.style.background = ''; el.style.color = ''; }
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); el.style.background = ''; el.style.color = ''; }, dur || 2500);
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m) m.classList.remove('open');});
});

function getHarga(b,qty){var t=b.tiers.find(function(x){return qty<=x.max;})||b.tiers[b.tiers.length-1];return t.h;}

function badgeBayar(s){
    if(s==='Lunas') return '<span class="badge bg-green"><span class="dot dot-g"></span>Lunas</span>';
    if(s==='DP') return '<span class="badge bg-amber"><span class="dot dot-a"></span>Titip Uang</span>';
    return '<span class="badge bg-red"><span class="dot dot-r"></span>Belum Lunas</span>';
}

/* ════════════════ FUNGSI KIRIM WA DIRECT (Universal: PC + Android) ════════════════ */
function sendWA(phone, message) {
  if (!phone) { toast('❌ Nomor WA pelanggan belum diisi!', 2500, 'error'); return; }
  // Normalisasi nomor: 08xx → 628xx, buang karakter non-angka
  let p = phone.toString().trim().replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  if (!p.startsWith('62')) p = '62' + p;
  let msg = encodeURIComponent(message);
  
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
      // JIKA DI HP: Paksa masuk aplikasi WA secara langsung
      window.location.href = `whatsapp://send?phone=${p}&text=${msg}`;
      
      // Cadangan kalau aplikasi WA tidak ada (fallback ke API WA web browser)
      setTimeout(function() {
          if(document.hasFocus()) {
              window.location.href = `https://api.whatsapp.com/send?phone=${p}&text=${msg}`;
          }
      }, 2000);
  } else {
      // JIKA DI PC / LAPTOP: Buka tab baru langsung ke WhatsApp Web
      window.open(`https://web.whatsapp.com/send?phone=${p}&text=${msg}`, '_blank');
  }
}

/* ════════════════ FUNGSI GENERATE ID & NOMOR CETAK ════════════════ */
function generateCustId() {
    let max = 0;
    PELANGGAN.forEach(p => {
        let numStr = (p.id_cust || '').replace(/\D/g, '');
        let num = parseInt(numStr, 10);
        if(!isNaN(num) && num > max) max = num;
    });
    return 'PLG-' + String(max + 1).padStart(4, '0');
}

function generateNoCetak() {
    let d = nowDate();
    let count = TRX.filter(t => t.tgl === d).length;
    return String(count + 1).padStart(3, '0');
}

/* ════════════════ FUNGSI API GOOGLE SHEETS SYNC ════════════════ */
async function syncToSheets(silent = false) {
  var url = localStorage.getItem('abunawas_sheet_url');
  if (!url) { if(!silent) openModal('mo-sheets-confirm'); return; }
  
  var btn1 = document.getElementById('btn-sync'); var btn2 = document.getElementById('btn-sync-brg'); var btn3 = document.getElementById('btn-sync-kasir'); 
  
  if(!silent) {
      if(btn1) { btn1.innerHTML = '⏳ Menyinkronkan...'; btn1.disabled = true; }
      if(btn2) { btn2.innerHTML = '⏳ Syncing...'; btn2.disabled = true; }
      if(btn3) { btn3.innerHTML = '⏳ Syncing...'; btn3.disabled = true; }
      toast("Mulai mengirim data ke Google Sheets...", 3000);
  }

  var payload = { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, 
    body: JSON.stringify({ action: 'backup', trx: TRX, pengeluaran: PENGELUARAN, pelanggan: PELANGGAN })
  };

  try {
    await fetch(url, payload);
    if(!silent) toast("✔️ Data berhasil dikirim ke Google Sheets!", 3500);
  } catch (error) { if(!silent) toast("⚠️ Gagal terhubung. Pastikan internet lancar dan URL benar.", 3000); }
  
  if(!silent) {
      if(btn1) { btn1.innerHTML = 'Simpan URL & Jalankan Sync'; btn1.disabled = false; }
      if(btn2) { btn2.innerHTML = 'Sync Sheets'; btn2.disabled = false; }
      if(btn3) { btn3.innerHTML = 'Sync Data ke Excel'; btn3.disabled = false; }
  }
}
function saveSheetUrl() {
  var url = document.getElementById('setting-sheet-url').value.trim();
  localStorage.setItem('abunawas_sheet_url', url); toast("URL tersimpan! Memulai koneksi pertama...", 2000); syncToSheets();
}

/* ════════════════ FUNGSI API GEMINI AI ════════════════ */
async function fetchGemini(prompt, expectJson = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  if (expectJson) payload.generationConfig = { responseMimeType: "application/json" };

  let retries = 5; let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay)); delay *= 2;
    }
  }
}

// AI UNTUK KASIR
async function prosesAIPesanan() {
  if(!apiKey) { 
    toast('⚠️ API Key Gemini belum diisi! Masuk ke Pengaturan Toko dan isi API Key.', 4000, 'warning'); 
    showPage('setting');
    return; 
  }
  let txtAreaId = 'ai-input-text'; let text = document.getElementById(txtAreaId).value.trim();
  if(!text) { toast("Silakan ketik detail pesanan di kolom teks terlebih dahulu!", 3000); return; }
  toast("✨ AI sedang memecah pesanan dan menghitung ukuran...", 3000);
  document.getElementById('ai-btn-extract').textContent = '⏳ Memproses...'; document.getElementById('ai-btn-extract').disabled = true;

  let today = nowDate(); let listBarang = BARANG.map(b => b.kode + " - " + b.nama).join(", ");
  
  let prompt = `Ekstrak kalimat pesanan pelanggan berikut ke dalam format JSON. Hari ini adalah tanggal: ${today}. Daftar produk/barang percetakan yang tersedia: ${listBarang}
  PENTING SOAL UKURAN & JUMLAH (QTY):
  Jika pelanggan menyebutkan ukuran meter (misalnya 3x2 meter, 2x1), HITUNG PERKALIANNYA dan jadikan itu nilai "qty". Contoh: "Spanduk 3x2 meter", berarti qty = 6. 
  Format JSON yang dikembalikan:
  {
    "pelanggan": "Nama pelanggan (tebak jika ada kata sapaan)", "wa": "Nomor WA pelanggan", "alamat": "Alamat pengiriman",
    "items": [ { "kode_barang": "Pilih KODE barang jika ada dari daftar", "nama_barang": "Nama cetakan", "qty": AngkaHasilPerkalianTadi, "harga_satuan": 10000 } ],
    "catatan": "Instruksi spesifik", "bayar": "Lunas atau Hutang atau DP", "nominal_dp": 50000
  }
  Teks pesanan pelanggan: "${text}"`;

  try {
    let res = await fetchGemini(prompt, true); let data = JSON.parse(res);

    document.getElementById('fi-nama').value = data.pelanggan || ''; document.getElementById('fi-wa').value = data.wa || '';
    document.getElementById('fi-alamat').value = data.alamat || ''; document.getElementById('fi-catatan').value = data.catatan || '';
    updateIdCust(); // Update ID view

    if(data.bayar === 'Hutang') { document.querySelector('input[name="fi_bayar"][value="Hutang"]').checked = true;
    } else if(data.bayar === 'DP') { document.querySelector('input[name="fi_bayar"][value="DP"]').checked = true; toggleDP('fi');
       if(data.nominal_dp > 0) document.getElementById('fi-dp-val').value = formatRibuan(data.nominal_dp);
    } else { document.querySelector('input[name="fi_bayar"][value="Lunas"]').checked = true; }
    
    CART = [];
    if(data.items && data.items.length > 0) {
        data.items.forEach(i => {
            let b = BARANG.find(x => x.kode === i.kode_barang || x.nama.toLowerCase() === i.nama_barang.toLowerCase());
            let finalName = b ? b.nama : i.nama_barang; let finalKode = b ? b.kode : 'CSTM';
            let harga = i.harga_satuan > 0 ? i.harga_satuan : (b ? getHarga(b, i.qty) : 0);
            CART.push({ kode: finalKode, barang: finalName, qty: i.qty || 1, harga: harga, total: harga * (i.qty || 1), modal: (b ? b.modal : 0) * (i.qty || 1) });
        });
    }
    renderCart(); toast("✨ Ekstraksi pesanan keranjang oleh AI selesai!", 2500); document.getElementById(txtAreaId).value = '';
  } catch (err) { console.error(err); toast("Maaf, AI gagal memproses data.", 3000);
  } finally { document.getElementById('ai-btn-extract').textContent = '✨ Ekstrak Pesanan'; document.getElementById('ai-btn-extract').disabled = false; }
}

// AI UNTUK BOSS (PENGELUARAN/BELANJA VENDOR)
async function prosesAIPengeluaran() {
  let text = document.getElementById('ai-peng-text').value.trim();
  if(!text) { toast("Silakan ketik detail belanja/pengeluaran di kolom teks!", 3000); return; }
  toast("✨ AI sedang memecah nota belanja Anda...", 3000);
  let btn = document.getElementById('ai-btn-peng'); btn.textContent = '⏳ Memproses...'; btn.disabled = true;
  let listVendors = VENDORS.map(v => v.nama).join(", ");
  
  let prompt = `Ekstrak kalimat pencatatan belanja/pengeluaran toko berikut ke format JSON. Daftar vendor/toko: ${listVendors}. Kategori tersedia: ${TOKO.kategoriPengeluaran.join(', ')}, Belanja Vendor / Maklon Cetak.
  Format JSON:
  {
    "ket": "Nama barang/bahan", "kategori": "Pilih persis salah satu dari kategori tersedia yang paling cocok", "vendor": "Nama toko/vendor", "qty": 1, "harga_satuan": 500000, "status": "Lunas atau Hutang"
  }
  Teks belanja boss: "${text}"`;

  try {
    let res = await fetchGemini(prompt, true); let data = JSON.parse(res);
    
    if(data.kategori) {
        let el = document.getElementById('mv-kategori');
        for(let i=0; i<el.options.length; i++) { if(el.options[i].value === data.kategori) el.selectedIndex = i; }
    }
    document.getElementById('mv-vendor').value = data.vendor || '';
    document.getElementById('mv-nama').value = data.ket || '';
    document.getElementById('mv-qty').value = data.qty || 1;
    document.getElementById('mv-harga').value = data.harga_satuan ? formatRibuan(data.harga_satuan) : '';
    if(data.status) {
        let r = document.querySelector(`input[name="mv_bayar"][value="${data.status}"]`);
        if(r) { r.checked = true; toggleDPMv(); }
    }

    toast("✨ Ekstraksi data belanja selesai!", 2500); document.getElementById('ai-peng-text').value = '';
  } catch (err) { console.error(err); toast("Maaf, AI gagal memproses data kulakan.", 3000);
  } finally { btn.textContent = '✨ Ekstrak Belanja'; btn.disabled = false; }
}

async function waReminderAI(wa, nama, sisaTagihan) {
  toast("✨ AI sedang merangkai pesan penagihan...", 2500);
  let prompt = `Buatkan 1 draf pesan WhatsApp penagihan sangat ramah untuk bisnis Abunawas Percetakan. Nomor kontak Kasir (${curUser.wa}). Data Pelanggan: ${nama}. Sisa Tagihan Belum Lunas: Rp ${sisaTagihan.toLocaleString('id-ID')}. Tambahkan emoji.`;
  try {
    let res = await fetchGemini(prompt, false); let msg = res.trim();
    if(wa) { sendWA(wa, msg); } else { alert("Draf Pesan Tagihan AI ✨:\n\n" + msg); }
  } catch (err) { console.error(err); toast("Gagal menghubungi AI.", 3000); }
}

/* ════════════════ FUNGSI KATALOG PUBLIK (TEKS / TABEL) ════════════════ */
function showKatalog() { document.getElementById('pg-login').style.display = 'none'; document.getElementById('pg-katalog').style.display = 'block'; renderKatalog(); }
function closeKatalog() { document.getElementById('pg-katalog').style.display = 'none'; document.getElementById('pg-login').style.display = 'flex'; }
function renderKatalog() {
  let wrap = document.getElementById('katalog-content');
  if (BARANG.length === 0) { wrap.innerHTML = '<div style="text-align:center; color:var(--tx3); padding:40px; font-size:14px; font-weight:600;">Data pricelist masih kosong.</div>'; return; }
  
  let cats = {}; 
  BARANG.forEach(b => { if(!cats[b.kat]) cats[b.kat] = []; cats[b.kat].push(b); });
  
  let html = '';
  for (let c in cats) {
    html += `
      <div style="margin-top:40px; margin-bottom:20px; text-align:left;">
        <h2 style="font-size:22px; font-weight:900; color:var(--tx); display:inline-block; border-bottom:3px solid var(--blue); padding-bottom:8px; margin-bottom:20px;">${c}</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
    `;
    cats[c].forEach(b => {
       let tierHtml = b.tiers.map((t, idx) => {
          let prev = idx > 0 ? b.tiers[idx-1].max + 1 : 1; 
          let qtyLabel = t.max === 9999 ? `Qty ≥ ${prev} ${b.satuan}` : `Qty ${prev} - ${t.max} ${b.satuan}`;
          let btmBorder = idx === b.tiers.length - 1 ? 'none' : '1px dashed var(--bdr)';
          return `<div style="display:flex; justify-content:space-between; font-size:14px; padding:12px 0; border-bottom:${btmBorder};">
                    <span style="color:var(--tx2); font-weight:600;">${qtyLabel}</span>
                    <span style="font-weight:800; color:var(--blue-d); font-size:15px;">${fmtRp(t.h)}</span>
                  </div>`;
       }).join('');
       html += `
          <div style="background:var(--surf); border-radius:16px; padding:24px; box-shadow:0 4px 15px rgba(0,0,0,0.03); border:1px solid var(--bdr); text-align:left;">
            <div style="margin-bottom:12px; padding-bottom:16px; border-bottom:1px solid var(--bdr);">
                <div style="font-weight:900; font-size:18px; color:var(--tx); margin-bottom:6px;">${b.nama}</div>
                <div style="font-size:13px; color:var(--tx3); font-family:var(--mono); font-weight:800;">Kode: ${b.kode}</div>
            </div>
            <div>${tierHtml}</div>
          </div>
       `;
    }); 
    html += `</div></div>`;
  }
  wrap.innerHTML = html;
}

/* ════════════════ LOGIKA LOGIN & SETUP UTAMA ════════════════ */
function pickRole(u,p,el){ document.querySelectorAll('.rc').forEach(function(r){r.classList.remove('sel');}); el.classList.add('sel'); document.getElementById('inp-u').value=u; document.getElementById('inp-p').value=p; document.getElementById('lerr').style.display='none'; }
function login(){
  var u=document.getElementById('inp-u').value.trim().toLowerCase(); var p=document.getElementById('inp-p').value; var err=document.getElementById('lerr');
  var found=USERS.find(function(x){return x.u===u && x.p===p && x.aktif;});
  if(found){ curUser=found; err.style.display='none'; document.getElementById('pg-login').style.display='none'; document.getElementById('pg-app').style.display='flex'; setupApp();
  } else { err.style.display='block'; err.textContent='Username atau password salah. Hubungi Boss.'; document.getElementById('inp-p').value=''; }
}
function resetLogin(){document.getElementById('inp-u').value='';document.getElementById('inp-p').value='';document.getElementById('lerr').style.display='none';}
function doLogout(){ curUser=null; if(bChart){try{bChart.destroy();}catch(e){}bChart=null;} if(pChart){try{pChart.destroy();}catch(e){}pChart=null;} document.getElementById('pg-app').style.display='none'; document.getElementById('pg-login').style.display='flex'; resetLogin(); }

function setupApp(){
  var u=curUser; var avText=u.nama.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
  var topAv = document.getElementById('t-av'); topAv.textContent = avText; topAv.className = 'uav ' + (u.role==='boss'?'av-boss':u.role==='admin'?'av-admin':'av-kasir');
  document.getElementById('t-name').textContent = u.nama; document.getElementById('t-role').textContent = u.role==='boss'?'Owner / Boss':u.role==='admin'?'Admin':'Kasir Depan';
  buildSidebar(u.role); var m=MENUS[u.role]||[]; var first=m.find(function(i){return i.id;}); if(first) showPage(first.id);
  
  populateFiBrg(); populateFiVnd(); renderCart(); populateKategoriProduk(); populateSatuanJual();
  var shUrl = localStorage.getItem('abunawas_sheet_url'); if(shUrl) document.getElementById('setting-sheet-url').value = shUrl;
  populateKomisiPegawai();
  updatePiutangBadge();
}

function buildSidebar(role){
  var m=MENUS[role]||[]; var html='';
  m.forEach(function(item){
    if(item.sec){html+='<div class="sb-sec">'+item.sec+'</div>';return;}
    html+='<div class="sbi" id="sb-'+item.id+'" onclick="showPage(\''+item.id+'\')">'+(ICOS[item.ico]||'')+'<span>'+item.label+'</span></div>';
  });
  // Sidebar footer
  html += '<div style="margin-top:auto; padding-top:24px; border-top:1px solid var(--bdr); margin-left:-4px; margin-right:-4px; padding-left:12px; padding-right:12px;">' +
    '<div style="display:flex;align-items:center;gap:8px; padding:10px 12px; border-radius:10px; background:var(--blue-l);">' +
    '<div style="width:28px;height:28px;background:linear-gradient(135deg,#2563EB,#7C3AED);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
    '</div>' +
    '<div><div style="font-size:11px;font-weight:800;color:var(--blue-d);">Abunawas POS</div>' +
    '<div style="font-size:10px;color:var(--tx3); font-weight:600;">v3.0 ✦ AI Powered</div></div>' +
    '</div></div>';
  document.getElementById('sb-content').innerHTML=html;
}

function toggleSidebar() { var sb = document.getElementById('sidebar-main'); var ov = document.getElementById('sidebar-overlay'); if(sb) sb.classList.toggle('on'); if(ov) ov.classList.toggle('on'); }

function showPage(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.sbi').forEach(function(s){s.classList.remove('on');});
  var pg=document.getElementById('pg-'+id); var sb=document.getElementById('sb-'+id);
  if(pg) pg.classList.add('on'); if(sb) sb.classList.add('on');
  var mainSb = document.getElementById('sidebar-main'); var ov = document.getElementById('sidebar-overlay');
  if(mainSb && mainSb.classList.contains('on')) { mainSb.classList.remove('on'); if(ov) ov.classList.remove('on'); }
  // ✅ Auto-scroll ke atas saat ganti halaman
  window.scrollTo({top: 0, behavior: 'smooth'});
  var main = document.getElementById('main-content');
  if(main) main.scrollTo({top: 0, behavior: 'smooth'});

  var fn={
    'dashboard':renderDash, 
    'input':function(){
        populateFiBrg(); renderCart(); 
        document.getElementById('lbl-tarif-km').textContent = fmtRp(TOKO.ongkirKm); 
        updateIdCust(); 
        if(!currentEditTrxId) document.getElementById('fi-no-cetak').value = generateNoCetak();
    }, 
    'transaksi':renderTrx, 'piutang':renderPiutang,
    'pengeluaran':function(){populateFiVnd(); populateKategoriPengeluaran(); renderPengeluaran(); renderCartVendor();}, 'hutang-pengeluaran':renderHutangPengeluaran, 'pelanggan':renderPelanggan,
    'barang':renderBrg, 'barang-vendor':renderBrgVendor, 'laporan':renderLaporan, 'dash-admin':renderDashAdmin,
    'pegawai':renderPegawaiData, 'kasir-riwayat':renderKasirRiwayat, 'vendor':renderVendor, 'hutang-vendor':renderHutangVendor,
    'setting':renderSetting, 'laci': renderLaci, 'kasbon': renderKasbon,
    'audit': renderAuditLog,
    'tagihan': renderTagihan,
    'skor': renderSkorFinansial,
    'aiadvisor': initAIAdvisor,
    'ocr': function(){},
    'voice': initVoicePage,
    'kalkulator': initKalkulator,
    'backup': initBackupPage
  };
  if(fn[id]) try{fn[id]();}catch(e){console.error('Render error:',id,e);}
}

/* ════════════════ MENU LACI KASIR ════════════════ */
function renderLaci() {
  let d = nowDate(); document.getElementById('lc-date').textContent = d;
  let modalLaci = MODAL_LACI[d] || 0;
  document.getElementById('lc-modal').value = modalLaci > 0 ? formatRibuan(modalLaci) : '';
  document.getElementById('lc-val-modal').textContent = fmtRp(modalLaci);

  let cashIn = 0;
  TRX.forEach(t => { if(t.tgl === d && t.metode === 'Cash' && t.dibayar > 0) cashIn += t.dibayar; });

  let cashOut = 0;
  PENGELUARAN.forEach(p => { 
      if(p.tgl === d) {
          if (p.status === 'Lunas') cashOut += p.total;
          else if (p.status === 'DP') cashOut += (p.dibayar || 0);
      } 
  });
  
  let kasbonOut = 0;
  KASBON.forEach(k => { if(k.tgl === d) kasbonOut += k.nominal; });

  document.getElementById('lc-val-in').textContent = '+ ' + fmtRp(cashIn);
  document.getElementById('lc-val-out').textContent = '- ' + fmtRp(cashOut);
  document.getElementById('lc-val-kasbon').textContent = '- ' + fmtRp(kasbonOut);
  
  let finalLaci = modalLaci + cashIn - cashOut - kasbonOut;
  document.getElementById('lc-val-total').textContent = fmtRp(finalLaci);
}
function simpanModalLaci() { let m = cleanRibuan(document.getElementById('lc-modal').value); let d = nowDate(); MODAL_LACI[d] = m; saveData(); toast('Modal laci tersimpan!', 2500, 'success'); renderLaci(); }

/* ════════════════ MENU KASBON KARYAWAN ════════════════ */
function renderKasbon() {
    let selectHtml = '<option value="">-- Pilih Pegawai --</option>' + PEGAWAI.map(p => `<option value="${p.nama}">${p.nama} (${p.posisi})</option>`).join('');
    document.getElementById('kb-pegawai').innerHTML = selectHtml;
    
    let dInp = document.getElementById('kb-tgl');
    if(!dInp.value) dInp.value = nowDate();
    
    let rows = KASBON.sort((a,b) => new Date(b.tgl) - new Date(a.tgl)).map((k, i) => {
        let delBtn = (curUser.role === 'boss') ? `<button class="btn btn-red btn-xs" onclick="hapusKasbon(${i})">Hapus</button>` : '';
        return `<tr><td class="mono">${k.tgl}</td><td style="font-weight:700">${k.nama}</td><td>${k.ket}</td><td style="font-weight:700; color:var(--red)">${fmtRp(k.nominal)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;">${delBtn}</div></td></tr>`;
    }).join('');
    document.getElementById('kasbon-tbl').innerHTML = `<table><thead><tr><th>Tanggal</th><th>Nama Pegawai</th><th>Keterangan</th><th>Nominal Ngambil (Rp)</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(5,'💸','Belum ada data kasbon.')}</tbody></table>`;
}

function simpanKasbon() {
    let nama = document.getElementById('kb-pegawai').value;
    let nominal = cleanRibuan(document.getElementById('kb-nominal').value);
    let ket = document.getElementById('kb-ket').value.trim() || 'Kasbon';
    let tgl = document.getElementById('kb-tgl').value;
    
    if(!nama || nominal <= 0) { alert('Pilih nama pegawai dan masukkan nominal kasbon yang benar!'); return; }
    
    KASBON.unshift({id: nowId(), tgl: tgl, nama: nama, nominal: nominal, ket: ket});
    logActivity('CREATE', 'Kasbon', { label: 'Kasbon '+nama+' — Rp '+fmt(nominal)+' ('+ket+')' });
    saveData();
    document.getElementById('kb-nominal').value = ''; document.getElementById('kb-ket').value = '';
    renderKasbon();
    if(tgl === nowDate()) renderLaci();
    toast('Data kasbon berhasil disimpan (Memotong Laci Hari Ini)!', 3500, 'success');
}
function hapusKasbon(i) {
    if(confirm('Yakin hapus data kasbon ini? Jika dihapus, saldo di Laci Kasir akan kembali/bertambah.')) {
        let kb = KASBON[i];
        logActivity('DELETE', 'Kasbon', { label: 'Hapus kasbon '+kb.nama+' — Rp '+fmt(kb.nominal), before: kb });
        KASBON.splice(i, 1); saveData(); renderKasbon(); renderLaci(); toast('Kasbon dihapus.', 2500, 'success');
    }
}


/* ════════════════ PENGATURAN TOKO (DINAMIS REKENING DLL) ════════════════ */
function renderSetting() {
    document.getElementById('set-ongkir-km').value = TOKO.ongkirKm || 2000;
    document.getElementById('set-qris-img').value = TOKO.qrisImg || '';
    document.getElementById('set-qris-link').value = TOKO.qrisLink || '';
    document.getElementById('set-use-stok').checked = TOKO.useStok || false;
    
    let keyEl = document.getElementById('set-gemini-key');
    let statusEl = document.getElementById('ai-key-status');
    let savedKey = localStorage.getItem('abunawas_gemini_key') || '';
    if(keyEl) keyEl.value = savedKey;
    if(statusEl) {
        statusEl.textContent = savedKey ? '✅ API Key sudah tersimpan. Fitur AI aktif!' : '⚠️ API Key belum diisi. Fitur AI tidak akan bisa digunakan.';
        statusEl.style.color = savedKey ? 'var(--green-d)' : 'var(--amber-d)';
    }
    
    renderSetRek();
    renderSetKat();
    renderSetKatProduk();
    renderSetSatuan();
}

function renderSetRek() {
    let html = (TOKO.rekening||[]).map((r, i) => `
        <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
            <input id="sr-b-${i}" value="${r.bank}" placeholder="Nama Bank/E-Wallet" style="width:28%; padding:8px; border:1px solid var(--bdr); border-radius:6px; font-family:var(--fn); background:var(--surf); color:var(--tx);" oninput="autoSaveRek()">
            <input id="sr-n-${i}" value="${r.no}" placeholder="Nomor Rekening" style="width:34%; padding:8px; border:1px solid var(--bdr); border-radius:6px; font-family:var(--mono); background:var(--surf); color:var(--tx);" oninput="autoSaveRek()">
            <input id="sr-a-${i}" value="${r.an}" placeholder="Atas Nama" style="width:34%; padding:8px; border:1px solid var(--bdr); border-radius:6px; font-family:var(--fn); background:var(--surf); color:var(--tx);" oninput="autoSaveRek()">
            <button class="btn btn-red btn-xs" onclick="delSetRek(${i})" style="padding:0 12px; height:36px; flex-shrink:0;">✕</button>
        </div>
    `).join('');
    if(!html) html = '<div style="font-size:12px; color:var(--tx3); text-align:center; padding:10px;">Belum ada rekening — klik "+ Tambah" untuk menambahkan</div>';
    document.getElementById('set-rek-wrap').innerHTML = html;
}
function autoSaveRek() {
    if(!TOKO.rekening) return;
    var newRek = [];
    for(let i=0; i<TOKO.rekening.length; i++){
        var b=document.getElementById('sr-b-'+i), n=document.getElementById('sr-n-'+i), a=document.getElementById('sr-a-'+i);
        if(b&&n&&a) newRek.push({bank:b.value.trim(), no:n.value.trim(), an:a.value.trim()});
    }
    TOKO.rekening = newRek;
    saveDataSilent();
}
function tambahSetRek() { 
    if(!TOKO.rekening) TOKO.rekening = [];
    TOKO.rekening.push({bank:'', no:'', an:''}); 
    saveDataSilent();
    renderSetRek(); 
}
function delSetRek(i) { 
    autoSaveRek(); // flush current edits first
    TOKO.rekening.splice(i,1); 
    saveDataSilent();
    renderSetRek(); 
    toast('Rekening dihapus.', 1500, 'success');
}

function renderSetKat() {
    let html = (TOKO.kategoriPengeluaran||[]).map((k, i) => `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--surf2); border:1px solid var(--bdr); border-radius:99px; font-size:12px; font-weight:600;">
            ${k} <button style="background:transparent; border:none; color:var(--red); cursor:pointer; font-weight:800;" onclick="delSetKat(${i})">✕</button>
        </span>
    `).join('');
    document.getElementById('set-kat-wrap').innerHTML = html;
}
function tambahSetKat() {
    let inp = document.getElementById('set-new-kat'); let val = inp.value.trim();
    if(val && !TOKO.kategoriPengeluaran.includes(val)) { TOKO.kategoriPengeluaran.push(val); inp.value=''; renderSetKat(); }
}
function delSetKat(i) { TOKO.kategoriPengeluaran.splice(i,1); renderSetKat(); }

function renderSetKatProduk() {
    let html = (TOKO.kategoriProduk||[]).map((k, i) => `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--surf2); border:1px solid var(--bdr); border-radius:99px; font-size:12px; font-weight:600;">
            ${k} <button style="background:transparent; border:none; color:var(--red); cursor:pointer; font-weight:800;" onclick="delSetKatProduk(${i})">✕</button>
        </span>
    `).join('');
    document.getElementById('set-kat-prod-wrap').innerHTML = html;
}
function tambahSetKatProduk() {
    let inp = document.getElementById('set-new-kat-prod'); let val = inp.value.trim();
    if(val && !TOKO.kategoriProduk.includes(val)) { TOKO.kategoriProduk.push(val); inp.value=''; renderSetKatProduk(); }
}
function delSetKatProduk(i) { TOKO.kategoriProduk.splice(i,1); renderSetKatProduk(); }

function renderSetSatuan() {
    let html = (TOKO.satuanJual||[]).map((k, i) => `
        <span style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--surf2); border:1px solid var(--bdr); border-radius:99px; font-size:12px; font-weight:600;">
            ${k} <button style="background:transparent; border:none; color:var(--red); cursor:pointer; font-weight:800;" onclick="delSetSatuan(${i})">✕</button>
        </span>
    `).join('');
    document.getElementById('set-satuan-wrap').innerHTML = html;
}
function tambahSetSatuan() {
    let inp = document.getElementById('set-new-satuan'); let val = inp.value.trim();
    if(val && !TOKO.satuanJual.includes(val)) { TOKO.satuanJual.push(val); inp.value=''; renderSetSatuan(); }
}
function delSetSatuan(i) { TOKO.satuanJual.splice(i,1); renderSetSatuan(); }

function populateKategoriProduk() {
    let el = document.getElementById('dl-kat');
    if(el) {
        el.innerHTML = (TOKO.kategoriProduk||[]).map(k => `<option value="${k}">`).join('');
    }
}

function populateSatuanJual() {
    let el = document.getElementById('dl-sat');
    if(el) {
        el.innerHTML = (TOKO.satuanJual||[]).map(k => `<option value="${k}">`).join('');
    }
}

function simpanSetting() {
    // Save rekening
    let newRek = [];
    if(TOKO.rekening) {
        for(let i=0; i<TOKO.rekening.length; i++) {
            let b = document.getElementById('sr-b-'+i).value.trim(); let n = document.getElementById('sr-n-'+i).value.trim(); let a = document.getElementById('sr-a-'+i).value.trim();
            if(b || n || a) newRek.push({bank: b, no: n, an: a});
        }
    }
    TOKO.rekening = newRek;
    TOKO.ongkirKm = parseInt(document.getElementById('set-ongkir-km').value) || 2000;
    
    let rawQrisImg = document.getElementById('set-qris-img').value.trim();
    if(rawQrisImg.includes('drive.google.com/file/d/')) {
       let match = rawQrisImg.match(/\/d\/(.+?)\//);
       if(match && match[1]) rawQrisImg = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    TOKO.qrisImg = rawQrisImg;
    TOKO.qrisLink = document.getElementById('set-qris-link').value.trim();
    
    TOKO.useStok = document.getElementById('set-use-stok').checked;
    
    // Save Gemini API key
    let geminiKey = document.getElementById('set-gemini-key').value.trim();
    localStorage.setItem('abunawas_gemini_key', geminiKey);
    apiKey = geminiKey;
    
    logActivity('UPDATE', 'Pengaturan', { label: 'Simpan pengaturan toko' });
    saveData(); 
    renderSetting(); 
    populateKategoriProduk();
    populateSatuanJual();
    toast('✔️ Pengaturan Toko berhasil disimpan!', 2500, 'success');
}

/* ════════════════ DASHBOARD KHUSUS BOSS ════════════════ */
function scBox(l,v,col){
  var icons = {blue:'📅', green:'📆', amber:'🗓️', purple:'🏆'};
  return '<div class="card" style="margin:0; border-top:3px solid var(--'+col+'); padding:18px 20px;">' +
    '<div class="card-t" style="margin-bottom:8px;">' + (icons[col]||'') + ' ' + l + '</div>' +
    '<div style="font-size:18px;font-weight:800;color:var(--'+col+'-d, var(--'+col+'));font-family:var(--mono);">' + v + '</div>' +
  '</div>';
}
function sc(l,v,vs,s,ss,col){var accent=col||'blue'; return '<div class="stat" style="--stat-accent:var(--'+accent+')"><div class="sl">'+l+'</div><div class="sv" style="'+vs+'">'+v+'</div><div class="ss" style="'+ss+'">'+s+'</div></div>';}

function renderDash(){
  var h=new Date().getHours();
  var salam = h < 11 ? '🌅 Selamat Pagi' : h < 15 ? '☀️ Selamat Siang' : h < 18 ? '🌤️ Selamat Sore' : '🌙 Selamat Malam';
  var namaUser = curUser ? curUser.nama.split(' ')[0] : 'Boss';
  document.getElementById('d-date').innerHTML = salam + ', <b>' + namaUser + '</b> — ' + new Date().toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'});

  var strToday = nowDate(); var strMonth = strToday.substring(0,7); var strYear = strToday.substring(0,4);
  var curr = new Date(); var firstDay = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
  var startOfWeek = new Date(curr.setDate(firstDay)).toISOString().split('T')[0];

  var oHari=0, oMinggu=0, oBulan=0, oTahun=0;
  TRX.forEach(function(t){
    if(t.tgl === strToday) oHari += t.total;
    if(t.tgl >= startOfWeek && t.tgl <= strToday) oMinggu += t.total;
    if(t.tgl.startsWith(strMonth)) oBulan += t.total;
    if(t.tgl.startsWith(strYear)) oTahun += t.total;
  });
  document.getElementById('dash-recap-omzet').innerHTML = scBox('Hari Ini', fmtRp(oHari), 'blue') + scBox('Pekan Ini', fmtRp(oMinggu), 'green') + scBox('Bulan Ini', fmtRp(oBulan), 'amber') + scBox('Tahun Ini', fmtRp(oTahun), 'purple');

  var p = document.getElementById('d-period').value; var selText = document.getElementById('d-period').options[document.getElementById('d-period').selectedIndex].text;
  document.getElementById('d-stat-lbl').textContent = '(' + selText + ')';

  var fTrx = TRX.filter(function(t){
    if(p==='today') return t.tgl === strToday; if(p==='week') return t.tgl >= startOfWeek && t.tgl <= strToday;
    if(p==='month') return t.tgl.startsWith(strMonth); if(p==='year') return t.tgl.startsWith(strYear); return true;
  });

  var omzet = fTrx.reduce((s,t) => s+t.total, 0);
  var piutang = fTrx.filter(t => t.sisa > 0).reduce((s,t) => s+t.sisa, 0);

  var fExp = PENGELUARAN.filter(v => {
    if(p==='today') return v.tgl === strToday; if(p==='week') return v.tgl >= startOfWeek && v.tgl <= strToday;
    if(p==='month') return v.tgl.startsWith(strMonth); if(p==='year') return v.tgl.startsWith(strYear); return true;
  });
  
  var modal = fExp.filter(v => v.kategori==='Belanja Vendor / Maklon Cetak').reduce((s,v) => s+v.total, 0);
  var laba = omzet - modal;
  var hutangExp = fExp.filter(v => v.status==='Hutang').reduce((s,v) => s+v.total, 0);

  document.getElementById('d-stats').innerHTML=
    sc('Omzet Tersaring',fmtRp(omzet),'color:var(--blue-d)',fTrx.length+' Transaksi Nota','color:var(--tx2)','blue')+
    sc('Modal / Pengeluaran',fmtRp(modal),'color:var(--tx2)','Belanja Vendor & Operasional','color:var(--tx2)','green')+
    sc('Laba Kotor',fmtRp(laba),'color:var(--green-d)',omzet?'Profit Margin '+Math.round(laba/omzet*100)+'%':'—','color:var(--green)','green')+
    sc('Piutang Pelanggan',fmtRp(piutang),'color:var(--red-d)',fTrx.filter(t=>t.sisa>0).length+' nota belum lunas','color:var(--red)','red')+
    sc('Hutang Boss Keluar',fmtRp(hutangExp),'color:var(--red-d)',fExp.filter(v=>v.status==='Hutang').length+' tagihan belum bayar','color:var(--red)','amber');

  var rows=fTrx.slice(0,5).map(function(t){
    let mainItem = (t.items && t.items.length > 0) ? t.items[0].barang : 'Pesanan'; let extraItems = (t.items && t.items.length > 1) ? ` +${t.items.length-1} lgi` : '';
    let editBtn = `<button class="btn btn-amber btn-xs" onclick="editTrx('${t.id}')">Edit</button>`;
    return `<tr><td class="mono">${t.id}</td><td style="font-weight:600">${t.pelanggan}</td><td>${mainItem}${extraItems}</td><td style="font-weight:700;color:var(--blue)">${fmtRp(t.total)}</td><td>${badgeBayar(t.bayar)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;">${editBtn}</div></td></tr>`;
  }).join('');
  document.getElementById('d-trx').innerHTML='<div class="tbl-wrap"><table><thead><tr><th>ID Nota</th><th>Pelanggan</th><th>Barang/Jasa</th><th>Total (Rp)</th><th>Bayar</th><th>Aksi</th></tr></thead><tbody>'+(rows||emptyRow(6,'📊','Belum ada transaksi di periode ini'))+'</tbody></table></div>';

  renderCharts(fTrx);
}

function renderCharts(fTrx){
  if(bChart){try{bChart.destroy();}catch(e){}bChart=null;} if(pChart){try{pChart.destroy();}catch(e){}pChart=null;}
  var c1=document.getElementById('ch-bar'),c2=document.getElementById('ch-pie'); if(!c1||!c2) return;
  try{
    // Build real 7-day data
    var days7 = []; var labels7 = []; var dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    for(var di=6;di>=0;di--){ var d=new Date(); d.setDate(d.getDate()-di); days7.push(d.toISOString().split('T')[0]); labels7.push(dayNames[d.getDay()]); }
    var realOmzet = days7.map(dd => TRX.filter(t=>t.tgl===dd).reduce((s,t)=>s+t.total,0));
    var realModal = days7.map(dd => PENGELUARAN.filter(p=>p.tgl===dd && p.kategori==='Belanja Vendor / Maklon Cetak').reduce((s,p)=>s+p.total,0));
    var hasData = realOmzet.some(v=>v>0);
    var chartColors = getComputedStyle(document.documentElement);

    bChart=new Chart(c1,{type:'bar',data:{labels:labels7,datasets:[
      {label:'Omzet',data:realOmzet,backgroundColor:'rgba(59,130,246,0.7)',borderRadius:6,barPercentage:.6},
      {label:'Modal', data:realModal,backgroundColor:'rgba(16,185,129,0.6)',borderRadius:6,barPercentage:.6}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:11},boxWidth:12,color:chartColors.getPropertyValue('--tx')}}},scales:{x:{grid:{display:false},ticks:{color:chartColors.getPropertyValue('--tx2')}},y:{ticks:{color:chartColors.getPropertyValue('--tx2'),callback:function(v){return v>=1000000?'Rp '+(v/1000000).toFixed(1)+'jt':v>=1000?'Rp '+(v/1000).toFixed(0)+'rb':'Rp '+v;}},grid:{color:'rgba(100,100,100,0.08)'}}}}});
    
    var lunas = fTrx.filter(t=>t.bayar==='Lunas').length; var dp = fTrx.filter(t=>t.bayar==='DP').length; var hutang = fTrx.filter(t=>t.bayar==='Hutang').length;
    if(fTrx.length===0){ lunas=1; dp=0; hutang=0; } 
    pChart=new Chart(c2,{type:'doughnut',data:{labels:['Lunas','Titip Uang','Belum Lunas'],datasets:[{data:[lunas,dp,hutang],backgroundColor:['#34D399','#FBBF24','#F87171'],borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'66%',plugins:{legend:{position:'bottom',labels:{font:{size:11},boxWidth:12,padding:10,color:chartColors.getPropertyValue('--tx')}}}}});
  }catch(e){console.error('Chart error:',e);}
}

/* ════════════════ LOGIKA KERANJANG & INPUT TRANSAKSI (POS) ════════════════ */
function editTrx(id) {
    let t = TRX.find(x => x.id === id);
    if(!t) return;
    
    currentEditTrxId = id;
    showPage('input');
    document.getElementById('pos-title').textContent = 'Edit Transaksi: ' + id;
    document.getElementById('btn-batal-edit-trx').style.display = 'inline-flex';

    document.getElementById('fi-nama').value = t.pelanggan !== 'Pelanggan Umum' && t.pelanggan !== 'UMUM' ? t.pelanggan : '';
    document.getElementById('fi-wa').value = t.wa || '';
    document.getElementById('fi-alamat').value = t.alamat || '';
    document.getElementById('fi-id-cust').value = t.id_cust || '';

    CART = JSON.parse(JSON.stringify(t.items || []));

    document.getElementById('fi-diskon').value = t.diskon ? formatRibuan(t.diskon) : '';
    document.getElementById('fi-ongkir').value = t.ongkir ? formatRibuan(t.ongkir) : '';
    document.getElementById('fi-jarak').value = (t.ongkir && TOKO.ongkirKm) ? (t.ongkir / TOKO.ongkirKm) : '0';

    
    
    
    document.getElementById('fi-no-cetak').value = t.no_cetak || '';
    document.getElementById('fi-catatan').value = t.catatan || '';

    let rLunas = document.querySelector('input[name="fi_bayar"][value="Lunas"]');
    let rDP = document.querySelector('input[name="fi_bayar"][value="DP"]');
    let rHutang = document.querySelector('input[name="fi_bayar"][value="Hutang"]');

    if(t.bayar === 'Lunas') rLunas.checked = true;
    else if(t.bayar === 'DP') { rDP.checked = true; document.getElementById('fi-dp-val').value = formatRibuan(t.dibayar); }
    else rHutang.checked = true;

    toggleDP('fi');
    renderCart();
    toast('Mode Edit diaktifkan untuk ' + id, 2500, 'warning');
}

function batalEditTrx() {
    currentEditTrxId = null;
    document.getElementById('pos-title').textContent = 'POS Transaksi Kasir';
    document.getElementById('btn-batal-edit-trx').style.display = 'none';

    document.getElementById('fi-nama').value=''; document.getElementById('fi-wa').value=''; document.getElementById('fi-alamat').value=''; document.getElementById('fi-id-cust').value='';
    document.getElementById('fi-kode').value=''; document.getElementById('fi-qty').value='1'; 
    document.getElementById('fi-no-cetak').value = generateNoCetak();
    document.getElementById('fi-catatan').value=''; 
    document.getElementById('fi-harga').value='';
    document.getElementById('fi-jarak').value='0'; document.getElementById('fi-ongkir').value=''; document.getElementById('fi-diskon').value='';
    
    document.querySelector('input[name="fi_bayar"][value="Lunas"]').checked = true; toggleDP('fi');

    CART = []; renderCart(); updateIdCust();
}

function populateFiBrg(){
  filterBrgByKat(); // use the new filtered version
  var pl = document.getElementById('fi-pel-list');
  if(pl) pl.innerHTML=PELANGGAN.map(p => `<option value="${p.nama}">`).join('');
}

function filterBrgByKat() {
  var katEl = document.getElementById('fi-kat-filter');
  var kat = katEl ? katEl.value : '';
  var dl = document.getElementById('fi-brg-list');
  var filtered = kat ? BARANG.filter(b => b.kategori === kat) : BARANG;
  if(dl) dl.innerHTML = filtered.map(b => `<option value="${b.kode} - ${b.nama}">`).join('');
  // populate kat dropdown
  var kats = [...new Set(BARANG.map(b=>b.kategori).filter(Boolean))];
  if(katEl && katEl.options.length <= 1) {
    kats.forEach(k => { var o = document.createElement('option'); o.value=k; o.textContent=k; katEl.appendChild(o); });
  }
}

function populateKomisiPegawai() {
    var el = document.getElementById('fi-komisi-pegawai');
    if(!el) return;
    let html = '<option value="">-- Pilih Karyawan --</option>';
    PEGAWAI.forEach(p => { html += `<option value="${p.nama}">${p.nama} (${p.posisi})</option>`; });
    el.innerHTML = html;
}

// Auto Fill Pelanggan
function autoPelanggan() {
  let inpNama = document.getElementById('fi-nama'); let val = inpNama.value.trim();
  let pel = PELANGGAN.find(p => p.nama.toLowerCase() === val.toLowerCase());
  if(pel) { 
      if(pel.wa) document.getElementById('fi-wa').value = pel.wa; 
      if(pel.alamat) document.getElementById('fi-alamat').value = pel.alamat; 
  }
  updateIdCust();
}

function updateIdCust() {
  let nama = document.getElementById('fi-nama').value.trim();
  let el = document.getElementById('fi-id-cust');
  if (!nama || nama.toLowerCase() === 'pelanggan umum') {
      el.value = 'UMUM';
  } else {
      let pel = PELANGGAN.find(p => p.nama.toLowerCase() === nama.toLowerCase());
      if (pel && pel.id_cust) el.value = pel.id_cust;
      else el.value = generateCustId();
  }
}

function autoFi(){
  var val=document.getElementById('fi-kode').value; var kode=val.split(' ')[0].trim().toUpperCase();
  var b=BARANG.find(x => x.kode===kode || x.nama.toLowerCase() === val.toLowerCase());
  var qty=parseInt(document.getElementById('fi-qty').value)||1;
  if(b){ document.getElementById('fi-harga').value = formatRibuan(getHarga(b,qty)); }
}

function tambahKeKeranjang() {
  let kodeVal = document.getElementById('fi-kode').value.trim();
  let qty = parseInt(document.getElementById('fi-qty').value) || 1;
  let hargaStr = document.getElementById('fi-harga').value; let harga = cleanRibuan(hargaStr);

  if(!kodeVal || harga <= 0) { toast('Pilih nama barang dan harganya!', 2500, 'error'); return; }

  let kode = kodeVal.split(' ')[0].toUpperCase();
  let b = BARANG.find(x => x.kode === kode || x.nama.toLowerCase() === kodeVal.toLowerCase());
  
  if (TOKO.useStok && b && !currentEditTrxId) {
    // Stok mode dinonaktifkan — makelar always unlimited
  }
      if ((b.stok || 0) < qty) {
          if(!confirm(`⚠️ Warning Stok: Stok fisik "${b.nama}" saat ini hanya ${b.stok||0}. Lanjutkan tambah ke keranjang?`)) return;
      }
  }

  CART.push({ kode: b ? b.kode : 'CSTM', barang: b ? b.nama : kodeVal, qty: qty, harga: harga, total: harga * qty, modal: (b ? b.modal : 0) * qty });
  document.getElementById('fi-kode').value = ''; document.getElementById('fi-qty').value = '1'; document.getElementById('fi-harga').value = '';
  renderCart(); toast('✔️ Barang ditambahkan ke pesanan!', 1500, 'success');
}

function hitungOngkir() {
    let jarak = parseFloat(document.getElementById('fi-jarak').value) || 0;
    let ongkir = (jarak > 2) ? (jarak - 2) * TOKO.ongkirKm : 0;
    document.getElementById('fi-ongkir').value = formatRibuan(ongkir); renderCart();
}

function renderCart() {
  let wrap = document.getElementById('cart-wrap'); if(!wrap) return;
  let sBar = document.getElementById('sticky-cart-summary');
  
  if(CART.length === 0) {
      wrap.innerHTML = '<div style="text-align:center; padding:24px; color:var(--tx3); font-size:12px;">Keranjang pesanan masih kosong.<br>Pilih barang di atas lalu klik Tambah.</div>';
      document.getElementById('fi-total').value = 'Rp 0'; hitungSisaDP(); 
      if(sBar) sBar.style.display = 'none';
      return;
  }

  let html = '<table style="margin-bottom:0;"><thead><tr><th>Barang / Jasa</th><th style="text-align:center">Qty</th><th style="text-align:right">Subtotal</th><th style="width:30px"></th></tr></thead><tbody>';
  let subtotal = 0;
  CART.forEach((item, idx) => {
      subtotal += item.total;
      html += `<tr>
          <td style="font-weight:700; line-height:1.4;">${item.barang}<br><span style="font-size:10px; color:var(--tx2); font-family:var(--mono);">${fmtRp(item.harga)}/sat</span></td>
          <td style="text-align:center; font-family:var(--mono);">x${item.qty}</td>
          <td style="font-weight:800; color:var(--blue-d); text-align:right;">${fmtRp(item.total)}</td>
          <td style="text-align:right;"><button class="btn btn-red btn-xs" onclick="hapusDariKeranjang(${idx})" style="padding:4px 8px;">X</button></td>
      </tr>`;
  });
  html += '</tbody></table>'; wrap.innerHTML = html;

  let diskon = cleanRibuan(document.getElementById('fi-diskon').value); let ongkir = cleanRibuan(document.getElementById('fi-ongkir').value);
  let grandTotal = subtotal - diskon + ongkir; if(grandTotal < 0) grandTotal = 0;

  document.getElementById('fi-total').value = fmtRp(grandTotal);
  if(document.querySelector('input[name="fi_bayar"]:checked').value === 'DP') toggleDP('fi'); 
  hitungSisaDP();
  
  // Update Sticky Bar
  if(sBar) {
      sBar.style.display = 'flex';
      document.getElementById('cart-item-count').innerText = CART.length;
      document.getElementById('cart-sub').innerText = fmtRp(subtotal);
      document.getElementById('cart-disc').innerText = fmtRp(diskon);
      document.getElementById('cart-tot').innerText = fmtRp(grandTotal);
  }
}

function hapusDariKeranjang(idx) { CART.splice(idx, 1); renderCart(); }

function hitungSisaDP() {
  let subtotal = CART.reduce((s, i) => s + i.total, 0);
  let grandTotal = subtotal - cleanRibuan(document.getElementById('fi-diskon').value) + cleanRibuan(document.getElementById('fi-ongkir').value);
  if(grandTotal < 0) grandTotal = 0;

  var sisa = grandTotal - cleanRibuan(document.getElementById('fi-dp-val').value); if(sisa < 0) sisa = 0;
  var sisaEl = document.getElementById('fi-dp-sisa'); if(sisaEl) sisaEl.textContent = 'Sisa Tagihan: ' + fmtRp(sisa);
}

function toggleDP(prefix) {
  var val = document.querySelector('input[name="fi_bayar"]:checked').value;
  var wrap = document.getElementById(prefix+'-dp-wrap'); var inp = document.getElementById(prefix+'-dp-val');
  if(val === 'DP') {
      wrap.style.display = 'block';
      let subtotal = CART.reduce((s, i) => s + i.total, 0);
      let grandTotal = subtotal - cleanRibuan(document.getElementById('fi-diskon').value) + cleanRibuan(document.getElementById('fi-ongkir').value);
      if(grandTotal < 0) grandTotal = 0;
      if(!inp.value && grandTotal > 0) inp.value = formatRibuan(Math.round(grandTotal / 2));
      document.getElementById('fi-dp-lbl').textContent = 'Nominal Uang Titipan (Rp)'; hitungSisaDP();
  } else { wrap.style.display = 'none'; inp.value = ''; }
}

function simpanTrxPage(actionType = 'nota'){
  var nama=document.getElementById('fi-nama').value.trim() || 'Pelanggan Umum';
  var wa=document.getElementById('fi-wa').value.trim(); var alamat=document.getElementById('fi-alamat').value.trim();
  var idCust=document.getElementById('fi-id-cust').value.trim();
  var bayar=document.querySelector('input[name="fi_bayar"]:checked').value; var dpVal=cleanRibuan(document.getElementById('fi-dp-val').value);
  
  var noCetak=document.getElementById('fi-no-cetak').value.trim();
  var catatan=document.getElementById('fi-catatan').value.trim();
  
  var komisiNama = ''; // dihapus dari form, nama kasir otomatis dari curUser
  var komisiNominal = 0;
  
  if(CART.length === 0) { alert('Daftar pesanan (keranjang) masih kosong!'); return; }
  
  var subtotal = CART.reduce((s, i) => s + i.total, 0); var modal = CART.reduce((s, i) => s + i.modal, 0);
  let diskon = cleanRibuan(document.getElementById('fi-diskon').value); let ongkir = cleanRibuan(document.getElementById('fi-ongkir').value);
  var total = subtotal - diskon + ongkir; if(total < 0) total = 0;
  
  var dibayar = (bayar === 'Lunas') ? total : ((bayar === 'DP') ? dpVal : 0);
  var sisa = total - dibayar; 
  var id = currentEditTrxId ? currentEditTrxId : nowId();
  
  if(nama !== 'Pelanggan Umum' && nama !== 'UMUM') {
      let existPel = PELANGGAN.find(p => p.nama.toLowerCase() === nama.toLowerCase());
      if(!existPel) { 
          let newId = generateCustId();
          if(!idCust || idCust === 'UMUM') idCust = newId;
          PELANGGAN.push({nama: nama, wa: wa, alamat: alamat, id_cust: idCust}); 
          if(document.getElementById('pg-pelanggan').classList.contains('on')) renderPelanggan();
      } else { 
          if(wa) existPel.wa = wa; 
          if(alamat) existPel.alamat = alamat; 
          if(idCust && idCust !== 'UMUM') existPel.id_cust = idCust; 
      }
  }

  if (currentEditTrxId) {
      let idx = TRX.findIndex(x => x.id === currentEditTrxId);
      if(idx >= 0) {
          let oldTrx = TRX[idx];
          if (TOKO.useStok) {
              (oldTrx.items || []).forEach(c => { let mBrg = BARANG.find(b => b.kode === c.kode); if(mBrg) mBrg.stok = (mBrg.stok || 0) + c.qty; });
              CART.forEach(c => { let mBrg = BARANG.find(b => b.kode === c.kode); if(mBrg) mBrg.stok = (mBrg.stok || 0) - c.qty; });
              if(document.getElementById('pg-barang').classList.contains('on')) renderBrg();
          }

          TRX[idx] = {
              id: currentEditTrxId, tgl: oldTrx.tgl, pelanggan: nama, wa: wa, alamat: alamat, id_cust: idCust, no_cetak: noCetak,
              items: JSON.parse(JSON.stringify(CART)), total: total, modal: modal, bayar: bayar, dibayar: dibayar, sisa: sisa,
              metode: (bayar==='Lunas' ? 'Cash' : oldTrx.metode),
              kasir: curUser.nama, catatan: catatan, diskon: diskon, ongkir: ongkir, komisiNama: komisiNama, komisiNominal: komisiNominal
          };
      }
      toast('✔️ Transaksi berhasil diupdate!', 2500, 'success');
      logActivity('UPDATE', 'Transaksi', { label: 'Edit transaksi '+currentEditTrxId+' — '+nama+' Rp '+fmt(total) });
  } else {
      if (TOKO.useStok) {
          CART.forEach(c => { let mBrg = BARANG.find(b => b.kode === c.kode); if (mBrg) mBrg.stok = (mBrg.stok || 0) - c.qty; });
          if(document.getElementById('pg-barang').classList.contains('on')) renderBrg();
      }
      TRX.unshift({
        id:id, tgl:nowDate(), pelanggan:nama, wa:wa, alamat:alamat, id_cust:idCust, no_cetak:noCetak,
        items:JSON.parse(JSON.stringify(CART)), total:total, modal:modal, 
        bayar:bayar, dibayar:dibayar, sisa:sisa, metode:(bayar==='Lunas'?'Cash':''),
        kasir:curUser.nama, catatan:catatan, diskon: diskon, ongkir: ongkir, komisiNama: komisiNama, komisiNominal: komisiNominal
      });
      logActivity('CREATE', 'Transaksi', { label: 'Transaksi baru '+id+' — '+nama+' Rp '+fmt(total)+' ['+bayar+']' });
      toast('✔️ Transaksi berhasil disimpan!', 2500, 'success');
      // ✅ AUTO-ROUTING: item yang punya vendor → otomatis masuk tagihan Belanja Vendor
      autoRoutingVendor(id, CART, nowDate());
  }

  batalEditTrx(); // Membersihkan form dan mereset status
  saveData();
  
  if (actionType === 'nota') { setTimeout(function(){ showNota(id); }, 500); }
  if(curUser && curUser.role === 'kasir' && document.getElementById('pg-kasir-riwayat').classList.contains('on')) renderKasirRiwayat();
  if(document.getElementById('pg-laci') && document.getElementById('pg-laci').classList.contains('on')) renderLaci();
}

/* ════════════════ TRANSAKSI (SEMUA) ════════════════ */
function hapusTrx(id) {
  if(!curUser || curUser.role !== 'boss') return;
  if(confirm(`⚠️ YAKIN HAPUS PERMANEN TRANSAKSI ${id}?\n\nStok yang terpotong tidak akan kembali otomatis!`)) {
     let idx = TRX.findIndex(t => t.id === id);
     if(idx >= 0) {
       let deletedTrx = TRX[idx];
       logActivity('DELETE', 'Transaksi', { label: 'Hapus transaksi '+id+' — '+deletedTrx.pelanggan, before: {id: deletedTrx.id, pelanggan: deletedTrx.pelanggan, total: deletedTrx.total} });
       TRX.splice(idx, 1); saveData(); renderTrx(); toast(`Transaksi ${id} dihapus permanen!`, 3000, 'success');
     }
  }
}

function renderTrx(){
  var q=(document.getElementById('trx-q')||{value:''}).value.toLowerCase(); var f=(document.getElementById('trx-f')||{value:''}).value;
  var data=TRX.filter(t => (!q||t.pelanggan.toLowerCase().indexOf(q)>=0||t.id.toLowerCase().indexOf(q)>=0||(t.id_cust||'').toLowerCase().indexOf(q)>=0) && (!f||t.bayar===f));
  var rows=data.map(t => {
    let trxItems = t.items || [{kode: t.kode, barang: t.barang, qty: t.qty, harga: t.harga, total: t.total}];
    let brgStr = trxItems.map(i => `<span style="font-size:12px">${i.barang} (x${i.qty})</span>`).join('<br>');
    let delBtn = (curUser && curUser.role === 'boss') ? `<button class="btn btn-red btn-xs" onclick="hapusTrx('${t.id}')">Hapus</button>` : '';
    let editBtn = `<button class="btn btn-amber btn-xs" onclick="editTrx('${t.id}')">Edit</button>`;

    return `<tr><td class="mono">${t.id}<br><span style="font-size:10px;color:var(--tx3)">${t.tgl}</span></td>
      <td style="font-weight:600">${t.pelanggan}<br><span style="font-size:10px;color:var(--tx3)">ID: ${t.id_cust||t.wa||'-'}</span></td>
      <td>${brgStr}</td><td style="font-weight:800;color:var(--blue-d)">${fmtRp(t.total)}</td><td>${badgeBayar(t.bayar)}</td>
      <td><div style="display:flex; gap:6px; flex-wrap:wrap;">${t.sisa>0?`<button class="btn btn-green btn-xs" onclick="bukaPelunasan('${t.id}')">Pelunasan</button>`:''}
      ${editBtn}
      <button class="btn btn-ghost btn-xs" onclick="showNota('${t.id}')">Nota</button>${delBtn}</div></td></tr>`;
  }).join('');
  document.getElementById('trx-tbl').innerHTML=`<table><thead><tr><th>ID / Tgl</th><th>Pelanggan</th><th>Detail Pesanan</th><th>Total Biaya</th><th>Bayar</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(6,'🧾','Belum ada transaksi')}</tbody></table>`;
}

function bukaPelunasan(id) { document.getElementById('pl-id').value = id; openModal('mo-pelunasan'); }
function prosesPelunasan() {
  let id = document.getElementById('pl-id').value; let met = document.getElementById('pl-metode').value; let t = TRX.find(x => x.id === id);
  if(t) { t.bayar = 'Lunas'; t.sisa = 0; t.dibayar = t.total; t.metode = met; saveData(); closeModal('mo-pelunasan'); renderTrx(); renderPiutang(); showNota(id); toast('✔️ Berhasil ditandai Lunas!', 2500, 'success'); }
}

/* ════════════════ PIUTANG ════════════════ */
function renderPiutang(){
  var data=TRX.filter(t => t.sisa > 0); var tot=data.reduce((s,t) => s+t.sisa, 0); var mx=data.length?Math.max.apply(null,data.map(t=>t.sisa)):0;
  document.getElementById('piu-stats').innerHTML= sc('Jumlah Tunggakan',data.length+' transaksi','color:var(--red-d)','','color:var(--tx2)','red')+ sc('Total Piutang Mengendap',fmtRp(tot),'color:var(--red-d)','Wajib ditagih','color:var(--red)','red')+ sc('Tunggakan Terbesar',fmtRp(mx),'color:var(--amber-d)','','color:var(--tx2)','amber');
    
  var rows=data.map(t => `<tr><td style="font-weight:600;">${t.pelanggan}<br><span class="mono" style="font-weight:400; color:var(--tx2)">ID: ${t.id_cust||t.wa||'-'}</span></td><td>${t.wa}</td><td style="font-weight:800;color:var(--red)">${fmtRp(t.sisa)}</td>
      <td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-green btn-xs" onclick="bukaPelunasan('${t.id}')">Lunas</button> <button class="btn btn-wa btn-xs" onclick="waReminder('${t.wa}','${t.pelanggan}',${t.sisa})">WA Standar</button> <button class="btn btn-ai btn-xs" onclick="waReminderAI('${t.wa}','${t.pelanggan}',${t.sisa})">✨ WA Pintar</button></div></td></tr>`).join('');
  document.getElementById('piu-tbl').innerHTML=`<table><thead><tr><th>Pelanggan</th><th>WhatsApp</th><th>Sisa Tagihan</th><th>Aksi Pelunasan</th></tr></thead><tbody>${rows||emptyRow(4,'🎉','Tidak ada piutang! Semua pelanggan sudah lunas.')}</tbody></table>`;
}
function waReminder(wa,nama,sisa){
  var msg=`Halo *${nama}*, kami dari *Abunawas Percetakan & Konveksi* ingin mengingatkan untuk tagihan Anda yang belum lunas sebesar *${fmtRp(sisa)}*. \n\nMohon kesediaannya untuk segera dilunasi via transfer atau ke toko. Terima kasih banyak! 🙏`;
  if(wa) sendWA(wa, msg); else alert('Tidak ada no WA. Simulasi Pesan:\n\n' + msg);
}

/* ════════════════ INPUT BELANJA & PENGELUARAN (VENDOR CART) ════════════════ */
function populateFiVnd() {
  var dl = document.getElementById('fi-vnd-list'); if(dl) dl.innerHTML=VENDORS.map(v => `<option value="${v.nama}">`).join('');
  var dl2 = document.getElementById('fi-brgvnd-list'); if(dl2) dl2.innerHTML=BARANG_VENDOR.map(b => `<option value="${b.nama}">`).join('');
}
function populateKategoriPengeluaran() {
  let el = document.getElementById('mv-kategori'); if(!el) return;
  let html = `<option value="Belanja Vendor / Maklon Cetak">Belanja Vendor / Maklon Cetak</option>`;
  (TOKO.kategoriPengeluaran||[]).forEach(k => { html += `<option value="${k}">${k}</option>`; });
  el.innerHTML = html;
}

function autoFiVnd() {
  let val = document.getElementById('mv-nama').value.trim(); let b = BARANG_VENDOR.find(x => x.nama.toLowerCase() === val.toLowerCase());
  if(b) { document.getElementById('mv-vendor').value = b.vendor || ''; document.getElementById('mv-harga').value = formatRibuan(b.harga); }
}

function tambahKeKeranjangVendor() {
    let nama = document.getElementById('mv-nama').value.trim();
    let qty = parseInt(document.getElementById('mv-qty').value) || 1;
    let harga = cleanRibuan(document.getElementById('mv-harga').value);
    
    if(!nama || harga <= 0) { toast("Isi Keterangan Barang dan Harga dengan benar!", 2000, 'error'); return; }
    
    CART_VND.push({ barang: nama, qty: qty, harga: harga, total: harga*qty });
    document.getElementById('mv-nama').value = ''; document.getElementById('mv-qty').value = '1'; document.getElementById('mv-harga').value = '';
    renderCartVendor();
}

function hitungSisaDPMv() {
    let gTot = CART_VND.reduce((s,i) => s + i.total, 0);
    let dp = cleanRibuan(document.getElementById('mv-dp-val').value);
    let sisa = gTot - dp; if(sisa < 0) sisa = 0;
    let el = document.getElementById('mv-dp-sisa');
    if(el) el.textContent = 'Sisa Hutang: ' + fmtRp(sisa);
}

function toggleDPMv() {
    let val = document.querySelector('input[name="mv_bayar"]:checked').value;
    let wrap = document.getElementById('mv-dp-wrap');
    let inp = document.getElementById('mv-dp-val');
    if(val === 'DP') {
        wrap.style.display = 'block';
        let gTot = CART_VND.reduce((s,i) => s + i.total, 0);
        if(!inp.value && gTot > 0) inp.value = formatRibuan(Math.round(gTot / 2));
        hitungSisaDPMv();
    } else {
        wrap.style.display = 'none'; inp.value = '';
    }
}

function renderCartVendor() {
    let wrap = document.getElementById('cart-vnd-wrap'); if(!wrap) return;
    if(CART_VND.length === 0) { wrap.innerHTML = '<div style="text-align:center; padding:16px; color:var(--tx3); font-size:12px;">Keranjang belanja kosong.</div>'; document.getElementById('mv-total-view').value = 'Rp 0'; return; }
    
    let html = '<table style="margin-bottom:0;"><thead><tr><th>Barang / Ket</th><th style="text-align:center">Qty</th><th style="text-align:right">Subtotal</th><th style="width:30px"></th></tr></thead><tbody>';
    let gTot = 0;
    CART_VND.forEach((c, i) => { gTot += c.total; html += `<tr><td style="font-weight:600">${c.barang}<br><span style="font-size:10px; color:var(--tx2); font-family:var(--mono);">${fmtRp(c.harga)}/satuan</span></td><td style="text-align:center">x${c.qty}</td><td style="font-weight:800; color:var(--amber-d); text-align:right;">${fmtRp(c.total)}</td><td style="text-align:right;"><button class="btn btn-red btn-xs" onclick="hapusDariKeranjangVendor(${i})">X</button></td></tr>`; });
    html += '</tbody></table>'; wrap.innerHTML = html;
    document.getElementById('mv-total-view').value = fmtRp(gTot);
    
    if(document.querySelector('input[name="mv_bayar"]:checked').value === 'DP') toggleDPMv();
}
function hapusDariKeranjangVendor(idx) { CART_VND.splice(idx, 1); renderCartVendor(); }

function simpanPengeluaranCart() {
  let kat = document.getElementById('mv-kategori').value;
  let vnd = document.getElementById('mv-vendor').value.trim();
  let stat = document.querySelector('input[name="mv_bayar"]:checked').value;
  
  if(CART_VND.length === 0) { alert('Keranjang belanja/pengeluaran kosong! Masukkan minimal 1 item.'); return; }
  
  let gTot = CART_VND.reduce((s,i) => s + i.total, 0);
  let dpVal = cleanRibuan(document.getElementById('mv-dp-val').value);
  
  let dibayar = (stat === 'Lunas') ? gTot : ((stat === 'DP') ? dpVal : 0);
  let sisa = gTot - dibayar;
  
  if(vnd && !VENDORS.find(v => v.nama.toLowerCase() === vnd.toLowerCase())) {
      VENDORS.push({nama: vnd, kontak: '-'});
      if(document.getElementById('pg-vendor') && document.getElementById('pg-vendor').classList.contains('on')) renderVendor();
  }

  let headKet = (CART_VND.length === 1) ? CART_VND[0].barang : `${CART_VND[0].barang} (+${CART_VND.length-1} item lain)`;

  PENGELUARAN.unshift({
      id:'EXP-'+String(PENGELUARAN.length+1).padStart(3,'0'), tgl:nowDate(), ket:headKet, kategori:kat, vendor:vnd, total:gTot, status:stat, dibayar:dibayar, sisa:sisa, items: JSON.parse(JSON.stringify(CART_VND))
  });
  
  saveData();
  document.getElementById('mv-vendor').value=''; 
  document.querySelector('input[name="mv_bayar"][value="Lunas"]').checked = true; toggleDPMv();
  
  CART_VND = []; renderCartVendor(); renderPengeluaran(); 
  if(document.getElementById('pg-laci') && document.getElementById('pg-laci').classList.contains('on')) renderLaci();
  toast('✔️ Nota Belanja berhasil disimpan!', 2500, 'success');
}

function hapusPengeluaran(id) {
  if(!curUser || curUser.role !== 'boss') return;
  if(confirm(`⚠️ YAKIN HAPUS DATA PENGELUARAN ${id}?\n\nData yang dihapus akan memengaruhi laporan laba dan laci kasir.`)) {
     let idx = PENGELUARAN.findIndex(p => p.id === id);
     if(idx >= 0) {
       let peng = PENGELUARAN[idx];
       logActivity('DELETE', 'Pengeluaran', { label: 'Hapus pengeluaran '+id+' — Rp '+fmt(peng.total||peng.subtotal||0), before: {id: peng.id, vendor: peng.vendor, total: peng.total} });
       PENGELUARAN.splice(idx, 1); saveData(); renderPengeluaran(); toast(`Pengeluaran ${id} berhasil dihapus!`, 3000, 'success');
     }
  }
}

function renderPengeluaran(){
  var isBoss = (curUser && curUser.role === 'boss');
  var rows=PENGELUARAN.map(function(v,i){
    let ketExtra = v.vendor ? `<br><span style="font-size:10px;color:var(--tx3)">Vendor: ${v.vendor}</span>` : '';
    let isHutang = v.status === 'Hutang' || v.status === 'DP';
    let delBtn = isBoss ? `<button class="btn btn-red btn-xs" onclick="hapusPengeluaran('${v.id}')">Hapus</button>` : '';
    
    let tagihanHtml = `${fmtRp(v.total)}`;
    if (v.status === 'DP') tagihanHtml += `<br><span style="font-size:10px;color:var(--amber-d)">DP: ${fmtRp(v.dibayar)}</span><br><span style="font-size:10px;color:var(--red)">Sisa: ${fmtRp(v.sisa)}</span>`;
    if (v.status === 'Hutang') tagihanHtml += `<br><span style="font-size:10px;color:var(--red)">Sisa: ${fmtRp(v.sisa !== undefined ? v.sisa : v.total)}</span>`;

    return `<tr><td class="mono">${v.id}<br><span style="font-size:10px;color:var(--tx3)">${v.tgl}</span></td>
      <td style="font-weight:600">${v.ket}${ketExtra}</td>
      <td><span class="badge bg-gray">${v.kategori}</span></td>
      <td style="font-weight:800;color:var(--amber-d)">${tagihanHtml}</td>
      <td>${badgeBayar(v.status)}</td>
      <td><div style="display:flex; gap:6px; flex-wrap:wrap;">${isHutang?`<button class="btn btn-green btn-xs" onclick="lunasPengeluaran(${i})">Tandai Lunas</button>`:''}${delBtn}</div></td></tr>`;
  }).join('');
  document.getElementById('pengeluaran-tbl').innerHTML=`<table><thead><tr><th>ID / Tgl</th><th>Rangkuman Nota</th><th>Kategori</th><th>Total Tagihan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(6,'📦','Belum ada data pengeluaran')}</tbody></table>`;
}
function lunasPengeluaran(i){ 
    PENGELUARAN[i].status='Lunas'; 
    PENGELUARAN[i].dibayar = PENGELUARAN[i].total;
    PENGELUARAN[i].sisa = 0;
    saveData(); renderPengeluaran(); toast('Tagihan belanja sudah dibayar!', 2500, 'success'); 
}

/* ════════════════ HUTANG & DATA LAINNYA ════════════════ */
function renderHutangPengeluaran(){
  var data=PENGELUARAN.filter(v => (v.status==='Hutang' || v.status==='DP') && v.kategori !== 'Belanja Vendor / Maklon Cetak');
  var tot=data.reduce((s,v)=>s+(v.sisa !== undefined ? v.sisa : v.total),0);
  document.getElementById('hp-stats').innerHTML= sc('Tagihan Toko Belum Bayar',data.length+' tagihan','color:var(--red)','','color:var(--tx2)')+ sc('Total Hutang Operasional',fmtRp(tot),'color:var(--red)','Wajib disiapkan','color:var(--red)');
  var rows=data.map((v,i) => `<tr><td style="font-weight:600">${v.ket}</td><td class="mono">${v.tgl}</td><td style="font-weight:800;color:var(--red)">${fmtRp(v.sisa !== undefined ? v.sisa : v.total)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-green btn-xs" onclick="lunasPengeluaran(${PENGELUARAN.indexOf(v)})">Bayar Tagihan Ini</button></div></td></tr>`).join('');
  document.getElementById('hp-tbl').innerHTML=`<table><thead><tr><th>Keterangan Tagihan</th><th>Tanggal</th><th>Sisa Nominal</th><th>Aksi Pembayaran</th></tr></thead><tbody>${rows||emptyRow(4,'✅','Tidak ada tagihan operasional yang belum dibayar.')}</tbody></table>`;
}

function renderHutangVendor(){
  var data = PENGELUARAN.filter(v => (v.status==='Hutang' || v.status==='DP') && v.kategori === 'Belanja Vendor / Maklon Cetak');
  var tot = data.reduce((s,v)=>s+(v.sisa !== undefined ? v.sisa : v.total),0);
  document.getElementById('hv-stats').innerHTML= sc('Kasbon ke Vendor',data.length+' nota belanja','color:var(--red)','Ke Pihak Vendor/Toko Luar','color:var(--tx2)')+ sc('Total Kasbon Kulakan',fmtRp(tot),'color:var(--red)','Modal wajib bayar','color:var(--red)');
  var rows=data.map((v,i) => {
    var idxPeng = PENGELUARAN.indexOf(v);
    var sisaVal = v.sisa !== undefined ? v.sisa : v.total;
    var waBtn = v.vendor ? `<button class="btn btn-wa btn-xs" onclick="kirimWAVendorSingkat(${idxPeng})" title="Kirim WA ke vendor">💬 WA</button>` : '';
    return `<tr><td class="mono">${v.tgl}</td><td style="font-weight:600">${v.vendor||'-'}</td><td style="font-size:12px;color:var(--tx)">${v.ket}</td><td style="font-weight:800;color:var(--red)">${fmtRp(sisaVal)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-green btn-xs" onclick="lunasPengeluaran(${idxPeng})">✔ Lunas</button>${waBtn}</div></td></tr>`;
  }).join('');
  document.getElementById('hv-tbl').innerHTML=`<table><thead><tr><th>Tgl Belanja</th><th>Nama Vendor / Toko</th><th>Rangkuman Nota</th><th>Sisa Tagihan Vendor</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(5,'✅','Tidak ada hutang ke vendor saat ini.')}</tbody></table>`;
}

function kirimWAVendorSingkat(idxPeng) {
  var v = PENGELUARAN[idxPeng];
  if (!v) return;
  var sisa = v.sisa !== undefined ? v.sisa : v.total;
  var dp = (v.status === 'DP' && v.dibayar > 0) ? v.dibayar : 0;
  var namaVendor = v.vendor || 'Vendor';
  var kontak = (VENDORS.find(vnd => vnd.nama === namaVendor) || {}).kontak || '';
  var msg = dp > 0
    ? `Tagihanku atas nama ${namaVendor}, DP Rp ${fmt(dp)}, kurangnya Rp ${fmt(sisa)}`
    : `Tagihanku atas nama ${namaVendor} kurang Rp ${fmt(sisa)}`;
  if (kontak) { sendWA(kontak, msg); }
  else { alert('Pesan WA Vendor:\n\n' + msg + '\n\n(Tambahkan nomor kontak vendor untuk kirim WA langsung)'); }
}

/* ════════════════ PEGAWAI, PELANGGAN, VENDOR, BARANG ════════════════ */
function renderUser(){
  var rows=USERS.map(function(u,i){
    var av=u.nama.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    var cl=u.role==='boss'?'bg-blue':u.role==='admin'?'bg-purple':'bg-green';
    return `<tr><td><div style="display:flex;align-items:center;gap:12px"><div class="uav ${cl.replace('bg-','av-')}" style="background:var(--${cl.replace('bg-','')}-d)">${av}</div><div><div style="font-weight:700">${u.nama}</div><div style="font-size:11px;color:var(--tx2);margin-top:2px">${u.wa}</div></div></div></td>
      <td class="mono">${u.u}</td>
      <td><span class="badge ${cl}">${u.role.toUpperCase()}</span></td>
      <td><span class="badge ${u.aktif?'bg-green':'bg-red'}">${u.aktif?'Aktif':'Nonaktif'}</span></td>
      <td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-ghost btn-xs" onclick="editUser(${i})">Edit</button> <button class="btn btn-${u.aktif?'red':'green'} btn-xs" onclick="toggleUser(${i})">${u.aktif?'Nonaktifkan':'Aktifkan'}</button></div></td></tr>`;
  }).join('');
  let tbl = document.getElementById('user-tbl');
  if(tbl) tbl.innerHTML=`<table><thead><tr><th>Identitas Karyawan</th><th>Username Akses</th><th>Level Role</th><th>Status Akun</th><th>Aksi</th></tr></thead><tbody>${rows||'<tr><td colspan="5" align="center">Tidak ada akun</td></tr>'}</tbody></table>`;
}
function openModalUser(){['mu-nama','mu-user','mu-pw','mu-wa'].forEach(id=>document.getElementById(id).value='');openModal('mo-user');}
function editUser(i){var u=USERS[i];document.getElementById('mu-nama').value=u.nama;document.getElementById('mu-user').value=u.u;document.getElementById('mu-pw').value='';document.getElementById('mu-role').value=u.role;document.getElementById('mu-wa').value=u.wa;openModal('mo-user');}
function toggleUser(i){USERS[i].aktif=!USERS[i].aktif; saveData(); renderUser();toast('Status akses diubah!', 2000, 'success');}
function simpanUser(){
  var nama=document.getElementById('mu-nama').value.trim(); var u=document.getElementById('mu-user').value.trim().toLowerCase(); var pw=document.getElementById('mu-pw').value.trim(); var role=document.getElementById('mu-role').value; var wa=document.getElementById('mu-wa').value.trim();
  if(!nama||!u||!pw){alert('Nama Lengkap, Username, Password wajib diisi!');return;}
  var exist=USERS.findIndex(x=>x.u===u);
  if(exist>=0){USERS[exist]={...USERS[exist],nama:nama,p:pw,role:role,wa:wa};toast('Data karyawan diupdate!', 2500, 'success');} else{USERS.push({u:u,p:pw,nama:nama,role:role,wa:wa,aktif:true});toast('Karyawan baru ditambahkan!', 2500, 'success');}
  saveData(); closeModal('mo-user'); renderUser();
}

function renderPegawaiData() {
    renderUser(); // Render tabel user login (yang lama)
    
    // Render Tabel Pegawai Fisik (Baru)
    var rows = PEGAWAI.map((p, i) => `<tr><td style="font-weight:700;">${p.nama}</td><td><span class="badge bg-gray">${p.posisi}</span></td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-red btn-xs" onclick="hapusPegawai(${i})">Hapus</button></div></td></tr>`).join('');
    document.getElementById('pegawai-tbl').innerHTML = `<table><thead><tr><th>Nama Panggilan</th><th>Posisi Pekerjaan</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(3, '👷', 'Belum ada data pegawai fisik')}</tbody></table>`;
}
function openModalPegawai() { document.getElementById('mpg-nama').value=''; document.getElementById('mpg-posisi').value=''; openModal('mo-pegawai'); }
function simpanPegawai() {
    let n = document.getElementById('mpg-nama').value.trim(); let p = document.getElementById('mpg-posisi').value.trim() || 'Pekerja Umum';
    if(!n) { alert("Nama wajib diisi!"); return; }
    PEGAWAI.push({nama: n, posisi: p}); saveData(); closeModal('mo-pegawai'); renderPegawaiData(); populateKomisiPegawai(); toast('Pegawai disimpan!', 2500, 'success');
}
function hapusPegawai(i) { if(confirm("Yakin hapus pegawai ini?")) { PEGAWAI.splice(i,1); saveData(); renderPegawaiData(); populateKomisiPegawai(); } }

function renderPelanggan(){
  var rows = PELANGGAN.map((p, i) => {
    let countTrx = TRX.filter(t => t.pelanggan.toLowerCase() === p.nama.toLowerCase()).length;
    return `<tr><td style="font-weight:600">${p.nama}</td><td class="mono">${p.id_cust||p.wa||'-'}</td><td>${p.wa||'-'}</td><td>${p.alamat||'-'}</td><td><span class="badge bg-blue">${countTrx} Nota</span></td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-red btn-xs" onclick="hapusPelanggan(${i})">Hapus</button></div></td></tr>`;
  }).join('');
  document.getElementById('pel-tbl').innerHTML=`<table><thead><tr><th>Nama Pelanggan</th><th>ID Customer</th><th>No. WhatsApp</th><th>Alamat Lengkap</th><th>Total Transaksi</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(6,'👥','Belum ada data pelanggan')}</tbody></table>`;
}
function openModalPelanggan(){ document.getElementById('mp-nama').value=''; document.getElementById('mp-wa').value=''; document.getElementById('mp-alamat').value=''; openModal('mo-pelanggan'); }
function simpanPelanggan(){ 
    let nama = document.getElementById('mp-nama').value.trim(); 
    let wa = document.getElementById('mp-wa').value.trim();
    if(!nama){alert("Nama wajib diisi!");return;} 
    let newId = generateCustId();
    PELANGGAN.push({nama:nama, wa:wa, alamat:document.getElementById('mp-alamat').value.trim(), id_cust: newId}); 
    saveData(); closeModal('mo-pelanggan'); renderPelanggan(); populateFiBrg(); toast('Pelanggan ditambahkan!', 2500, 'success'); 
}
function hapusPelanggan(i){ if(confirm("Yakin hapus?")) { PELANGGAN.splice(i,1); saveData(); renderPelanggan(); populateFiBrg(); } }

function renderVendor(){
  var rows = VENDORS.map((v, i) => {
      let count = PENGELUARAN.filter(t => t.vendor && t.vendor.toLowerCase() === v.nama.toLowerCase()).length;
      return `<tr><td style="font-weight:600">${v.nama}</td><td>${v.kontak||'-'}</td><td><span class="badge bg-purple">${count} Nota Kulakan</span></td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-red btn-xs" onclick="hapusVendor(${i})">Hapus</button></div></td></tr>`;
  }).join('');
  document.getElementById('vnd-tbl').innerHTML=`<table><thead><tr><th>Nama Vendor Makelar</th><th>Kontak/Spesialisasi</th><th>Total Kulakan</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(4,'🏭','Belum ada data vendor rekanan')}</tbody></table>`;
}
function openModalVendor(){ document.getElementById('mvnd-nama').value=''; document.getElementById('mvnd-kontak').value=''; openModal('mo-vendor'); }
function simpanVendor(){ let n = document.getElementById('mvnd-nama').value.trim(); if(!n){alert("Nama vendor wajib!");return;} VENDORS.push({nama:n, kontak:document.getElementById('mvnd-kontak').value.trim()}); saveData(); closeModal('mo-vendor'); renderVendor(); populateFiVnd(); toast('Vendor disimpan!', 2500, 'success'); }
function hapusVendor(i){ if(confirm("Yakin hapus?")) { VENDORS.splice(i,1); saveData(); renderVendor(); populateFiVnd(); } }

function renderBrg(){
  if(TOKO.useStok) { document.getElementById('stok-warning').style.display='block'; document.getElementById('mb-stok-wrap').style.display='block'; } 
  else { document.getElementById('stok-warning').style.display='none'; document.getElementById('mb-stok-wrap').style.display='none'; }

  var rows=BARANG.map(function(b,i){
    var tierStr=b.tiers.map((t,j)=>{var prev=j>0?b.tiers[j-1].max+1:1;return prev+'-'+(t.max===9999?'DST':t.max)+': <b style="color:var(--tx)">Rp '+fmt(t.h)+'</b>';}).join(' <br> ');
    let stokHtml = TOKO.useStok ? `<td><span class="badge ${b.stok>0?'bg-blue':'bg-red'}">${b.stok||0} ${b.satuan}</span></td>` : '';
    return `<tr><td class="mono" style="font-weight:800;color:var(--blue-d)">${b.kode}</td><td style="font-weight:600">${b.nama}</td><td>${b.satuan}</td><td>${b.kat}</td>${stokHtml}<td style="font-size:11px;color:var(--tx2);line-height:1.4">${tierStr}</td><td style="color:var(--amber-d);font-weight:600">${fmtRp(b.modal)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-ghost btn-xs" onclick="editBrg(${i})">Edit</button> <button class="btn btn-red btn-xs" onclick="hapusBrg(${i})">Hapus</button></div></td></tr>`;
  }).join('');
  let stokTh = TOKO.useStok ? `<th>Stok Aktual</th>` : '';
  document.getElementById('brg-tbl').innerHTML=`<table><thead><tr><th>Kode</th><th>Nama Cetakan</th><th>Sat</th><th>Kategori</th>${stokTh}<th>Tier Harga (Rp)</th><th>Modal Pokok</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(TOKO.useStok?8:7,'🏷️','Belum ada barang. Klik + Tambah Barang.')}</tbody></table>`;
  populateFiBrg();
}
function openModalBarang(){editBrgIdx=-1;document.getElementById('mo-barang-title').textContent='Tambah Barang';document.getElementById('mb-kode').value='';document.getElementById('mb-nama').value='';document.getElementById('mb-sat').value='';document.getElementById('mb-kat').value='';document.getElementById('mb-modal').value='';document.getElementById('mb-vendor').value='';document.getElementById('mb-harga-jual').value='';document.getElementById('mb-profit-preview').style.display='none'; resetTierEditor([{max:9999,h:0}]);openModal('mo-barang');}
function editBrg(i){editBrgIdx=i;var b=BARANG[i];document.getElementById('mo-barang-title').textContent='Edit: '+b.nama;document.getElementById('mb-kode').value=b.kode;document.getElementById('mb-nama').value=b.nama;document.getElementById('mb-sat').value=b.satuan;document.getElementById('mb-kat').value=b.kat;document.getElementById('mb-modal').value=formatRibuan(b.modal);document.getElementById('mb-vendor').value=b.vendor||'';document.getElementById('mb-harga-jual').value=b.tiers&&b.tiers.length?formatRibuan(b.tiers[b.tiers.length-1].h):''; hitungProfitPreview(); resetTierEditor(b.tiers);openModal('mo-barang');}
function hapusBrg(i){if(confirm('Yakin menghapus '+BARANG[i].nama+'?')){ logActivity('DELETE','Barang',{label:'Hapus barang: '+BARANG[i].nama, before:{kode:BARANG[i].kode, nama:BARANG[i].nama}}); BARANG.splice(i,1); saveData(); renderBrg();toast('Barang terhapus.', 2500, 'success');}}

function autoKodeBarang() {
  if (editBrgIdx >= 0) return; // Jangan ubah otomatis kalau sedang mode edit
  let nama = document.getElementById('mb-nama').value.trim().toUpperCase();
  let elKode = document.getElementById('mb-kode');
  
  if (nama.length >= 3) {
      // Ambil 3 huruf pertama dari abjad saja
      let prefix = nama.replace(/[^A-Z]/g, '').substring(0, 3);
      if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');
      
      // Cari angka terbesar dari prefix yang sama agar tidak bentrok
      let maxNum = 0;
      BARANG.forEach(b => {
          if (b.kode.startsWith(prefix)) {
              let numPart = parseInt(b.kode.split('-')[1]);
              if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
          }
      });
      elKode.value = prefix + '-' + String(maxNum + 1).padStart(3, '0');
  } else if (nama.length === 0) {
      elKode.value = '';
  }
}

function resetTierEditor(tiers){
    document.getElementById('tier-rows').innerHTML='';
    tiers.forEach(function(t,i){ addTierRowFill(t.max===9999?'':t.max, t.h, i===tiers.length-1, i); });
    updTierRows();
}
function addTierRow(){
    var rows=document.querySelectorAll('.tier-row-edit'); var tiers=[];
    rows.forEach(function(r){
        var ins=r.querySelectorAll('input'); var mx=parseInt(ins[1].value); var h=ins[2].value;
        tiers.push({max: isNaN(mx)?9999:mx, h: h});
    });
    tiers.push({max: 9999, h: ''});
    resetTierEditor(tiers);
}
function addTierRowFill(maxV,hV,isLast,idx){
    var wrap=document.getElementById('tier-rows'); if(idx===undefined) idx=wrap.children.length;
    var div=document.createElement('div');div.style.display='grid';div.style.gridTemplateColumns='70px 70px 1fr 30px';div.style.gap='8px';div.style.alignItems='center';div.className='tier-row-edit';div.id='tr-'+idx;
    div.innerHTML=`<input readonly style="background:var(--surf2);color:var(--tx2);font-family:var(--mono);text-align:center;padding:12px; border:1px solid var(--bdr); border-radius:8px;"><input value="${isLast?'':maxV||''}" placeholder="DST" data-max ${isLast?'readonly style="background:var(--surf2);color:var(--tx2);text-align:center;padding:12px; border:1px solid var(--bdr); border-radius:8px;"':' oninput="updTierRows()" style="font-family:var(--mono);text-align:center;padding:12px; border:1px solid var(--bdr); border-radius:8px;"'}><input type="number" value="${hV||''}" placeholder="Rp" style="font-family:var(--mono);font-weight:800;padding:12px; border:1px solid var(--bdr); border-radius:8px;"><button class="btn btn-red btn-xs" style="height:100%;padding:0" onclick="delTierRow('tr-${idx}')" ${idx===0&&isLast?'disabled':''}>X</button>`;
    wrap.appendChild(div);
}
function delTierRow(idStr){
    var rows=document.querySelectorAll('.tier-row-edit'); var tiers=[];
    rows.forEach(function(r){
        if(r.id !== idStr) {
            var ins=r.querySelectorAll('input'); var mx=parseInt(ins[1].value); var h=ins[2].value;
            tiers.push({max: isNaN(mx)?9999:mx, h: h});
        }
    });
    if(tiers.length===0) tiers.push({max:9999, h:''});
    resetTierEditor(tiers);
}
function updTierRows(){
    var rows=document.querySelectorAll('.tier-row-edit'); var nextDari=1;
    rows.forEach(function(r,i){
        var ins=r.querySelectorAll('input');
        ins[0].value=nextDari;
        if(i < rows.length-1){
            var mx=parseInt(ins[1].value);
            if(!isNaN(mx) && mx >= nextDari) nextDari = mx + 1;
        }
    });
}
function simpanBarang(){
  var kode=document.getElementById('mb-kode').value.trim().toUpperCase(); 
  var nama=document.getElementById('mb-nama').value.trim(); 
  var sat=document.getElementById('mb-sat').value.trim() || 'pcs'; 
  var kat=document.getElementById('mb-kat').value.trim() || 'Lainnya'; 
  var modal=cleanRibuan(document.getElementById('mb-modal').value)||0;
  var vendorBarang=document.getElementById('mb-vendor').value.trim();
  var hargaJual=cleanRibuan(document.getElementById('mb-harga-jual').value)||0;
  
  if(!kode||!nama){alert('Kode dan nama produk wajib diisi!');return;}
  
  if(sat && !TOKO.satuanJual.includes(sat)) { TOKO.satuanJual.push(sat); renderSetSatuan(); populateSatuanJual(); }
  if(kat && !TOKO.kategoriProduk.includes(kat)) { TOKO.kategoriProduk.push(kat); renderSetKatProduk(); populateKategoriProduk(); }
  
  var rows=document.querySelectorAll('.tier-row-edit'); var tiers=[];
  rows.forEach(function(r){var ins=r.querySelectorAll('input');var mx=!ins[1].value?9999:parseInt(ins[1].value)||9999;var h=parseInt(ins[2].value)||0;if(h>0)tiers.push({max:mx,h:h});});
  if(!tiers.length){
    // Auto buat tier dari harga jual jika tidak ada
    if(hargaJual>0) tiers=[{max:9999,h:hargaJual}];
    else {alert('Mohon isi minimal 1 baris harga!');return;}
  }
  tiers[tiers.length-1].max=9999; 
  var obj={kode:kode,nama:nama,satuan:sat,kat:kat,modal:modal,stok:9999,tiers:tiers,vendor:vendorBarang};
  if(editBrgIdx>=0){BARANG[editBrgIdx]=obj;toast('Perubahan barang disimpan!', 2500, 'success');}else{BARANG.push(obj);toast('Produk baru ditambahkan!', 2500, 'success');} 
  saveData(); closeModal('mo-barang');renderBrg();
  logActivity('CREATE','Barang',{label:(editBrgIdx>=0?'Edit':'Tambah')+' barang: '+nama+' (vendor: '+(vendorBarang||'-')+')'});
}

var editBrgVndIdx = -1;
function renderBrgVendor(){
  var rows = BARANG_VENDOR.map((b,i) => `<tr><td style="font-weight:600">${b.nama}</td><td>${b.vendor}</td><td style="color:var(--blue);font-weight:800">${fmtRp(b.harga)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn btn-ghost btn-xs" onclick="editBrgVendor(${i})">Edit</button> <button class="btn btn-red btn-xs" onclick="hapusBrgVendor(${i})">Hapus</button></div></td></tr>`).join('');
  document.getElementById('brgvnd-tbl').innerHTML=`<table><thead><tr><th>Nama Barang / Maklon Vendor</th><th>Vendor Pemasok Utama</th><th>Harga Beli Standar (Rp)</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(4,'📦','Belum ada master data barang vendor')}</tbody></table>`;
}
function openModalBrgVendor() { editBrgVndIdx = -1; document.getElementById('mo-barang-vendor-title').textContent = 'Tambah Barang Vendor'; document.getElementById('mbv-nama').value = ''; document.getElementById('mbv-vendor').value = ''; document.getElementById('mbv-harga').value = ''; openModal('mo-barang-vendor'); }
function editBrgVendor(i) { editBrgVndIdx = i; let b = BARANG_VENDOR[i]; document.getElementById('mo-barang-vendor-title').textContent = 'Edit Data: ' + b.nama; document.getElementById('mbv-nama').value = b.nama; document.getElementById('mbv-vendor').value = b.vendor; document.getElementById('mbv-harga').value = b.harga; openModal('mo-barang-vendor'); }
function hapusBrgVendor(i) { if(confirm('Hapus barang vendor ini dari daftar master?')) { logActivity('DELETE','Barang',{label:'Hapus barang vendor: '+(BARANG_VENDOR[i]||{}).nama, before: BARANG_VENDOR[i]}); BARANG_VENDOR.splice(i, 1); saveData(); renderBrgVendor(); populateFiVnd(); toast('Barang vendor dihapus.', 2500, 'success'); } }
function simpanBarangVendor() {
   let n = document.getElementById('mbv-nama').value.trim(); let v = document.getElementById('mbv-vendor').value.trim(); let h = parseInt(cleanRibuan(document.getElementById('mbv-harga').value)) || 0;
   if(!n) { alert("Nama barang vendor wajib diisi!"); return; }
   let obj = {nama: n, vendor: v, harga: h};
   if(editBrgVndIdx >= 0) { BARANG_VENDOR[editBrgVndIdx] = obj; } else { BARANG_VENDOR.push(obj); }
   if(v && !VENDORS.find(x => x.nama.toLowerCase() === v.toLowerCase())) { VENDORS.push({nama: v, kontak: '-'}); if(document.getElementById('pg-vendor').classList.contains('on')) renderVendor(); }
   saveData(); closeModal('mo-barang-vendor'); renderBrgVendor(); populateFiVnd(); toast('Master Barang Vendor disimpan!', 2500, 'success');
}

/* ════════════════ LAPORAN PDF & DASHBOARD ADMIN ════════════════ */
function renderLaporan(){
  var strMonth = nowDate().substring(0,7);
  var dataTrxBulanIni = TRX.filter(t => t.tgl.startsWith(strMonth));
  var dataPengBulanIni = PENGELUARAN.filter(p => p.tgl.startsWith(strMonth));
  
  var omzetBulanIni = dataTrxBulanIni.reduce((s,t) => s+t.total, 0);
  var modalVendorBulanIni = dataPengBulanIni.filter(v => v.kategori === 'Belanja Vendor / Maklon Cetak').reduce((s, v) => s + v.total, 0);
  var operasionalBulanIni = dataPengBulanIni.filter(v => v.kategori !== 'Belanja Vendor / Maklon Cetak').reduce((s, v) => s + v.total, 0);
  var labaKotor = omzetBulanIni - modalVendorBulanIni;
  var labaBersih = labaKotor - operasionalBulanIni;
  
  document.getElementById('lap-stats').innerHTML=
    sc('Omzet Bulan Ini',fmtRp(omzetBulanIni),'color:var(--blue-d)','Total Uang Pelanggan','color:var(--tx2)','blue')+
    sc('Total Belanja Vendor',fmtRp(modalVendorBulanIni),'color:var(--amber-d)','Semua Belanja Kulakan Bulan Ini','color:var(--tx2)','amber')+
    sc('Laba Kotor (Bulan Ini)',fmtRp(labaKotor),'color:var(--green-d)','Omzet dikurangi Modal Kulakan','color:var(--green)','green');
  
  var bmap={};
  dataTrxBulanIni.forEach(t => {
    (t.items||[]).forEach(i => { if(!bmap[i.barang]) bmap[i.barang]={qty:0,omzet:0}; bmap[i.barang].qty+=i.qty; bmap[i.barang].omzet+=i.total; });
  });
  var brows=Object.entries(bmap).sort((a,b)=>b[1].omzet-a[1].omzet).map(e => `<tr><td style="font-weight:600">${e[0]}</td><td class="mono">${fmt(e[1].qty)}</td><td style="color:var(--blue);font-weight:800">${fmtRp(e[1].omzet)}</td></tr>`).join('');
  document.getElementById('lap-brg').innerHTML=`<table><thead><tr><th>Nama Barang (Bulan Ini)</th><th>Total Qty Terjual</th><th>Sumbangan Omzet</th></tr></thead><tbody>${brows||emptyRow(3, '📊', 'Belum ada penjualan.')}</tbody></table>`;
  
  var kmap={};
  dataTrxBulanIni.forEach(t => { if(!kmap[t.kasir]) kmap[t.kasir]={count:0,omzet:0}; kmap[t.kasir].count++; kmap[t.kasir].omzet+=t.total; });
  var krows=Object.entries(kmap).sort((a,b)=>b[1].omzet-a[1].omzet).map((e,i) => `<tr><td style="font-weight:700">${e[0]}</td><td>${e[1].count} nota</td><td style="color:var(--blue);font-weight:800">${fmtRp(e[1].omzet)}</td></tr>`).join('');
  document.getElementById('lap-kar').innerHTML=`<table><thead><tr><th>Nama Kasir</th><th>Kinerja Transaksi</th><th>Omzet</th></tr></thead><tbody>${krows||emptyRow(3,'👤', 'Tidak ada data kasir')}</tbody></table>`;

  // Komisi Map
  var komMap={};
  dataTrxBulanIni.forEach(t => {
      if(t.komisiNama && t.komisiNominal > 0) {
          if(!komMap[t.komisiNama]) komMap[t.komisiNama] = 0;
          komMap[t.komisiNama] += t.komisiNominal;
      }
  });
  var komRows=Object.entries(komMap).sort((a,b)=>b[1]-a[1]).map((e,i) => `<tr><td style="font-weight:700">${e[0]}</td><td style="color:var(--green-d);font-weight:800; background:var(--green-l);">${fmtRp(e[1])}</td></tr>`).join('');
  document.getElementById('lap-komisi').innerHTML=`<table><thead><tr><th>Nama Pekerja / Pegawai Fisik</th><th>Total Komisi / Tip</th></tr></thead><tbody>${komRows||emptyRow(2,'💸','Tidak ada komisi tercatat.')}</tbody></table>`;
}

function cetakLaporanPDF() {
  var strMonth = nowDate().substring(0,7); var ms=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var bulanText = ms[parseInt(strMonth.split('-')[1])-1] + ' ' + strMonth.split('-')[0];
  
  var dataTrxBulanIni = TRX.filter(t => t.tgl.startsWith(strMonth));
  var dataPengBulanIni = PENGELUARAN.filter(p => p.tgl.startsWith(strMonth));
  var dataKasbonBulanIni = KASBON.filter(k => k.tgl.startsWith(strMonth));
  
  var omzet = dataTrxBulanIni.reduce((s,t) => s+t.total, 0);
  var modalVendor = dataPengBulanIni.filter(v => v.kategori === 'Belanja Vendor / Maklon Cetak').reduce((s, v) => s + v.total, 0);
  var operasional = dataPengBulanIni.filter(v => v.kategori !== 'Belanja Vendor / Maklon Cetak').reduce((s, v) => s + v.total, 0);
  var labaKotor = omzet - modalVendor;
  var labaBersih = labaKotor - operasional;
  var totalKasbon = dataKasbonBulanIni.reduce((s,k) => s+k.nominal, 0);

  let html = `
    <div style="text-align:center; margin-bottom:24px; border-bottom:2px solid #000; padding-bottom:12px;">
       <h1 style="margin:0; font-size:24px;">LAPORAN KEUANGAN BULANAN</h1>
       <h2 style="margin:4px 0 0 0; font-size:16px; color:#555;">Abunawas Percetakan & Konveksi - ${bulanText}</h2>
    </div>
    
    <h3 style="font-size:14px; border-bottom:1px solid #ccc; padding-bottom:4px;">1. RINGKASAN PEMASUKAN & PENGELUARAN</h3>
    <table style="width:100%; margin-bottom:20px; border-collapse:collapse; font-size:14px;">
        <tr><td style="padding:6px; border-bottom:1px dashed #eee;">Total Omzet Kotor (Semua Transaksi Masuk)</td><td style="padding:6px; text-align:right; font-weight:bold; color:blue;">${fmtRp(omzet)}</td></tr>
        <tr><td style="padding:6px; border-bottom:1px dashed #eee;">Total Belanja Maklon/Bahan Vendor</td><td style="padding:6px; text-align:right; font-weight:bold; color:red;">- ${fmtRp(modalVendor)}</td></tr>
        <tr><td style="padding:6px; background:#f0f8ff; font-weight:bold;">Laba Kotor</td><td style="padding:6px; background:#f0f8ff; text-align:right; font-weight:bold;">${fmtRp(labaKotor)}</td></tr>
        <tr><td style="padding:6px; border-bottom:1px dashed #eee;">Biaya Operasional Toko (Listrik, Gaji, dll)</td><td style="padding:6px; text-align:right; font-weight:bold; color:red;">- ${fmtRp(operasional)}</td></tr>
        <tr><td style="padding:10px 6px; background:#e6ffe6; font-weight:900; font-size:16px;">LABA BERSIH BULAN INi</td><td style="padding:10px 6px; background:#e6ffe6; text-align:right; font-weight:900; font-size:16px; color:green;">${fmtRp(labaBersih)}</td></tr>
    </table>
    
    <h3 style="font-size:14px; border-bottom:1px solid #ccc; padding-bottom:4px;">2. REKAP KASBON / PINJAMAN KARYAWAN</h3>
    <table style="width:100%; margin-bottom:20px; border-collapse:collapse; font-size:12px;" border="1">
        <thead><tr style="background:#eee; color:#000;"><th>Tgl</th><th>Nama Pegawai</th><th>Keterangan</th><th>Nominal</th></tr></thead>
        <tbody>
            ${dataKasbonBulanIni.map(k => `<tr><td style="padding:4px;">${k.tgl}</td><td style="padding:4px;">${k.nama}</td><td style="padding:4px;">${k.ket}</td><td style="padding:4px; text-align:right;">${fmtRp(k.nominal)}</td></tr>`).join('')}
            ${dataKasbonBulanIni.length===0?'<tr><td colspan="4" align="center" style="padding:8px">Tidak ada kasbon bulan ini</td></tr>':''}
        </tbody>
    </table>
    
    <div style="margin-top:40px; display:flex; justify-content:space-between; text-align:center; font-size:14px;">
        <div style="width:200px;">Diperiksa Oleh,<br><br><br><br><b>( ............................... )</b><br>Owner / Bos</div>
        <div style="width:200px;">Dicetak Tanggal,<br><br><br><br><b>${nowDate()}</b></div>
    </div>
  `;
  document.getElementById('area-laporan-print').innerHTML = html;
  openModal('mo-cetak-laporan');
}

function renderDashAdmin(){
  var omzet=TRX.reduce((s,t) => s+t.total, 0);
  document.getElementById('da-stats').innerHTML= sc('Total Omzet Berjalan',fmtRp(omzet),'color:var(--blue-d)','Total','color:var(--tx2)','blue')+ sc('Volume Transaksi',TRX.length+' transaksi','color:var(--purple-d)','Semua waktu','color:var(--tx2)','purple');
  var rows=TRX.slice(0,10).map(t => {
    let mainItem = (t.items && t.items.length > 0) ? t.items[0].barang : 'Pesanan'; let extraItems = (t.items && t.items.length > 1) ? ` +${t.items.length-1} lgi` : '';
    let editBtn = `<button class="btn btn-amber btn-xs" onclick="editTrx('${t.id}')">Edit</button>`;
    return `<tr><td class="mono">${t.id}</td><td style="font-weight:600">${t.pelanggan}</td><td>${mainItem}${extraItems}</td><td style="font-weight:800;color:var(--blue-d)">${fmtRp(t.total)}</td><td>${badgeBayar(t.bayar)}</td><td><div style="display:flex; gap:6px; flex-wrap:wrap;">${editBtn}</div></td></tr>`;
  }).join('');
  document.getElementById('da-trx').innerHTML=`<table><thead><tr><th>ID Nota</th><th>Pelanggan</th><th>Barang</th><th>Total Harga</th><th>Status Bayar</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(6,'🧾','Belum ada transaksi')}</tbody></table>`;
}

/* ════════════════ KASIR RIWAYAT & BAGIKAN GAMBAR ════════════════ */
function renderKasirRiwayat(){
  var data = TRX.filter(t => t.kasir === curUser.nama);
  var rows = data.map(t => {
    let trxItems = t.items || [{kode: t.kode, barang: t.barang, qty: t.qty, harga: t.harga, total: t.total}];
    let brgStr = trxItems.length > 0 ? trxItems.length + ' Item' : 'Pesanan';
    let editBtn = `<button class="btn btn-amber btn-xs" onclick="editTrx('${t.id}')">Edit</button>`;
    return `<tr>
      <td class="mono">${t.id}<br><span style="font-size:10px;color:var(--tx3)">${t.tgl}</span></td>
      <td style="font-weight:600">${t.pelanggan}</td>
      <td>${brgStr}</td>
      <td style="font-weight:800;color:var(--blue-d)">${fmtRp(t.total)}</td>
      <td>${badgeBayar(t.bayar)}</td>
      <td><div style="display:flex; gap:6px; flex-wrap:wrap;">${editBtn} <button class="btn btn-ghost btn-xs" onclick="showNota('${t.id}')">Lihat Nota</button></div></td>
      </tr>`;
  }).join('');
  let tbl = document.getElementById('kasir-riwayat-tbl');
  if(tbl) tbl.innerHTML=`<table><thead><tr><th>ID / Tgl</th><th>Pelanggan</th><th>Barang Cetak</th><th>Total</th><th>Status Bayar</th><th>Aksi</th></tr></thead><tbody>${rows||emptyRow(6,'🧾','Belum ada transaksi buatan Anda.')}</tbody></table>`;
}

async function bagikanGambarNota() {
  toast("Sedang menyiapkan gambar nota...", 2000);
  var element = document.getElementById('nota-preview-card');
  var hideElements = element.querySelectorAll('.hide-on-print');
  hideElements.forEach(el => el.style.display = 'none');

  try {
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    hideElements.forEach(el => el.style.display = '');

    canvas.toBlob(async function(blob) {
      let safeName = notaForWA.pelanggan.replace(/[^a-zA-Z0-9]/g, '_');
      const file = new File([blob], 'Nota-' + safeName + '-' + notaForWA.id + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Nota Pesanan',
            text: 'Berikut adalah nota pesanan Anda dari Abunawas Percetakan & Konveksi.'
          });
          return; 
        } catch (e) { console.log('Share dibatalkan pengguna', e); }
      }
      
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'Nota-' + safeName + '-' + notaForWA.id + '.png'; a.click(); URL.revokeObjectURL(url);
      toast("Gambar nota berhasil diunduh! Silakan lampirkan gambar ini ke WA pelanggan.", 3500, 'success');
    }, 'image/png');
  } catch(err) {
    console.error(err); toast("Gagal membuat gambar.", 2000, 'error'); hideElements.forEach(el => el.style.display = '');
  }
}

/* ════════════════ DESAIN & LOGIKA NOTA TERBARU ════════════════ */
function showNota(id){ var t=TRX.find(x => x.id===id); if(!t) return; notaForWA = t; currentNotaId = id; document.getElementById('nota-preview-card').innerHTML = buildNotaInner(t, true); openModal('mo-nota'); }

function buildNotaInner(t, isTampil) {
  var docTitle = (t.bayar === 'Lunas') ? 'BUKTI LUNAS / INVOICE' : 'INVOICE / TAGIHAN PESANAN';

  // Render Items
  var trxItems = t.items || [{kode: 'CSTM', barang: t.barang||'Pesanan', qty: 1, harga: t.total, total: t.total}];
  var itemRows = trxItems.map(i => `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:8px 0; font-size:13px; border-bottom:1px dashed #E2E8F0;">
       <div style="flex:1;"><span style="color:#0F172A; font-weight:700;">${i.barang}</span><br><span style="font-size:11px; color:#64748B; font-family:var(--mono);">${i.qty} x ${fmtRp(i.harga)}</span></div>
       <div style="font-weight:800; padding-left:10px; color:#0F172A;">${fmtRp(i.total)}</div>
    </div>`).join('');

  let subtotalHtml = '';
  if((t.diskon && t.diskon > 0) || (t.ongkir && t.ongkir > 0)) {
      let sub = trxItems.reduce((sum, i) => sum + i.total, 0);
      subtotalHtml += `<div class="n-row" style="color:#64748B;font-size:12px; margin-top:12px;"><span class="n-lbl">Subtotal</span><span class="n-val">${fmtRp(sub)}</span></div>`;
      if(t.diskon > 0) subtotalHtml += `<div class="n-row" style="color:#DC2626;font-size:12px"><span class="n-lbl">Diskon</span><span class="n-val">-${fmtRp(t.diskon)}</span></div>`;
      if(t.ongkir > 0) subtotalHtml += `<div class="n-row" style="color:#64748B;font-size:12px"><span class="n-lbl">Ongkos Kirim</span><span class="n-val">+${fmtRp(t.ongkir)}</span></div>`;
  }

  // Dinamis Multi Rekening
  var rekListHtml = (TOKO.rekening||[]).map(r => `
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:10px; border-radius:8px; margin-bottom:8px; text-align:left; font-size:12px; color:#475569;">
        <strong style="color:#0F172A; font-size:13px;">${r.bank} - ${r.no}</strong> <br> ${r.an}
      </div>
  `).join('');

  var paymentSection = '';
  if (t.sisa > 0) {
     paymentSection = `
       <div style="margin-top:20px; padding:16px; border-top:2px dashed #E2E8F0; background:#F8FAFC; border-radius:12px;">
         <div style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:800; color:#0F172A; margin-bottom:12px;"><div style="width:4px; height:14px; background:#3B82F6; border-radius:2px;"></div> METODE PEMBAYARAN </div>
         ${rekListHtml}
         <div style="background:#fff; border:1px solid #E2E8F0; padding:20px; border-radius:12px; text-align:center; margin-bottom:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
           <img src="${TOKO.qrisImg}" style="width:100%; max-width:220px; height:auto; margin-bottom:12px; border-radius:8px;" alt="QRIS" onerror="this.style.display='none'">
           <div style="font-size:14px; font-weight:800; color:#0F172A;">Scan QRIS untuk pembayaran</div>
           <div style="font-size:12px; color:#64748B; margin-top:4px;">Masukkan nominal sesuai sisa tagihan</div>
         </div>
       </div>`;
  }
  
  let stampHtml = t.sisa === 0 
      ? `<div class="stamp-lunas">LUNAS</div>` 
      : `<div class="stamp-lunas stamp-hutang">BELUM LUNAS</div>`;
  
  let antreanHtml = t.no_cetak ? `<div style="font-size:16px; font-weight:900; color:#3B82F6; margin-bottom:16px;">Antrean / Cetak: #${t.no_cetak}</div>` : '';
  
  return `
    <div class="nota-header">
      <img src="HARGA.jpg" class="nota-header-logo" alt="" onerror="this.style.display='none'">
      <div class="nota-title">ABUNAWAS</div>
      <div class="nota-subtitle">Percetakan & Konveksi<br><span style="font-weight:400; font-size:11px; opacity:0.8;">Melayani Digital Printing</span></div>
    </div>
    
    <div class="nota-body">
        ${stampHtml}
        <div style="text-align:center; font-size:14px; font-weight:900; color:#1E293B; letter-spacing:1px; border-bottom:2px solid #E2E8F0; padding-bottom:12px; margin-bottom:16px;">${docTitle}</div>
        
        <div style="text-align:center;">${antreanHtml}</div>
        
        <div class="n-row"><span class="n-lbl">ID Nota</span><span class="n-val" style="font-family:var(--mono); color:#475569; font-size:11px;">${t.id}</span></div>
        <div class="n-row"><span class="n-lbl">Tanggal</span><span class="n-val">${t.tgl}</span></div>
        <div class="n-row" style="align-items:flex-start;"><span class="n-lbl">Pelanggan</span><span class="n-val" style="text-align:right">${t.pelanggan}<br><span style="font-size:10px;color:#64748B;font-family:var(--mono)">ID: ${t.id_cust||t.wa||'-'}</span></span></div>
        ${t.alamat ? `<div class="n-row" style="align-items:flex-start; margin-top:-6px;"><span class="n-lbl">Alamat</span><span class="n-val" style="text-align:right; font-size:11px; color:#64748B; max-width:65%; line-height:1.4">${t.alamat}</span></div>` : ''}
        
        <div style="margin-top:20px; margin-bottom:12px; font-size:12px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:1px;">Daftar Pesanan</div>
        ${itemRows}
        ${subtotalHtml}
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; margin-bottom:8px; background:#F8FAFC; padding:12px 16px; border-radius:8px; border:1px solid #E2E8F0;">
          <span style="font-size:14px; color:#475569; font-weight:700;">Total Tagihan Akhir</span><span style="font-size:18px; font-weight:900; font-family:var(--mono);color:#2563EB;">${fmtRp(t.total)}</span>
        </div>
        
        ${t.sisa > 0 ? `<div style="text-align:right; font-size:16px; font-weight:900; color:#DC2626; margin-top:8px;">Sisa Tagihan: ${fmtRp(t.sisa)}</div>` : ''}
        
        ${paymentSection}
        
        <div style="font-size:11px; color:#64748B; text-align:left; margin-bottom:20px; margin-top:24px; background:#F1F5F9; padding:12px; border-radius:8px; line-height:1.6; border:1px solid #E2E8F0;">
          <strong style="color:#0F172A;">NOTED:</strong><br>- Hasil warna cetakan tidak bisa 100% sama dengan warna layar.<br>- Barang tidak diambil lebih dari 7 hari dianggap hilang.
        </div>
        <div style="font-size:12px; color:#94A3B8; text-align:center; font-weight:600;">
          Kasir: <strong style="color:#475569">${t.kasir}</strong>
        </div>
    </div>
  `;
}

function kirimWANota(){
  if(!notaForWA) return;
  var docTitle = (notaForWA.bayar === 'Lunas') ? '*BUKTI TRANSAKSI*' : '*INVOICE PESANAN*';
  var statusText = `⚠️ *Sisa Tagihan:* ${fmtRp(notaForWA.sisa)}\n`; var alamatText = notaForWA.alamat ? `\n📍 *Alamat:* ${notaForWA.alamat}` : '';
  
  var trxItems = notaForWA.items || [{kode: 'CSTM', barang: notaForWA.barang||'Pesanan', qty: notaForWA.qty||1, harga: notaForWA.harga||notaForWA.total, total: notaForWA.total}];
  var itemTexts = trxItems.map(i => `▪️ *${i.barang}*\n   ${i.qty} x ${fmtRp(i.harga)} = ${fmtRp(i.total)}`).join('\n');

  let ekstraBiaya = '';
  if(notaForWA.diskon > 0) ekstraBiaya += `➖ *Diskon:* -${fmtRp(notaForWA.diskon)}\n`; if(notaForWA.ongkir > 0) ekstraBiaya += `🛵 *Ongkir:* +${fmtRp(notaForWA.ongkir)}\n`;

  var msg = `Halo *${notaForWA.pelanggan}*, berikut rincian pesanan Anda dari *ABUNAWAS (Percetakan & Konveksi)*.\n\n📄 ${docTitle}\n🧾 *ID Nota:* ${notaForWA.id}\n📅 *Tanggal:* ${notaForWA.tgl}\n\n📦 *DAFTAR PESANAN*\n${itemTexts}\n${ekstraBiaya}\n💰 *TOTAL TAGIHAN AKHIR: ${fmtRp(notaForWA.total)}*\n${notaForWA.sisa > 0 ? statusText : '✅ *Status: LUNAS*'}\n📍 *Pengambilan barang di:* Abunawas Percetakan & Konveksi${alamatText}\n(Kasir: ${notaForWA.kasir})\n\n*NOTED :*\n- HASIL WARNA CETAKAN TIDAK BISA 100% SAMA DENGAN WARNA LAYAR\n- BARANG TIDAK DIAMBIL LEBIH DARI 7 HARI DIANGGAP HILANG\n\nTerima kasih sudah mempercayakan pesanan Anda pada kami! 🙏`;
  if(notaForWA.wa){ sendWA(notaForWA.wa, msg); } else { alert("Pesan WA yang akan dikirim:\n\n" + msg); }
}

function kirimWAInfoBayar() {
  if(!notaForWA) return;
  if(notaForWA.sisa <= 0) { alert("Pesanan ini sudah Lunas! Tidak perlu mengirim info pembayaran lagi."); return; }

  let rekWa = (TOKO.rekening||[]).map(r => `${r.bank}: ${r.no} (${r.an})`).join('\n');
  var msg = `Halo *${notaForWA.pelanggan}*, untuk pesanan dengan ID *${notaForWA.id}*, berikut adalah detail tagihan Anda:\n\n💰 *Total Tagihan:* ${fmtRp(notaForWA.total)}\n${notaForWA.bayar === 'DP' ? `💸 *Sudah Dititipkan:* ${fmtRp(notaForWA.dibayar)}\n` : ''}⚠️ *SISA PEMBAYARAN: ${fmtRp(notaForWA.sisa)}*\n\n💳 *METODE PEMBAYARAN VIA TRANSFER:*\n${rekWa}\n\nAtau via *QRIS*, silakan klik link berikut untuk melihat Barcode QRIS kami:\n👉 ${TOKO.qrisLink}\n\n_(Ditunggu bukti foto transfer/pembayarannya ya kak agar pesanan bisa segera diproses. Terima kasih! 🙏)_`;
  if(notaForWA.wa){ sendWA(notaForWA.wa, msg); } else { alert("Pesan WA Info Bayar yang akan dikirim:\n\n" + msg); }
}

function kirimPDF() {
  if(!notaForWA) return;
  toast("Sedang mengonversi dan mengunduh file PDF...", 3000);
  var element = document.getElementById('nota-preview-card');
  var hideElements = element.querySelectorAll('.hide-on-print');
  hideElements.forEach(el => el.style.display = 'none');
  
  var opt = {
    margin:       0,
    filename:     'Nota-' + notaForWA.pelanggan.replace(/[^a-zA-Z0-9]/g, '_') + '-' + notaForWA.id + '.pdf',
    image:        { type: 'jpeg', quality: 1 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'in', format: 'a5', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save().then(() => {
      hideElements.forEach(el => el.style.display = '');
  });
}

/* ════════════════ PWA & INSTALL APP ════════════════ */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Munculkan tombol install jika aplikasi belum diinstall
  const installBtn = document.getElementById('btn-install');
  if(installBtn) installBtn.style.display = 'block';
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Aplikasi berhasil diinstall');
      }
      deferredPrompt = null;
      document.getElementById('btn-install').style.display = 'none';
    });
  }
}

// Register Service Worker untuk dukungan Install PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(function(err) {
      console.log('Catatan PWA: Untuk mengaktifkan fitur Install Aplikasi, buat file sw.js di GitHub Anda yang berisi: self.addEventListener("fetch", function(e) { });');
  });
}

/* ════════════════ EXPORT BACKUP JSON & CSV ════════════════ */
function backupJSON(){var b=new Blob([localStorage.getItem('abunawas_trx')],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Database-PrintKasir-'+nowDate()+'.json';a.click();}
function backupCSV(){var h='ID,Tanggal,Pelanggan,WA,Alamat,Item_Pesanan,Total_Harga,Dibayar,Sisa,Status_Bayar,Metode_Bayar,Nama_Kasir\n';var r=TRX.map(function(t){let trxItems = t.items || [{barang: t.barang, qty: t.qty}]; let itemStr = trxItems.map(i => i.barang + ' x' + i.qty).join(' | '); return[t.id,t.tgl,t.pelanggan,t.wa,t.alamat||'-',itemStr,t.total,t.dibayar,t.sisa,t.bayar,t.metode||'Cash',t.kasir].join(',');}).join('\n');var b=new Blob([h+r],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Laporan-Transaksi-'+nowDate()+'.csv';a.click();}

/* ════ INIT DEFAULT LOGIN SCREEN ════ */
document.getElementById('inp-u').value=''; document.getElementById('inp-p').value='';
window.onload = function() { if (window.location.search.includes('katalog=true')) { showKatalog(); } };

/* ════════════════════════════════════════════════════════
   🔐 AUDIT TRAIL — OWNER ONLY
   ════════════════════════════════════════════════════════ */

var AUDIT_KEY = 'auditLog_abunawas';
var AUDIT_MAX = 500;

function getAuditLog() {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY)) || []; }
  catch(e) { return []; }
}
function saveAuditLog(logs) {
  if (logs.length > AUDIT_MAX) logs = logs.slice(0, AUDIT_MAX);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

/**
 * Catat satu aksi ke audit log.
 * @param {string} aksi   - CREATE / UPDATE / DELETE / LOGIN / LOGOUT / EXPORT / PELUNASAN
 * @param {string} modul  - Transaksi / Kasbon / Barang / dst.
 * @param {object} data   - { label, before, after } (opsional)
 */
function logActivity(aksi, modul, data) {
  try {
    var logs = getAuditLog();
    var entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2,6),
      ts: new Date().toISOString(),
      aksi: aksi,
      modul: modul,
      user: curUser ? curUser.nama : 'System',
      role: curUser ? curUser.role : '-',
      label: (data && data.label) ? data.label : '',
      before: (data && data.before) ? data.before : null,
      after:  (data && data.after)  ? data.after  : null
    };
    logs.unshift(entry);
    saveAuditLog(logs);
  } catch(e) { /* silent fail */ }
}

var CP_AKSI_ICO = {
  CREATE:    { ico:'✦', bg:'rgba(0,255,136,0.10)' },
  UPDATE:    { ico:'✎', bg:'rgba(0,245,255,0.10)' },
  DELETE:    { ico:'✕', bg:'rgba(255,45,120,0.10)' },
  LOGIN:     { ico:'⏻', bg:'rgba(191,0,255,0.10)' },
  LOGOUT:    { ico:'⏼', bg:'rgba(106,106,173,0.10)' },
  EXPORT:    { ico:'⬇', bg:'rgba(255,184,0,0.10)' },
  PELUNASAN: { ico:'✔', bg:'rgba(0,255,136,0.10)' }
};

function renderAuditLog() {
  if (!curUser || curUser.role !== 'boss') return;

  var logs = getAuditLog();
  var today = nowDate();
  var mingguLalu = dMinus(7);

  // Hitung stats
  var logsHari   = logs.filter(function(l){ return l.ts.startsWith(today); });
  var logsDelete = logsHari.filter(function(l){ return l.aksi === 'DELETE'; });
  var logsLogin  = logsHari.filter(function(l){ return l.aksi === 'LOGIN'; });

  var elTotHari   = document.getElementById('cp-total-hari');
  var elTotSemua  = document.getElementById('cp-total-semua');
  var elTotDelete = document.getElementById('cp-total-delete');
  var elTotLogin  = document.getElementById('cp-total-login');
  if(elTotHari)   elTotHari.textContent   = logsHari.length;
  if(elTotSemua)  elTotSemua.textContent  = logs.length;
  if(elTotDelete) elTotDelete.textContent = logsDelete.length;
  if(elTotLogin)  elTotLogin.textContent  = logsLogin.length;

  // Filter
  var search  = (document.getElementById('cp-search')       || {}).value || '';
  var fWaktu  = (document.getElementById('cp-filter-waktu') || {}).value || 'semua';
  var fAksi   = (document.getElementById('cp-filter-aksi')  || {}).value || '';
  var fModul  = (document.getElementById('cp-filter-modul') || {}).value || '';

  var filtered = logs.filter(function(l) {
    var tgl = l.ts ? l.ts.substring(0,10) : '';
    if (fWaktu === 'hari'   && tgl !== today) return false;
    if (fWaktu === 'minggu' && tgl < mingguLalu) return false;
    if (fWaktu === 'bulan'  && tgl.substring(0,7) !== today.substring(0,7)) return false;
    if (fAksi  && l.aksi  !== fAksi)  return false;
    if (fModul && l.modul !== fModul) return false;
    if (search) {
      var q = search.toLowerCase();
      if (!(l.user  || '').toLowerCase().includes(q) &&
          !(l.modul || '').toLowerCase().includes(q) &&
          !(l.label || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  var container = document.getElementById('cp-log-list');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '<div class="cp-empty"><div class="cp-empty-ico">🔍</div>Tidak ada log yang cocok dengan filter.</div>';
    return;
  }

  var html = '';
  filtered.forEach(function(l) {
    var aksi = l.aksi || 'UPDATE';
    var ico = CP_AKSI_ICO[aksi] || { ico:'◈', bg:'rgba(255,255,255,0.05)' };
    var d   = new Date(l.ts);
    var jam = ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2);
    var tgl = ('0'+d.getDate()).slice(-2)+'/'+ ('0'+(d.getMonth()+1)).slice(-2) +'/'+d.getFullYear();
    var desc = l.label || (l.modul + ' — ' + aksi.toLowerCase());

    html += '<div class="cp-log-card act-'+aksi+'" onclick="showAuditDetail(\''+l.id+'\')">'+
      '<div class="cp-log-ico" style="background:'+ico.bg+';">'+ico.ico+'</div>'+
      '<div class="cp-log-info">'+
        '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">'+
          '<span class="cp-log-who">'+escHtml(l.user)+'</span>'+
          '<span style="font-size:10px; color:#4a4a7a; font-family:var(--mono);">['+escHtml(l.role)+']</span>'+
          '<span class="cp-badge-aksi badge-'+aksi+'">'+aksi+'</span>'+
          '<span style="font-size:10px; color:#00f5ff; opacity:0.6; font-family:var(--mono);">'+escHtml(l.modul)+'</span>'+
        '</div>'+
        '<div class="cp-log-desc">'+escHtml(desc)+'</div>'+
      '</div>'+
      '<div class="cp-log-time"><b>'+jam+'</b>'+tgl+'</div>'+
    '</div>';
  });
  container.innerHTML = html;
}

function showAuditDetail(id) {
  var logs = getAuditLog();
  var l = logs.find(function(x){ return x.id === id; });
  if (!l) return;

  var d = new Date(l.ts);
  var tsMedan = d.toLocaleString('id-ID', {
    day:'2-digit', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  });

  var rows = [
    ['Timestamp', tsMedan],
    ['Pengguna',  l.user  || '-'],
    ['Role',      l.role  || '-'],
    ['Aksi',      l.aksi  || '-'],
    ['Modul',     l.modul || '-'],
    ['Keterangan',l.label || '-']
  ];

  var detailHtml = rows.map(function(r){
    return '<div class="cp-detail-row">'+
      '<span class="cp-detail-key">'+escHtml(r[0])+'</span>'+
      '<span class="cp-detail-val">'+escHtml(r[1])+'</span>'+
    '</div>';
  }).join('');

  var diffHtml = '';
  if (l.before || l.after) {
    var beforeStr = l.before ? JSON.stringify(l.before, null, 2) : '—';
    var afterStr  = l.after  ? JSON.stringify(l.after,  null, 2) : '—';
    diffHtml = '<div class="cp-diff">'+
      '<div class="cp-diff-panel before"><div class="cp-diff-lbl before">◀ SEBELUM</div><pre style="white-space:pre-wrap; color:#ff6b8a; font-size:10px;">'+escHtml(beforeStr)+'</pre></div>'+
      '<div class="cp-diff-panel after"><div class="cp-diff-lbl after">SESUDAH ▶</div><pre style="white-space:pre-wrap; color:#00ff88; font-size:10px;">'+escHtml(afterStr)+'</pre></div>'+
    '</div>';
  }

  var titleEl = document.getElementById('mo-audit-title');
  var bodyEl  = document.getElementById('mo-audit-body');
  if (titleEl) titleEl.innerHTML = '🔐 Detail Log — <span style="color:#00f5ff;">'+escHtml(l.aksi)+'</span>';
  if (bodyEl)  bodyEl.innerHTML  = detailHtml + diffHtml;
  openModal('mo-audit-detail');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function resetFilterAudit() {
  var s = document.getElementById('cp-search');       if(s) s.value = '';
  var w = document.getElementById('cp-filter-waktu'); if(w) w.value = 'hari';
  var a = document.getElementById('cp-filter-aksi');  if(a) a.value = '';
  var m = document.getElementById('cp-filter-modul'); if(m) m.value = '';
  renderAuditLog();
}

function clearAuditLog() {
  if (!confirm('Hapus SEMUA log aktivitas? Tindakan ini tidak bisa dibatalkan.')) return;
  localStorage.removeItem(AUDIT_KEY);
  renderAuditLog();
  toast('Log aktivitas berhasil dihapus.', 2000, 'success');
}

function exportAuditCSV() {
  var logs = getAuditLog();
  if (!logs.length) { toast('Tidak ada log untuk di-export.', 2000, 'error'); return; }
  var rows = [['Timestamp','Pengguna','Role','Aksi','Modul','Keterangan']];
  logs.forEach(function(l){
    rows.push([
      l.ts || '', l.user || '', l.role || '',
      l.aksi || '', l.modul || '', (l.label || '').replace(/,/g,' ')
    ]);
  });
  var csv = rows.map(function(r){ return r.join(','); }).join('\n');
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = 'audit-log-abunawas-'+ nowDate() +'.csv';
  a.click(); URL.revokeObjectURL(url);
  logActivity('EXPORT', 'Backup', { label: 'Export Audit Log CSV' });
  toast('Log berhasil di-export ke CSV!', 2500, 'success');
}

/* ═══ HOOK logActivity ke fungsi-fungsi yang sudah ada ═══ */

// Patch login
var _origLogin = login;
login = function() {
  // Ambil username sebelum curUser di-set
  var uInput = (document.getElementById('fi-user') || {}).value || '';
  _origLogin();
  // Setelah login, curUser sudah di-set
  if (curUser) {
    logActivity('LOGIN', 'Auth', { label: 'Login sebagai ' + curUser.nama + ' (' + curUser.role + ')' });
  }
};

// Patch logout (fungsi aslinya doLogout)
var _origDoLogout = doLogout;
doLogout = function() {
  if (curUser) {
    logActivity('LOGOUT','Auth',{label:'Logout — '+curUser.nama});
    kirimRekapHarian();
  }
  _origDoLogout();
};

// Patch saveData untuk tangkap aktivitas simpan transaksi, barang, dll.
// (logActivity dipanggil manual di titik-titik kunci di bawah)

// Patch saveTrx / simpan transaksi — cari fungsi yang dipanggil saat simpan
var _origSimpanTrx = typeof simpanTrx === 'function' ? simpanTrx : null;
if (_origSimpanTrx) {
  simpanTrx = function() {
    var isEdit = !!currentEditTrxId;
    _origSimpanTrx.apply(this, arguments);
    logActivity(isEdit ? 'UPDATE' : 'CREATE', 'Transaksi', {
      label: (isEdit ? 'Edit' : 'Buat') + ' transaksi'
    });
  };
}


/* ═══════════════════════════════════════════════════════════════
   🔔 TAGIHAN RUTIN & REMINDER
   ═══════════════════════════════════════════════════════════════ */
var TAGIHAN = JSON.parse(localStorage.getItem('abunawas_tagihan')) || [];

function simpanTagihan() {
  var nama = document.getElementById('tg-nama').value.trim();
  var nominal = cleanRibuan(document.getElementById('tg-nominal').value);
  var tgl = parseInt(document.getElementById('tg-tgl').value);
  var kat = document.getElementById('tg-kat').value;
  var ket = document.getElementById('tg-ket').value.trim();
  if (!nama || nominal <= 0 || !tgl) { toast('Lengkapi nama, nominal, dan tanggal jatuh tempo!', 2500, 'error'); return; }
  TAGIHAN.push({ id: 'TG-'+Date.now(), nama, nominal, tgl, kat, ket, aktif: true });
  localStorage.setItem('abunawas_tagihan', JSON.stringify(TAGIHAN));
  logActivity('CREATE', 'Tagihan', { label: 'Tambah tagihan: '+nama+' Rp '+fmt(nominal) });
  document.getElementById('tg-nama').value = '';
  document.getElementById('tg-nominal').value = '';
  document.getElementById('tg-tgl').value = '';
  document.getElementById('tg-ket').value = '';
  renderTagihan();
  toast('✅ Tagihan berhasil ditambahkan!', 2500, 'success');
}

function hapusTagihan(id) {
  if (!confirm('Hapus tagihan ini?')) return;
  TAGIHAN = TAGIHAN.filter(t => t.id !== id);
  localStorage.setItem('abunawas_tagihan', JSON.stringify(TAGIHAN));
  renderTagihan();
  toast('Tagihan dihapus.', 2000, 'success');
}

function renderTagihan() {
  var el = document.getElementById('tg-list');
  if (!el) return;
  if (TAGIHAN.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--tx3);"><div style="font-size:36px;margin-bottom:8px;">🔔</div><div style="font-weight:700;">Belum ada tagihan rutin.</div></div>';
    return;
  }
  var hari = new Date().getDate();
  var html = '';
  TAGIHAN.forEach(function(t) {
    var selisih = t.tgl - hari;
    var cls = '';
    var statusTeks = 'Jatuh tempo tgl <b>' + t.tgl + '</b> setiap bulan';
    var badgeCls = 'bg-green';
    if (selisih <= 0) { cls = 'danger'; statusTeks = '⚠️ Sudah jatuh tempo!'; badgeCls = 'bg-red'; }
    else if (selisih <= 5) { cls = 'warning'; statusTeks = '⏰ ' + selisih + ' hari lagi jatuh tempo'; badgeCls = 'bg-amber'; }
    html += '<div class="tg-card '+cls+'">' +
      '<div style="font-size:24px;">'+getCategoryIcon(t.kat)+'</div>' +
      '<div style="flex:1;">' +
        '<div style="font-weight:800;font-size:14px;color:var(--tx);">'+t.nama+'</div>' +
        '<div style="font-size:11px;color:var(--tx2);margin-top:2px;">'+t.kat+' &bull; '+statusTeks+'</div>' +
        (t.ket ? '<div style="font-size:11px;color:var(--tx3);margin-top:2px;">'+t.ket+'</div>' : '') +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-weight:900;font-size:15px;font-family:var(--mono);">'+fmtRp(t.nominal)+'</div>' +
        '<span class="badge '+badgeCls+' tg-badge-due" style="margin-top:4px;">tgl '+t.tgl+'</span>' +
      '</div>' +
      '<button class="btn btn-red btn-xs" onclick="hapusTagihan(\''+t.id+'\')">Hapus</button>' +
    '</div>';
  });
  el.innerHTML = html;
}

function getCategoryIcon(kat) {
  var icons = {'Listrik & Air':'⚡','Internet':'📶','Sewa Tempat':'🏠','Cicilan Mesin':'⚙️','Gaji Karyawan':'👥','Langganan Software':'💻'};
  return icons[kat] || '📋';
}

function cekReminderTagihan() {
  if (!('Notification' in window)) { toast('Browser kamu tidak mendukung notifikasi.', 2500, 'error'); return; }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      var hari = new Date().getDate();
      var tagihanMendekat = TAGIHAN.filter(t => (t.tgl - hari) <= 3 && (t.tgl - hari) >= 0);
      if (tagihanMendekat.length > 0) {
        tagihanMendekat.forEach(function(t) {
          new Notification('⏰ Reminder Tagihan Abunawas', {
            body: t.nama + ' — ' + fmtRp(t.nominal) + '\nJatuh tempo tgl ' + t.tgl,
            icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
          });
        });
      } else {
        new Notification('✅ Abunawas — Tagihan Aman', { body: 'Tidak ada tagihan yang jatuh tempo dalam 3 hari ke depan.' });
      }
      toast('Notifikasi reminder diaktifkan!', 2500, 'success');
    } else {
      toast('Izin notifikasi ditolak oleh browser.', 2500, 'error');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   💯 SKOR KESEHATAN FINANSIAL + DTI
   ═══════════════════════════════════════════════════════════════ */
function renderSkorFinansial() {
  var el = document.getElementById('skor-main');
  if (!el) return;

  var bulanIni = nowDate().substring(0, 7);
  var trxBulan = TRX.filter(t => t.tgl && t.tgl.startsWith(bulanIni));
  var pengBulan = PENGELUARAN.filter(p => p.tgl && p.tgl.startsWith(bulanIni));

  var totalPemasukan = trxBulan.reduce((s, t) => s + (t.dibayar || 0), 0);
  var totalPengeluaran = pengBulan.reduce((s, p) => s + (p.total || p.subtotal || 0), 0);
  var laba = totalPemasukan - totalPengeluaran;
  var totalPiutang = TRX.filter(t => t.sisa > 0).reduce((s, t) => s + t.sisa, 0);
  var totalHutang = PENGELUARAN.filter(p => p.bayar === 'Kasbon' || p.bayar === 'DP').reduce((s, p) => s + (p.sisa || 0), 0);
  var totalKasbon = KASBON.reduce((s, k) => s + (k.nominal || 0), 0);

  // Hitung skor per komponen (masing-masing 0-100)
  var sRasio = totalPemasukan > 0 ? Math.min(100, Math.round((laba / totalPemasukan) * 100 * 1.5)) : 0;
  if (sRasio < 0) sRasio = 0;
  var sLaba = laba > 0 ? Math.min(100, Math.round(laba / 500000 * 10)) : 0;
  var sPiutang = totalPemasukan > 0 ? Math.max(0, 100 - Math.round((totalPiutang / totalPemasukan) * 100)) : 50;
  var sHutang  = totalPemasukan > 0 ? Math.max(0, 100 - Math.round((totalHutang / totalPemasukan) * 100)) : 80;
  var sKasbon  = totalPemasukan > 0 ? Math.max(0, 100 - Math.round((totalKasbon / totalPemasukan) * 80)) : 80;

  var skor = Math.round((sRasio * 0.35) + (sLaba * 0.2) + (sPiutang * 0.2) + (sHutang * 0.15) + (sKasbon * 0.1));
  skor = Math.max(0, Math.min(100, skor));

  var warna = skor >= 75 ? '#10B981' : skor >= 50 ? '#F59E0B' : '#EF4444';
  var warnaLabel = skor >= 75 ? '#047857' : skor >= 50 ? '#B45309' : '#B91C1C';
  var labelSkor = skor >= 75 ? 'SEHAT ✓' : skor >= 50 ? 'WASPADA ⚠' : 'BAHAYA ✕';

  // DTI
  var totalCicilan = TAGIHAN.reduce((s, t) => s + (t.nominal || 0), 0);
  var dti = totalPemasukan > 0 ? Math.round((totalCicilan / totalPemasukan) * 100) : 0;
  var dtiLabel = dti <= 30 ? '✅ Aman' : dti <= 50 ? '⚠️ Waspada' : '🚨 Bahaya';
  var dtiColor = dti <= 30 ? '#10B981' : dti <= 50 ? '#F59E0B' : '#EF4444';

  var circumference = 2 * Math.PI * 60;
  var dashOffset = circumference - (skor / 100) * circumference;

  var komponen = [
    { ico: '📊', label: 'Rasio Laba', val: sRasio, desc: 'Perbandingan laba terhadap pemasukan' },
    { ico: '💰', label: 'Laba Bersih', val: sLaba, desc: fmtRp(laba) + ' bulan ini' },
    { ico: '👤', label: 'Piutang Terkendali', val: sPiutang, desc: 'Total piutang: ' + fmtRp(totalPiutang) },
    { ico: '🏦', label: 'Hutang Vendor', val: sHutang, desc: 'Total hutang vendor: ' + fmtRp(totalHutang) },
    { ico: '👥', label: 'Kasbon Karyawan', val: sKasbon, desc: 'Total kasbon: ' + fmtRp(totalKasbon) }
  ];

  var komponenHtml = komponen.map(function(k) {
    var kWarna = k.val >= 75 ? '#10B981' : k.val >= 50 ? '#F59E0B' : '#EF4444';
    return '<div class="skor-item">' +
      '<div class="skor-item-ico" style="background:'+kWarna+'22;">'+k.ico+'</div>' +
      '<div class="skor-bar-wrap">' +
        '<div class="skor-bar-lbl"><span>'+k.label+'</span><span style="color:'+kWarna+'">'+k.val+'/100</span></div>' +
        '<div class="skor-bar-bg"><div class="skor-bar-fill" style="width:'+k.val+'%;background:'+kWarna+';"></div></div>' +
        '<div style="font-size:10px;color:var(--tx3);margin-top:3px;">'+k.desc+'</div>' +
      '</div></div>';
  }).join('');

  el.innerHTML =
    '<div class="card" style="text-align:center;">' +
      '<div class="card-t" style="justify-content:center;">Skor Bulan ' + new Date().toLocaleString('id-ID',{month:'long',year:'numeric'}) + '</div>' +
      '<div class="skor-ring-wrap">' +
        '<div class="skor-ring">' +
          '<svg width="160" height="160" viewBox="0 0 160 160">' +
            '<circle cx="80" cy="80" r="60" fill="none" stroke="var(--bdr)" stroke-width="12"/>' +
            '<circle cx="80" cy="80" r="60" fill="none" stroke="'+warna+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+circumference+'" stroke-dashoffset="'+dashOffset+'" style="transition:stroke-dashoffset 1.5s ease;"/>' +
          '</svg>' +
          '<div class="skor-ring-val"><div class="skor-num" style="color:'+warna+'">'+skor+'</div><div class="skor-label" style="color:'+warnaLabel+'">'+labelSkor+'</div></div>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0;">' +
        '<div style="background:var(--surf2);border-radius:12px;padding:12px;"><div style="font-size:11px;color:var(--tx3);font-weight:700;">Pemasukan</div><div style="font-weight:900;font-size:14px;font-family:var(--mono);color:var(--green);">'+fmtRp(totalPemasukan)+'</div></div>' +
        '<div style="background:var(--surf2);border-radius:12px;padding:12px;"><div style="font-size:11px;color:var(--tx3);font-weight:700;">Pengeluaran</div><div style="font-weight:900;font-size:14px;font-family:var(--mono);color:var(--red);">'+fmtRp(totalPengeluaran)+'</div></div>' +
        '<div style="background:var(--surf2);border-radius:12px;padding:12px;"><div style="font-size:11px;color:var(--tx3);font-weight:700;">Laba Bersih</div><div style="font-weight:900;font-size:14px;font-family:var(--mono);color:'+(laba>=0?'var(--green)':'var(--red)')+';">'+fmtRp(laba)+'</div></div>' +
      '</div>' +
      '<div style="background:var(--surf2);border:1px solid var(--bdr);border-radius:12px;padding:14px;margin-bottom:16px;">' +
        '<div style="font-size:11px;font-weight:800;color:var(--tx3);margin-bottom:8px;">⚖️ DEBT TO INCOME RATIO (DTI)</div>' +
        '<div style="font-size:28px;font-weight:900;font-family:var(--mono);color:'+dtiColor+';">'+dti+'%</div>' +
        '<div style="font-size:13px;font-weight:700;color:'+dtiColor+';margin:4px 0;">'+dtiLabel+'</div>' +
        '<div style="font-size:11px;color:var(--tx3);">Total tagihan rutin '+fmtRp(totalCicilan)+' / bulan</div>' +
      '</div>' +
    '</div>' +
    '<div class="card"><div class="card-t">📊 Detail Komponen Skor</div>' + komponenHtml + '</div>';
}

/* ═══════════════════════════════════════════════════════════════
   🤖 AI ADVISOR CHAT
   ═══════════════════════════════════════════════════════════════ */
var aiChatHistory = [];

function initAIAdvisor() {
  // Sudah ada welcome bubble di HTML, tidak perlu re-init
}

function aiChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimAIChat(); }
}

function aiQuickAsk(teks) {
  document.getElementById('ai-chat-input').value = teks;
  kirimAIChat();
}

async function kirimAIChat() {
  if (!apiKey) { toast('Masukkan Gemini API Key di Pengaturan Toko terlebih dahulu!', 3000, 'error'); return; }
  var inputEl = document.getElementById('ai-chat-input');
  var pesan = inputEl.value.trim();
  if (!pesan) return;

  inputEl.value = '';
  tambahBubble('user', pesan);

  var typing = tambahBubble('bot', '...', true);

  // Buat context data bisnis
  var bulanIni = nowDate().substring(0, 7);
  var trxBulan = TRX.filter(t => t.tgl && t.tgl.startsWith(bulanIni));
  var pengBulan = PENGELUARAN.filter(p => p.tgl && p.tgl.startsWith(bulanIni));
  var totalMasuk = trxBulan.reduce((s, t) => s + (t.dibayar || 0), 0);
  var totalKeluar = pengBulan.reduce((s, p) => s + (p.total || p.subtotal || 0), 0);
  var piutangList = TRX.filter(t => t.sisa > 0).map(t => t.pelanggan + ' (Rp ' + fmt(t.sisa) + ')').join(', ');

  var konteks = 'Kamu adalah AI Advisor keuangan usaha percetakan & konveksi "Abunawas". ' +
    'Jawab dalam Bahasa Indonesia santai & ringkas. Gunakan data berikut:\n' +
    '- Bulan ini: Pemasukan Rp ' + fmt(totalMasuk) + ', Pengeluaran Rp ' + fmt(totalKeluar) + ', Laba Rp ' + fmt(totalMasuk - totalKeluar) + '\n' +
    '- Total transaksi bulan ini: ' + trxBulan.length + ' transaksi\n' +
    '- Piutang belum lunas: ' + (piutangList || 'tidak ada') + '\n' +
    '- Total kasbon karyawan: Rp ' + fmt(KASBON.reduce((s, k) => s + k.nominal, 0)) + '\n' +
    '- Tagihan rutin per bulan: Rp ' + fmt(TAGIHAN.reduce((s, t) => s + t.nominal, 0)) + '\n' +
    'Jawab pertanyaan user berdasarkan data ini. Kalau tidak ada data cukup, bilang jujur.';

  aiChatHistory.push({ role: 'user', content: pesan });

  try {
    var messages = [{ role: 'user', content: konteks + '\n\nPertanyaan: ' + pesan }];
    if (aiChatHistory.length > 2) {
      messages = aiChatHistory.slice(-6).map(function(m) {
        return { role: m.role, content: m.role === 'user' && m === aiChatHistory[aiChatHistory.length-1] ? konteks + '\n\nPertanyaan: ' + m.content : m.content };
      });
    }

    var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: konteks + '\n\nPertanyaan user: ' + pesan }] }] })
    });
    var data = await resp.json();
    var jawaban = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, AI tidak bisa menjawab saat ini.';
    typing.remove();
    tambahBubble('bot', jawaban);
    aiChatHistory.push({ role: 'assistant', content: jawaban });
  } catch (e) {
    typing.remove();
    tambahBubble('bot', '⚠️ Gagal terhubung ke AI. Cek koneksi atau API key kamu.');
  }
}

function tambahBubble(tipe, teks, isTyping) {
  var container = document.getElementById('ai-chat-messages');
  if (!container) return null;
  var div = document.createElement('div');
  div.className = 'ai-bubble ai-bubble-' + tipe + (isTyping ? ' ai-bubble-typing' : '');
  if (tipe === 'bot') {
    div.innerHTML = '<div class="ai-bubble-ava">🤖</div><div class="ai-bubble-msg">' + (isTyping ? '<span style="opacity:0.6">AI sedang mengetik...</span>' : teks.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')) + '</div>';
  } else {
    div.innerHTML = '<div class="ai-bubble-msg">' + teks + '</div><div class="ai-bubble-ava" style="background:linear-gradient(135deg,#3B82F6,#2563EB);">👤</div>';
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

/* ═══════════════════════════════════════════════════════════════
   📸 OCR FOTO NOTA (via Gemini Vision)
   ═══════════════════════════════════════════════════════════════ */
var ocrImageBase64 = null;

function handleOCRUpload(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    ocrImageBase64 = ev.target.result.split(',')[1];
    document.getElementById('ocr-img').src = ev.target.result;
    document.getElementById('ocr-preview').style.display = 'block';
    document.getElementById('ocr-drop-zone').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function prosesOCR() {
  if (!apiKey) { toast('Masukkan Gemini API Key di Pengaturan!', 2500, 'error'); return; }
  if (!ocrImageBase64) { toast('Upload foto nota dulu!', 2500, 'error'); return; }

  document.getElementById('ocr-preview').style.display = 'none';
  document.getElementById('ocr-loading').style.display = 'block';
  document.getElementById('ocr-result').style.display = 'none';

  var prompt = 'Baca nota/struk pembelian ini. Ekstrak dan jawab HANYA dalam format JSON berikut (tanpa markdown):\n' +
    '{"vendor":"nama toko/vendor","tgl":"YYYY-MM-DD","total":angka_tanpa_titik,"kat":"kategori barang","ket":"deskripsi item-item yang dibeli dalam 1 kalimat"}';

  try {
    var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'image/jpeg', data: ocrImageBase64 } },
          { text: prompt }
        ]}]
      })
    });
    var data = await resp.json();
    var raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    var parsed = JSON.parse(raw);

    document.getElementById('ocr-vendor').value = parsed.vendor || '';
    document.getElementById('ocr-tgl').value = parsed.tgl || nowDate();
    document.getElementById('ocr-total').value = parsed.total ? formatRibuan(parsed.total) : '';
    document.getElementById('ocr-ket').value = parsed.ket || '';

    document.getElementById('ocr-loading').style.display = 'none';
    document.getElementById('ocr-result').style.display = 'block';
    toast('✅ AI berhasil membaca nota!', 2500, 'success');
  } catch(e) {
    document.getElementById('ocr-loading').style.display = 'none';
    document.getElementById('ocr-preview').style.display = 'block';
    toast('Gagal membaca nota. Coba foto yang lebih jelas.', 3000, 'error');
  }
}

function simpanDariOCR() {
  var vendor = document.getElementById('ocr-vendor').value.trim() || 'Vendor';
  var tgl = document.getElementById('ocr-tgl').value || nowDate();
  var total = cleanRibuan(document.getElementById('ocr-total').value);
  var kat = document.getElementById('ocr-kat').value;
  var ket = document.getElementById('ocr-ket').value.trim();

  if (total <= 0) { toast('Nominal tidak valid!', 2000, 'error'); return; }

  var id = 'PG-' + Date.now();
  PENGELUARAN.unshift({ id, tgl, vendor, total, subtotal: total, bayar: 'Lunas', ket: ket || kat, items: [{ nama: ket, nominal: total }] });
  saveData();
  logActivity('CREATE', 'Pengeluaran', { label: 'OCR Nota: ' + vendor + ' Rp ' + fmt(total) });
  toast('✅ Pengeluaran dari nota berhasil disimpan!', 2500, 'success');
  resetOCR();
  showPage('pengeluaran');
}

function resetOCR() {
  ocrImageBase64 = null;
  document.getElementById('ocr-file-input').value = '';
  document.getElementById('ocr-drop-zone').style.display = 'block';
  document.getElementById('ocr-preview').style.display = 'none';
  document.getElementById('ocr-result').style.display = 'none';
  document.getElementById('ocr-loading').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════
   🎙️ VOICE TO TRANSACTION
   ═══════════════════════════════════════════════════════════════ */
var voiceRec = null;
var isRecording = false;
var voiceTranscript = '';

function initVoicePage() {
  voiceTranscript = '';
  var el = document.getElementById('voice-transcript');
  if (el) el.textContent = '';
  var btn = document.getElementById('voice-process-btn');
  if (btn) btn.style.display = 'none';
  document.getElementById('voice-result').style.display = 'none';
  document.getElementById('voice-status').textContent = 'Tekan tombol mic untuk mulai';
}

function toggleVoiceRec() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    toast('Browser kamu tidak mendukung Voice Recognition. Gunakan Chrome!', 3000, 'error');
    return;
  }
  if (isRecording) { stopVoice(); return; }
  startVoice();
}

function startVoice() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRec = new SR();
  voiceRec.lang = 'id-ID';
  voiceRec.continuous = false;
  voiceRec.interimResults = true;

  voiceRec.onstart = function() {
    isRecording = true;
    document.getElementById('voice-mic-btn').classList.add('recording');
    document.getElementById('voice-mic-btn').textContent = '⏹';
    document.getElementById('voice-status').textContent = '🔴 Sedang merekam... Ngomong sekarang!';
  };
  voiceRec.onresult = function(e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) voiceTranscript += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    document.getElementById('voice-transcript').textContent = voiceTranscript + interim;
  };
  voiceRec.onend = function() { stopVoice(); };
  voiceRec.onerror = function(e) { stopVoice(); toast('Error rekam: ' + e.error, 2500, 'error'); };
  voiceRec.start();
}

function stopVoice() {
  isRecording = false;
  if (voiceRec) { try { voiceRec.stop(); } catch(e){} }
  document.getElementById('voice-mic-btn').classList.remove('recording');
  document.getElementById('voice-mic-btn').textContent = '🎙️';
  document.getElementById('voice-status').textContent = voiceTranscript ? 'Rekaman selesai. Klik proses!' : 'Tekan tombol mic untuk mulai';
  if (voiceTranscript.trim()) {
    document.getElementById('voice-process-btn').style.display = 'block';
  }
}

async function prosesVoiceTrx() {
  if (!apiKey) { toast('Masukkan Gemini API Key di Pengaturan!', 2500, 'error'); return; }
  var teks = voiceTranscript.trim();
  if (!teks) return;

  var prompt = 'Dari teks berikut, ekstrak transaksi keuangan usaha. Jawab HANYA JSON (tanpa markdown):\n' +
    '{"jenis":"pemasukan atau pengeluaran","nominal":angka_saja,"ket":"keterangan singkat","metode":"Cash atau Transfer atau QRIS"}\n\n' +
    'Teks: "' + teks + '"';

  document.getElementById('voice-status').textContent = '✨ AI sedang memproses...';
  try {
    var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    var data = await resp.json();
    var raw = (data.candidates?.[0]?.content?.parts?.[0]?.text || '{}').replace(/```json|```/g,'').trim();
    var parsed = JSON.parse(raw);

    document.getElementById('vr-jenis').value = parsed.jenis || 'pengeluaran';
    document.getElementById('vr-nominal').value = parsed.nominal ? formatRibuan(parsed.nominal) : '';
    document.getElementById('vr-ket').value = parsed.ket || teks;
    document.getElementById('vr-metode').value = parsed.metode || 'Cash';
    document.getElementById('vr-tgl').value = nowDate();
    document.getElementById('voice-result').style.display = 'block';
    document.getElementById('voice-status').textContent = '✅ AI berhasil mengekstrak transaksi!';
  } catch(e) {
    document.getElementById('voice-status').textContent = 'Gagal proses. Coba lagi.';
    toast('Gagal memproses suara dengan AI.', 2500, 'error');
  }
}

function simpanVoiceTrx() {
  var jenis = document.getElementById('vr-jenis').value;
  var nominal = cleanRibuan(document.getElementById('vr-nominal').value);
  var ket = document.getElementById('vr-ket').value.trim();
  var metode = document.getElementById('vr-metode').value;
  var tgl = document.getElementById('vr-tgl').value;

  if (nominal <= 0) { toast('Nominal tidak valid!', 2000, 'error'); return; }

  if (jenis === 'pengeluaran') {
    PENGELUARAN.unshift({ id: 'VTX-'+Date.now(), tgl, vendor: 'Voice Input', total: nominal, subtotal: nominal, bayar: 'Lunas', ket: ket, items: [{nama: ket, nominal}] });
    logActivity('CREATE', 'Pengeluaran', { label: 'Voice: '+ket+' Rp '+fmt(nominal) });
  } else {
    // Pemasukan → simpan ke transaksi sederhana
    TRX.unshift({ id: nowId(), tgl, pelanggan: 'Voice Input', wa: '', alamat: '', items: [{kode:'VOICE', barang: ket, qty:1, harga:nominal, total:nominal, modal:0}], total: nominal, modal: 0, bayar: 'Lunas', dibayar: nominal, sisa: 0, metode: metode, kasir: curUser ? curUser.nama : '-', catatan: ket, diskon:0, ongkir:0 });
    logActivity('CREATE', 'Transaksi', { label: 'Voice: '+ket+' Rp '+fmt(nominal) });
  }
  saveData();
  toast('✅ Transaksi dari suara berhasil disimpan!', 2500, 'success');
  resetVoice();
}

function resetVoice() {
  voiceTranscript = '';
  document.getElementById('voice-transcript').textContent = '';
  document.getElementById('voice-process-btn').style.display = 'none';
  document.getElementById('voice-result').style.display = 'none';
  document.getElementById('voice-status').textContent = 'Tekan tombol mic untuk mulai';
  document.getElementById('voice-mic-btn').textContent = '🎙️';
}

/* ── helper ── */
function formatInputRibuan(el) { el.value = formatRibuan(cleanRibuan(el.value)); }

/* ════════════════════════════════════════════════════════════════
   🧮 KALKULATOR PRODUKSI
   ════════════════════════════════════════════════════════════════ */
var hppRows = [];
var bannerRekap = [];

var HPP_TEMPLATES = {
  jas: [
    {nama:'Kain Wool/Blazer', harga:45000, qty:1.5},
    {nama:'Furing', harga:15000, qty:1.5},
    {nama:'Kancing', harga:5000, qty:1},
    {nama:'Benang & Obras', harga:3000, qty:1},
    {nama:'Aksesoris (Logo,Bordir)', harga:15000, qty:1},
    {nama:'Jahit & Finishing', harga:35000, qty:1},
    {nama:'Packing', harga:3000, qty:1}
  ],
  toga: [
    {nama:'Kain Saten/Sifon', harga:25000, qty:3},
    {nama:'Kain Topi Toga', harga:12000, qty:0.5},
    {nama:'Aksesoris (Logo, Tali)', harga:10000, qty:1},
    {nama:'Jahit & Obras', harga:20000, qty:1},
    {nama:'Packing', harga:2000, qty:1}
  ],
  kaos: [
    {nama:'Kain Cotton Combed', harga:20000, qty:0.5},
    {nama:'Sablon (DTF/Sablon Manual)', harga:8000, qty:1},
    {nama:'Jahit', harga:10000, qty:1},
    {nama:'Label & Packing', harga:2000, qty:1}
  ],
  polo: [
    {nama:'Kain Lacoste/Pique', harga:35000, qty:0.7},
    {nama:'Kerah & Kancing', harga:5000, qty:1},
    {nama:'Bordir Logo', harga:10000, qty:1},
    {nama:'Jahit & Obras', harga:15000, qty:1},
    {nama:'Label & Packing', harga:2000, qty:1}
  ]
};

function initKalkulator() {
  switchKalkTab('konveksi');
  if (hppRows.length === 0) tambahHPPRow();
}

function switchKalkTab(tab) {
  document.getElementById('kalk-konveksi').style.display = tab === 'konveksi' ? 'block' : 'none';
  document.getElementById('kalk-banner').style.display = tab === 'banner' ? 'block' : 'none';
  document.getElementById('tab-konveksi').className = tab === 'konveksi' ? 'btn btn-blue btn-sm' : 'btn btn-ghost btn-sm';
  document.getElementById('tab-banner').className = tab === 'banner' ? 'btn btn-blue btn-sm' : 'btn btn-ghost btn-sm';
}

function loadHPPTemplate(tpl) {
  if (!tpl || !HPP_TEMPLATES[tpl]) return;
  hppRows = HPP_TEMPLATES[tpl].map(r => ({...r}));
  renderHPPTable();
  hitungSimulasi();
  document.getElementById('hpp-template').value = '';
}

function tambahHPPRow() {
  hppRows.push({nama:'', harga:0, qty:1});
  renderHPPTable();
}

function hapusHPPRow(i) {
  hppRows.splice(i,1);
  renderHPPTable();
  hitungSimulasi();
}

function renderHPPTable() {
  var tbody = document.getElementById('hpp-tbody');
  if (!tbody) return;
  var total = 0;
  tbody.innerHTML = hppRows.map(function(r,i){
    var sub = (r.harga||0)*(r.qty||1);
    total += sub;
    return `<tr class="hpp-row">
      <td><input value="${r.nama}" placeholder="Nama komponen..." oninput="hppRows[${i}].nama=this.value"></td>
      <td><input value="${r.harga||''}" type="text" inputmode="numeric" placeholder="0" style="text-align:right" oninput="hppRows[${i}].harga=cleanRibuan(this.value);this.value=formatRibuan(cleanRibuan(this.value));renderHPPTotals()" onfocus="this.select()"></td>
      <td><input value="${r.qty}" type="number" min="0.1" step="0.1" style="text-align:right;width:70px" oninput="hppRows[${i}].qty=parseFloat(this.value)||1;renderHPPTotals()"></td>
      <td style="text-align:right;font-weight:800;font-family:var(--mono);color:var(--blue-d)">${fmtRp(sub)}</td>
      <td style="text-align:center"><button class="btn btn-red btn-xs" onclick="hapusHPPRow(${i})">✕</button></td>
    </tr>`;
  }).join('');
  renderHPPTotals();
}

function renderHPPTotals() {
  var total = hppRows.reduce((s,r) => s+(r.harga||0)*(r.qty||1), 0);
  var el = document.getElementById('hpp-total');
  if(el) el.textContent = fmtRp(total);
  var simModal = document.getElementById('sim-modal');
  if(simModal) simModal.value = formatRibuan(total);
  hitungSimulasi();
}

function hitungSimulasi() {
  var modal = hppRows.reduce((s,r) => s+(r.harga||0)*(r.qty||1), 0);
  var jual = cleanRibuan((document.getElementById('sim-jual')||{}).value||'0');
  var qty = parseInt((document.getElementById('sim-qty')||{}).value)||1;
  var simModal = document.getElementById('sim-modal');
  if(simModal) simModal.value = formatRibuan(modal);

  var totalJual = jual * qty;
  var totalModal = modal * qty;
  var untung = totalJual - totalModal;
  var margin = jual > 0 ? ((untung / totalJual)*100).toFixed(1) : 0;

  var el = document.getElementById('sim-result');
  if (!el) return;
  var warna = untung >= 0 ? 'var(--green)' : 'var(--red)';
  var warnaBg = untung >= 0 ? 'var(--green-l)' : 'var(--red-l)';
  el.innerHTML = [
    {l:'Total Penjualan', v: fmtRp(totalJual), c:'var(--blue-d)'},
    {l:'Total Modal', v: fmtRp(totalModal), c:'var(--amber)'},
    {l:'Keuntungan Bersih', v: (untung>=0?'+':'')+fmtRp(untung), c: warna},
    {l:'Margin (%)', v: margin+'%', c: warna}
  ].map(function(item){
    return `<div class="sim-box" style="border-top:3px solid ${item.c}"><div class="sim-lbl">${item.l}</div><div class="sim-val" style="color:${item.c}">${item.v}</div></div>`;
  }).join('');
}

/* ── Banner Kalkulator ── */
function hitungBanner() {
  var lebar = parseFloat(document.getElementById('bnr-lebar').value)||0;
  var tinggi = parseFloat(document.getElementById('bnr-tinggi').value)||0;
  var harga = cleanRibuan(document.getElementById('bnr-harga').value)||0;
  var qty = parseInt(document.getElementById('bnr-qty').value)||1;
  if (!lebar || !tinggi || !harga) { document.getElementById('bnr-preview').style.display='none'; return; }

  var luasM2 = (lebar/100) * (tinggi/100);
  var totalPcs = luasM2 * harga;
  var totalAll = totalPcs * qty;
  var ukuran = (lebar/100).toFixed(1)+'x'+(tinggi/100).toFixed(1);

  document.getElementById('bnr-ukuran-txt').textContent = ukuran+' m';
  document.getElementById('bnr-luas-txt').textContent = luasM2.toFixed(2)+' m²';
  document.getElementById('bnr-total-pcs').textContent = fmtRp(totalPcs);
  document.getElementById('bnr-total-all').textContent = fmtRp(totalAll);
  document.getElementById('bnr-preview').style.display = 'block';
}

function tambahKeBannerRekap() {
  var lebar = parseFloat(document.getElementById('bnr-lebar').value)||0;
  var tinggi = parseFloat(document.getElementById('bnr-tinggi').value)||0;
  var harga = cleanRibuan(document.getElementById('bnr-harga').value)||0;
  var qty = parseInt(document.getElementById('bnr-qty').value)||1;
  if (!lebar || !tinggi || !harga) { toast('Lengkapi ukuran dan harga dulu!', 2000, 'error'); return; }

  var luasM2 = (lebar/100)*(tinggi/100);
  var totalPcs = luasM2*harga;
  var totalAll = totalPcs*qty;
  var ukuran = (lebar/100).toFixed(1)+'x'+(tinggi/100).toFixed(1);

  bannerRekap.push({ukuran, qty, total: totalAll});
  renderBannerRekap();
  toast('✅ Ditambahkan ke rekap!', 1500, 'success');
}

function hapusBannerRekapRow(i) {
  bannerRekap.splice(i,1);
  renderBannerRekap();
}

function clearBannerRekap() {
  if (!bannerRekap.length) return;
  if (!confirm('Kosongkan semua rekap banner?')) return;
  bannerRekap = [];
  renderBannerRekap();
}

function renderBannerRekap() {
  var tbody = document.getElementById('bnr-rekap-body');
  var tfoot = document.getElementById('bnr-rekap-foot');
  if (!tbody) return;

  if (!bannerRekap.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--tx3);font-size:12px;">Belum ada item. Tambahkan dari form di atas.</td></tr>';
    tfoot.innerHTML = '';
    return;
  }

  var totalQty = 0, totalNominal = 0;
  tbody.innerHTML = bannerRekap.map(function(r,i){
    totalQty += r.qty;
    totalNominal += r.total;
    return `<tr class="bnr-rekap-row">
      <td style="font-weight:700;font-family:var(--mono)">${r.ukuran}</td>
      <td style="text-align:center;font-weight:700">${r.qty}</td>
      <td style="text-align:right;font-weight:800;font-family:var(--mono);color:var(--green-d)">${fmtRp(r.total)}</td>
      <td style="text-align:center"><button class="btn btn-red btn-xs" onclick="hapusBannerRekapRow(${i})">✕</button></td>
    </tr>`;
  }).join('');

  tfoot.innerHTML = `<tr>
    <td style="font-size:13px;color:var(--blue-d)">🧮 TOTAL KESELURUHAN</td>
    <td style="text-align:center;font-size:16px;color:var(--blue-d)">${totalQty}</td>
    <td style="text-align:right;font-size:18px;color:var(--green-d)">${fmtRp(totalNominal)}</td>
    <td></td>
  </tr>`;
}

/* ── Update katalog cards to use glassmorphism class ── */
var _origRenderKatalog = renderKatalog;
renderKatalog = function() {
  _origRenderKatalog();
  // Add glass class to katalog items rendered by JS
  document.querySelectorAll('#katalog-content .card, #katalog-content > div').forEach(function(el){
    if(!el.classList.contains('katalog-item-card')) el.classList.add('katalog-item-card');
  });
};

/* ════════════════════════════════════════════════════════════════
   📦 BACKUP & RESTORE DATA BARANG → GOOGLE SHEETS
   ════════════════════════════════════════════════════════════════ */

// Load saved URL on startup
(function initBarangSheetUrl() {
  var saved = localStorage.getItem('abunawas_barang_sheet_url') || '';
  var el = document.getElementById('barang-sheet-url');
  if (el && saved) el.value = saved;
})();

function getBarangSheetUrl() {
  var el = document.getElementById('barang-sheet-url');
  // Prioritas: field khusus barang → kalau kosong, pakai URL utama (sama-sama 1 GAS)
  var url = (el ? el.value.trim() : '') 
         || localStorage.getItem('abunawas_barang_sheet_url') 
         || localStorage.getItem('abunawas_sheet_url') 
         || '';
  if (!url) {
    setBackupBrgStatus('error', '⚠️ URL Webhook belum diisi! Masukkan URL Google Apps Script di menu <b>Backup Database</b> → field "URL Web App Google Script" atau field khusus di bawah ini.');
    return null;
  }
  localStorage.setItem('abunawas_barang_sheet_url', url);
  // Sync juga ke field tampilan
  if (el && !el.value) el.value = url;
  return url;
}

function setBackupBrgStatus(type, msg) {
  var el = document.getElementById('backup-brg-status');
  if (!el) return;
  var colors = {
    loading: { bg: 'rgba(59,130,246,0.1)', bdr: 'rgba(59,130,246,0.3)', tx: 'var(--blue-d)' },
    success: { bg: 'rgba(16,185,129,0.1)', bdr: 'rgba(16,185,129,0.3)', tx: 'var(--green-d)' },
    error:   { bg: 'rgba(239,68,68,0.1)',  bdr: 'rgba(239,68,68,0.3)',  tx: 'var(--red-d)' }
  };
  var c = colors[type] || colors.loading;
  el.style.cssText = `display:flex; margin-top:14px; padding:12px 16px; border-radius:10px;
    font-size:13px; font-weight:700; align-items:center; gap:10px;
    background:${c.bg}; border:1px solid ${c.bdr}; color:${c.tx};`;
  el.innerHTML = msg;
  el.style.display = 'flex';
}

function clearBackupBrgStatus() {
  var el = document.getElementById('backup-brg-status');
  if (el) el.style.display = 'none';
}

function showBarangPreview(data) {
  var wrap = document.getElementById('backup-brg-preview');
  var countEl = document.getElementById('brg-count');
  var tbody = document.getElementById('brg-preview-body');
  if (!wrap || !tbody) return;
  if (!data || !data.length) { wrap.style.display = 'none'; return; }

  countEl.textContent = data.length;
  tbody.innerHTML = data.map(function(b) {
    return '<tr style="border-bottom:1px solid var(--bdr);">' +
      '<td style="padding:7px 8px;font-family:var(--mono);font-size:11px;color:var(--tx3);">' + (b.kode||'-') + '</td>' +
      '<td style="padding:7px 8px;font-weight:700;">' + (b.nama||'-') + '</td>' +
      '<td style="padding:7px 8px;text-align:right;font-family:var(--mono);color:var(--green-d);">' + fmtRp(b.harga||0) + '</td>' +
      '<td style="padding:7px 8px;color:var(--tx2);">' + (b.kategori||'-') + '</td>' +
      '<td style="padding:7px 8px;color:var(--tx2);">' + (b.satuan||'-') + '</td>' +
    '</tr>';
  }).join('');
  wrap.style.display = 'block';
}

/* ── BACKUP: Kirim BARANG → Google Sheets ── */
async function backupDataBarang() {
  var url = getBarangSheetUrl();
  if (!url) return;

  var btnIco = document.getElementById('btn-backup-brg-ico');
  if (btnIco) btnIco.textContent = '⏳';
  setBackupBrgStatus('loading', '<span style="animation:spin 1s linear infinite;display:inline-block;font-size:16px;">⚙️</span> Sedang mengirim data barang ke Google Sheets...');

  logActivity('EXPORT', 'Backup', { label: 'Backup Data Barang ke Sheets (' + BARANG.length + ' item)' });

  try {
    var payload = {
      action: 'backupBarang',
      data: BARANG,
      meta: {
        toko: TOKO.nama || 'Abunawas',
        timestamp: new Date().toISOString(),
        total: BARANG.length
      }
    };

    var resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS butuh text/plain bukan application/json untuk CORS
      body: JSON.stringify(payload)
    });

    var text = await resp.text();
    var hasil;
    try { hasil = JSON.parse(text); } catch(e) { hasil = { status: resp.ok ? 'ok' : 'error', message: text }; }

    if (resp.ok && hasil.status !== 'error') {
      setBackupBrgStatus('success',
        '✅ Backup berhasil! <b>' + BARANG.length + ' data barang</b> terkirim ke Google Sheets. ' +
        (hasil.message ? '(' + hasil.message + ')' : '')
      );
      showBarangPreview(BARANG);
      toast('✅ Backup Data Barang ke Sheets berhasil!', 3000, 'success');
    } else {
      throw new Error(hasil.message || 'Response tidak valid dari server');
    }
  } catch(err) {
    setBackupBrgStatus('error',
      '❌ Backup gagal! ' + err.message +
      '<br><span style="font-size:11px;font-weight:400;opacity:0.8;">Pastikan URL valid, sudah di-deploy sebagai Web App, dan akses "Anyone".</span>'
    );
    toast('Backup gagal: ' + err.message, 3500, 'error');
  } finally {
    if (btnIco) btnIco.textContent = '☁️';
  }
}

/* ── RESTORE: Ambil BARANG dari Google Sheets ── */
async function restoreDataBarang() {
  var url = getBarangSheetUrl();
  if (!url) return;

  if (!confirm('⚠️ YAKIN RESTORE DATA BARANG?\n\nData barang yang ada sekarang akan DIGANTI dengan data dari Google Sheets.\n\nPastikan data di Sheets sudah benar sebelum melanjutkan.')) return;

  var btnIco = document.getElementById('btn-restore-brg-ico');
  if (btnIco) btnIco.textContent = '⏳';
  setBackupBrgStatus('loading', '<span style="animation:spin 1s linear infinite;display:inline-block;font-size:16px;">⚙️</span> Sedang mengambil data barang dari Google Sheets...');

  try {
    // GET request dengan query param action
    var fetchUrl = url + (url.includes('?') ? '&' : '?') + 'action=restoreBarang&t=' + Date.now();
    var resp = await fetch(fetchUrl, { method: 'GET' });

    if (!resp.ok) throw new Error('HTTP ' + resp.status + ' — ' + resp.statusText);

    var text = await resp.text();
    var hasil;
    try { hasil = JSON.parse(text); } catch(e) { throw new Error('Response bukan JSON valid: ' + text.slice(0,100)); }

    if (!hasil.data || !Array.isArray(hasil.data)) {
      throw new Error('Format data tidak valid. Pastikan GAS mengembalikan { data: [...] }');
    }

    var incoming = hasil.data;
    if (incoming.length === 0) {
      setBackupBrgStatus('error', '⚠️ Data di Sheets kosong atau tidak ditemukan. Backup dulu sebelum restore.');
      if (btnIco) btnIco.textContent = '⬇️';
      return;
    }

    // Merge atau replace
    BARANG = incoming;
    saveData();
    populateFiBrg();

    logActivity('UPDATE', 'Barang', { label: 'Restore Data Barang dari Sheets (' + incoming.length + ' item)' });

    setBackupBrgStatus('success',
      '✅ Restore berhasil! <b>' + incoming.length + ' data barang</b> berhasil dimuat dari Google Sheets.'
    );
    showBarangPreview(BARANG);
    toast('✅ Restore Data Barang dari Sheets berhasil!', 3000, 'success');

    if (document.getElementById('pg-barang').classList.contains('on')) renderBrg();

  } catch(err) {
    setBackupBrgStatus('error',
      '❌ Restore gagal! ' + err.message +
      '<br><span style="font-size:11px;font-weight:400;opacity:0.8;">Cek URL, pastikan GAS sudah punya handler action=restoreBarang.</span>'
    );
    toast('Restore gagal: ' + err.message, 3500, 'error');
  } finally {
    if (btnIco) btnIco.textContent = '⬇️';
  }
}

/* ── Panduan kode GAS ── */
var GAS_CODE = `// ═══════════════════════════════════════════════════
// Google Apps Script — Backup Data Barang Abunawas
// Deploy sebagai Web App: Execute as ME, Access: Anyone
// ═══════════════════════════════════════════════════

var SHEET_NAME = 'DataBarang'; // Nama tab sheet

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'backupBarang') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      sh.clearContents();
      // Header
      sh.appendRow(['Kode','Nama','Harga Jual','Harga Modal','Kategori','Satuan','Stok','Keterangan','Timestamp']);
      // Data
      body.data.forEach(function(b) {
        sh.appendRow([
          b.kode||'', b.nama||'', b.harga||0, b.modal||0,
          b.kategori||'', b.satuan||'', b.stok||0, b.ket||'',
          new Date().toLocaleString('id-ID')
        ]);
      });
      return ContentService
        .createTextOutput(JSON.stringify({ status:'ok', message: body.data.length+' item disimpan', timestamp: new Date().toISOString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status:'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    if (e.parameter.action === 'restoreBarang') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(SHEET_NAME);
      if (!sh) return ContentService
        .createTextOutput(JSON.stringify({ status:'error', message:'Sheet tidak ditemukan' }))
        .setMimeType(ContentService.MimeType.JSON);

      var rows = sh.getDataRange().getValues();
      rows.shift(); // hapus header
      var data = rows.map(function(r) {
        return { kode:r[0], nama:r[1], harga:+r[2]||0, modal:+r[3]||0,
                 kategori:r[4], satuan:r[5], stok:+r[6]||0, ket:r[7] };
      }).filter(function(b){ return b.nama; });
      return ContentService
        .createTextOutput(JSON.stringify({ status:'ok', data: data, total: data.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status:'ok', message:'Abunawas GAS Ready' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status:'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

function showGASGuide() {
  var guide = document.getElementById('gas-guide');
  var codeEl = document.getElementById('gas-code-block');
  if (!guide) return;
  if (guide.style.display === 'none' || !guide.style.display) {
    if (codeEl) codeEl.textContent = GAS_CODE;
    guide.style.display = 'block';
    guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    guide.style.display = 'none';
  }
}

function copyGASCode() {
  navigator.clipboard.writeText(GAS_CODE).then(function() {
    toast('✅ Kode GAS berhasil di-copy! Paste di Google Apps Script.', 3000, 'success');
  }).catch(function() {
    toast('Gagal copy. Silakan select manual dan copy.', 2500, 'error');
  });
}

// Init URL dari localStorage saat backup page dibuka
var _origRenderBackup = typeof renderBackup === 'function' ? renderBackup : null;
function initBackupPage() {
  if (_origRenderBackup) _origRenderBackup();
  // Auto-isi dari URL utama jika field barang kosong
  var mainUrl = localStorage.getItem('abunawas_sheet_url') || '';
  var brgUrl  = localStorage.getItem('abunawas_barang_sheet_url') || mainUrl;
  var el = document.getElementById('barang-sheet-url');
  if (el) el.value = brgUrl;
  if (brgUrl) localStorage.setItem('abunawas_barang_sheet_url', brgUrl);
  clearBackupBrgStatus();
  showBarangPreview(BARANG);
  // Auto-ping GAS untuk cek koneksi
  if (brgUrl) pingGAS(brgUrl);
}

async function pingGAS(url) {
  try {
    var resp = await fetch(url + '?action=ping&t=' + Date.now());
    var data = await resp.json();
    if (data.status === 'ok') {
      setBackupBrgStatus('success',
        '✅ Koneksi GAS aktif! Spreadsheet: <b>' + (data.spreadsheet||'') + '</b> &nbsp;|&nbsp; Tab tersedia: ' +
        (data.sheets||[]).join(', ') +
        ' &nbsp;|&nbsp; <span style="font-weight:400;">' + (data.timestamp||'') + '</span>'
      );
    }
  } catch(e) { /* silent — user belum set URL */ }
}

/* ════════════════════════════════════════════════════════════════════
   🔄 AUTO-ROUTING: Transaksi → Belanja Vendor Otomatis
   ════════════════════════════════════════════════════════════════════ */
function autoRoutingVendor(trxId, cart, tgl) {
  var grouped = {};
  cart.forEach(function(item) {
    // Cari vendor dari master BARANG
    var brg = BARANG.find(function(b){ return b.kode === item.kode; });
    var vendorNama = (brg && brg.vendor) ? brg.vendor : null;
    if (!vendorNama) return; // item tanpa vendor dilewati
    if (!grouped[vendorNama]) grouped[vendorNama] = { items: [], total: 0, modal: 0 };
    grouped[vendorNama].items.push(item);
    grouped[vendorNama].total += item.total;
    grouped[vendorNama].modal += (item.modal || 0) * item.qty;
  });

  var routedCount = 0;
  Object.keys(grouped).forEach(function(vendorNama) {
    var g = grouped[vendorNama];
    var itemStr = g.items.map(function(i){ return i.barang + ' x' + i.qty; }).join(', ');
    var newPeng = {
      id: 'AR-' + trxId + '-' + Date.now(),
      tgl: tgl,
      vendor: vendorNama,
      ket: '[AUTO] Order dari TRX ' + trxId + ' — ' + itemStr,
      total: g.modal || g.total,
      subtotal: g.modal || g.total,
      bayar: 'Hutang', // default: belum bayar ke vendor
      dibayar: 0,
      sisa: g.modal || g.total,
      status: 'Hutang',
      kategori: 'Belanja Vendor / Maklon Cetak',
      autoRouted: true
    };
    PENGELUARAN.unshift(newPeng);
    routedCount++;
  });

  if (routedCount > 0) {
    saveData();
    toast('🔄 ' + routedCount + ' tagihan vendor otomatis dibuat dari transaksi ini!', 3500, 'success');
    logActivity('CREATE', 'Pengeluaran', { label: 'Auto-routing vendor dari TRX ' + trxId + ' (' + routedCount + ' vendor)' });
  }
}

/* ════════════════════════════════════════════════════════════════════
   💯 SKOR FINANSIAL WIDGET DI DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
function renderDashSkor() {
  var wrap = document.getElementById('dash-skor-wrap');
  var el   = document.getElementById('dash-skor-widget');
  if (!wrap || !el || !curUser || curUser.role !== 'boss') { if(wrap) wrap.style.display='none'; return; }
  wrap.style.display = 'block';

  var bulanIni = nowDate().substring(0, 7);
  var trxBulan = TRX.filter(function(t){ return t.tgl && t.tgl.startsWith(bulanIni); });
  var pengBulan = PENGELUARAN.filter(function(p){ return p.tgl && p.tgl.startsWith(bulanIni); });
  var totalMasuk  = trxBulan.reduce(function(s,t){ return s+(t.dibayar||0); }, 0);
  var totalKeluar = pengBulan.reduce(function(s,p){ return s+(p.total||0); }, 0);
  var laba = totalMasuk - totalKeluar;
  var totalPiutang = TRX.filter(function(t){ return t.sisa>0; }).reduce(function(s,t){ return s+t.sisa; }, 0);

  var sRasio = totalMasuk > 0 ? Math.min(100, Math.max(0, Math.round((laba / totalMasuk) * 150))) : 0;
  var sLaba  = laba > 0 ? Math.min(100, Math.round(laba / 500000 * 10)) : 0;
  var sPiutang = totalMasuk > 0 ? Math.max(0, 100 - Math.round((totalPiutang / totalMasuk) * 100)) : 70;
  var skor = Math.round(sRasio * 0.4 + sLaba * 0.3 + sPiutang * 0.3);
  skor = Math.max(0, Math.min(100, skor));

  var warna = skor >= 70 ? '#10B981' : skor >= 40 ? '#F59E0B' : '#EF4444';
  var labelSkor = skor >= 70 ? '✓ SEHAT' : skor >= 40 ? '⚠ WASPADA' : '✕ BAHAYA';
  var saran = skor >= 70
    ? 'Keuangan toko dalam kondisi baik! Pertahankan rasio pengeluaran.'
    : skor >= 40
    ? 'Waspadai pengeluaran vendor. Coba negosiasi harga bahan atau kurangi biaya operasional.'
    : 'Kondisi keuangan kritis! Segera evaluasi pengeluaran besar dan kejar piutang yang tertunggak.';

  var circ = 2 * Math.PI * 54;
  var dash = circ - (skor / 100) * circ;

  el.innerHTML =
    '<div class="card" style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;padding:20px 24px;">' +
      '<div style="position:relative;width:120px;height:120px;flex-shrink:0;">' +
        '<svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg)">' +
          '<circle cx="60" cy="60" r="54" fill="none" stroke="var(--bdr)" stroke-width="10"/>' +
          '<circle cx="60" cy="60" r="54" fill="none" stroke="'+warna+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+dash+'" style="transition:stroke-dashoffset 1.5s ease"/>' +
        '</svg>' +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
          '<div style="font-size:28px;font-weight:900;font-family:var(--mono);color:'+warna+';text-shadow:0 0 8px '+warna+'44;">'+skor+'</div>' +
          '<div style="font-size:9px;font-weight:800;color:'+warna+';letter-spacing:0.5px;">'+labelSkor+'</div>' +
        '</div>' +
      '</div>' +
      '<div style="flex:1;min-width:180px;">' +
        '<div style="font-size:14px;font-weight:900;color:var(--tx);margin-bottom:6px;">Skor Kesehatan Finansial</div>' +
        '<div style="font-size:11px;color:var(--tx2);line-height:1.5;margin-bottom:12px;">'+saran+'</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
          '<div style="background:var(--surf2);border-radius:8px;padding:8px 12px;font-size:11px;"><div style="color:var(--tx3);font-weight:700;">Pemasukan</div><div style="font-family:var(--mono);font-weight:800;color:var(--green);">'+fmtRp(totalMasuk)+'</div></div>' +
          '<div style="background:var(--surf2);border-radius:8px;padding:8px 12px;font-size:11px;"><div style="color:var(--tx3);font-weight:700;">Pengeluaran</div><div style="font-family:var(--mono);font-weight:800;color:var(--red);">'+fmtRp(totalKeluar)+'</div></div>' +
          '<div style="background:var(--surf2);border-radius:8px;padding:8px 12px;font-size:11px;"><div style="color:var(--tx3);font-weight:700;">Laba Bersih</div><div style="font-family:var(--mono);font-weight:800;color:'+(laba>=0?'var(--green)':'var(--red)')+';">'+(laba>=0?'+':'')+fmtRp(laba)+'</div></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Cek alert skor merah → kirim notif Telegram
  if (skor < 40) { checkSkorMerahAlert(skor, laba); }
}

/* ════════════════════════════════════════════════════════════════════
   🔔 NOTIFIKASI TELEGRAM / WA
   ════════════════════════════════════════════════════════════════════ */
function getNotifConfig() {
  return {
    tgToken:  localStorage.getItem('abunawas_tg_token') || '',
    tgChatId: localStorage.getItem('abunawas_tg_chatid') || '',
    waUrl:    localStorage.getItem('abunawas_wa_webhook') || '',
    rekapHarian:      localStorage.getItem('abunawas_notif_rekap') === 'true',
    pengeluaranBesar: localStorage.getItem('abunawas_notif_peng') === 'true',
    skorMerah:        localStorage.getItem('abunawas_notif_skor') === 'true'
  };
}

async function kirimTelegram(pesan) {
  var cfg = getNotifConfig();
  if (!cfg.tgToken || !cfg.tgChatId) return false;
  try {
    var resp = await fetch('https://api.telegram.org/bot' + cfg.tgToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.tgChatId, text: pesan, parse_mode: 'HTML' })
    });
    var data = await resp.json();
    return data.ok;
  } catch(e) { return false; }
}

async function testNotifTelegram() {
  var token  = document.getElementById('set-tg-token').value.trim();
  var chatId = document.getElementById('set-tg-chatid').value.trim();
  if (!token || !chatId) { toast('Isi Bot Token dan Chat ID dulu!', 2500, 'error'); return; }
  localStorage.setItem('abunawas_tg_token', token);
  localStorage.setItem('abunawas_tg_chatid', chatId);
  localStorage.setItem('abunawas_wa_webhook', document.getElementById('set-wa-webhook').value.trim());
  localStorage.setItem('abunawas_notif_rekap', document.getElementById('notif-rekap-harian').checked);
  localStorage.setItem('abunawas_notif_peng',  document.getElementById('notif-pengeluaran-besar').checked);
  localStorage.setItem('abunawas_notif_skor',  document.getElementById('notif-skor-merah').checked);

  toast('⏳ Mengirim test notifikasi...', 2000);
  var toko = TOKO.nama || 'Abunawas';
  var ok = await kirimTelegram('<b>🧪 Test Notifikasi — ' + toko + '</b>\n\nKonfigurasi notifikasi berhasil! Sistem siap mengirim alert otomatis.');
  if (ok) toast('✅ Notifikasi Telegram berhasil dikirim!', 3000, 'success');
  else    toast('❌ Gagal kirim. Cek token/chat ID kamu.', 3000, 'error');
}

async function kirimRekapHarian() {
  var cfg = getNotifConfig();
  if (!cfg.rekapHarian || !cfg.tgToken) return;
  var today = nowDate();
  var trxHari = TRX.filter(function(t){ return t.tgl === today; });
  var omzet   = trxHari.reduce(function(s,t){ return s+t.total; }, 0);
  var modal   = PENGELUARAN.filter(function(p){ return p.tgl===today; }).reduce(function(s,p){ return s+(p.total||0); }, 0);
  var laba    = omzet - modal;
  var piutang = trxHari.filter(function(t){ return t.sisa>0; }).reduce(function(s,t){ return s+t.sisa; }, 0);

  var pesan = '<b>📊 Rekap Harian ' + (TOKO.nama||'Abunawas') + ' — ' + today + '</b>\n\n' +
    '💰 Omzet: <b>Rp ' + fmt(omzet) + '</b>\n' +
    '🏭 Modal: Rp ' + fmt(modal) + '\n' +
    '✅ Laba: <b>Rp ' + fmt(laba) + '</b>\n' +
    '⚠️ Piutang: Rp ' + fmt(piutang) + '\n' +
    '📝 Total Transaksi: ' + trxHari.length + ' nota';
  await kirimTelegram(pesan);
}

async function checkPengeluaranBesarAlert(nominal, vendor, ket) {
  var cfg = getNotifConfig();
  if (!cfg.pengeluaranBesar || !cfg.tgToken || nominal < 500000) return;
  var pesan = '<b>⚠️ Alert Pengeluaran Besar — ' + (TOKO.nama||'Abunawas') + '</b>\n\n' +
    '💸 Nominal: <b>Rp ' + fmt(nominal) + '</b>\n' +
    '🏪 Vendor: ' + (vendor||'—') + '\n' +
    '📝 Keterangan: ' + (ket||'—') + '\n' +
    '📅 Tanggal: ' + nowDate();
  await kirimTelegram(pesan);
}

async function checkSkorMerahAlert(skor, laba) {
  var cfg = getNotifConfig();
  if (!cfg.skorMerah || !cfg.tgToken) return;
  var pesan = '<b>🚨 ALERT: Skor Finansial Merah — ' + (TOKO.nama||'Abunawas') + '</b>\n\n' +
    '💯 Skor: <b>' + skor + '/100</b> — BAHAYA!\n' +
    '📉 Laba bulan ini: Rp ' + fmt(laba) + '\n' +
    '⚡ Segera evaluasi pengeluaran dan kejar piutang!';
  await kirimTelegram(pesan);
}

/* ════════════════════════════════════════════════════════════════════
   🤖 FLOATING AI CHATBOT
   ════════════════════════════════════════════════════════════════════ */
var floatChatOpen = false;
var floatChatHistory = [];

function toggleFloatChat() {
  floatChatOpen = !floatChatOpen;
  var box = document.getElementById('float-chat-box');
  if (box) box.style.display = floatChatOpen ? 'flex' : 'none';
  var badge = document.getElementById('float-chat-badge');
  if (badge) badge.style.display = 'none';
}

function floatQuickAsk(q) {
  var inp = document.getElementById('float-chat-input');
  if (inp) inp.value = q;
  kirimFloatChat();
}

async function kirimFloatChat() {
  var inp = document.getElementById('float-chat-input');
  var pesan = (inp ? inp.value.trim() : '');
  if (!pesan) return;
  if (inp) inp.value = '';

  addFloatBubble('user', pesan);

  // Cek apakah perintah auto-fill form belanja
  var isCommand = await cekParsePerintah(pesan);
  if (isCommand) return;

  if (!apiKey) { addFloatBubble('bot', '⚠️ API Key Gemini belum diisi di Pengaturan Toko.'); return; }

  var typing = addFloatBubble('bot', '...', true);

  var bulanIni = nowDate().substring(0,7);
  var totalMasuk  = TRX.filter(function(t){ return t.tgl&&t.tgl.startsWith(bulanIni); }).reduce(function(s,t){ return s+(t.dibayar||0); }, 0);
  var totalKeluar = PENGELUARAN.filter(function(p){ return p.tgl&&p.tgl.startsWith(bulanIni); }).reduce(function(s,p){ return s+(p.total||0); }, 0);
  var piutangList = TRX.filter(function(t){ return t.sisa>0; }).slice(0,5).map(function(t){ return t.pelanggan+' Rp'+fmt(t.sisa); }).join(', ');

  var ctx = 'Kamu asisten AI percetakan "' + (TOKO.nama||'Abunawas') + '". Jawab singkat & santai dalam Bahasa Indonesia.\n' +
    'Data bulan ini: Pemasukan Rp ' + fmt(totalMasuk) + ', Pengeluaran Rp ' + fmt(totalKeluar) + ', Piutang: ' + (piutangList||'tidak ada') + '.\n' +
    'Fokus: konsultasi percetakan, saran HPP, optimasi biaya. Jika user perintah catat belanja (contoh: "catat belanja X di vendor Y Zmengambil"), balas dengan JSON {"action":"catat","vendor":"...","ket":"...","nominal":0}';

  try {
    var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ parts:[{ text: ctx + '\n\nPertanyaan: ' + pesan }] }] })
    });
    var data = await resp.json();
    var jawaban = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak bisa menjawab saat ini.';
    typing.remove();

    // Cek apakah jawaban berisi JSON perintah
    try {
      var jsonMatch = jawaban.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (jsonMatch) {
        var cmd = JSON.parse(jsonMatch[0]);
        if (cmd.action === 'catat') {
          autoFillFormBelanja(cmd.vendor, cmd.ket, cmd.nominal);
          addFloatBubble('bot', '✅ Form belanja sudah diisi otomatis! Vendor: <b>' + cmd.vendor + '</b>, Total: Rp ' + fmt(cmd.nominal) + '. Silakan cek & simpan di halaman Belanja Vendor.');
          return;
        }
      }
    } catch(e2) {}

    addFloatBubble('bot', jawaban);
    floatChatHistory.push({role:'user',content:pesan},{role:'assistant',content:jawaban});
  } catch(e) {
    if(typing) typing.remove();
    addFloatBubble('bot', '⚠️ Gagal terhubung ke AI. Cek koneksi internet.');
  }
}

async function cekParsePerintah(teks) {
  // Deteksi pola: "catat belanja X di vendor Y Zribu"
  var pola = /catat\s+belanja\s+(.+?)\s+di\s+(?:vendor\s+)?(\w+)\s+([\d.,]+)\s*(?:ribu|rb|k|juta)?/i;
  var m = teks.match(pola);
  if (m) {
    var ket    = m[1].trim();
    var vendor = m[2].trim();
    var nominal= parseFloat(m[3].replace(',','.')) * (teks.toLowerCase().includes('juta')?1000000:teks.toLowerCase().match(/ribu|rb|k/)?1000:1);
    autoFillFormBelanja(vendor, ket, nominal);
    addFloatBubble('bot', '✅ Form belanja diisi otomatis! Vendor: <b>' + vendor + '</b>, Barang: <b>' + ket + '</b>, Total: <b>Rp ' + fmt(nominal) + '</b>. Silakan buka menu Belanja Vendor untuk simpan.');
    showPage('pengeluaran');
    return true;
  }
  return false;
}

function autoFillFormBelanja(vendor, ket, nominal) {
  // Isi field form pengeluaran
  var elVnd = document.getElementById('fi-vnd');
  var elNama = document.getElementById('mv-nama');
  var elTotal = document.getElementById('mv-subtotal');
  var elKet = document.getElementById('mv-ket');
  if (elVnd) elVnd.value = vendor;
  if (elNama) elNama.value = ket;
  if (elTotal) elTotal.value = formatRibuan(nominal);
  if (elKet) elKet.value = ket;
  showPage('pengeluaran');
}

function addFloatBubble(tipe, teks, isTyping) {
  var container = document.getElementById('float-chat-msgs');
  if (!container) return null;
  var div = document.createElement('div');
  div.className = 'ai-bubble ai-bubble-' + tipe + (isTyping?' ai-bubble-typing':'');
  var msgStyle = 'font-size:12px;line-height:1.5;';
  if (tipe === 'bot') {
    div.innerHTML = '<div class="ai-bubble-ava" style="width:28px;height:28px;font-size:13px;">🤖</div><div class="ai-bubble-msg" style="'+msgStyle+'">' + (isTyping?'<span style="opacity:0.5">mengetik...</span>':teks.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')) + '</div>';
  } else {
    div.innerHTML = '<div class="ai-bubble-msg" style="'+msgStyle+'">'+teks+'</div><div class="ai-bubble-ava" style="width:28px;height:28px;font-size:13px;background:linear-gradient(135deg,#3B82F6,#2563EB);">👤</div>';
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

/* ════════════════════════════════════════════════════════════════════
   ⚙️ INIT — Hook ke renderDash & renderSetting & simpanSetting
   ════════════════════════════════════════════════════════════════════ */

// Patch renderDash untuk tambah skor widget
var _origRenderDash = renderDash;
renderDash = function() {
  _origRenderDash();
  renderDashSkor();
};

// Patch renderSetting untuk tampilkan webhook (Boss only) & load nilai
var _origRenderSetting = renderSetting;
renderSetting = function() {
  _origRenderSetting();
  var wrap = document.getElementById('setting-webhook-wrap');
  if (wrap) wrap.style.display = (curUser && curUser.role === 'boss') ? 'block' : 'none';
  // Load saved values
  var tgT = document.getElementById('set-tg-token');   if(tgT) tgT.value = localStorage.getItem('abunawas_tg_token')||'';
  var tgC = document.getElementById('set-tg-chatid');  if(tgC) tgC.value = localStorage.getItem('abunawas_tg_chatid')||'';
  var waW = document.getElementById('set-wa-webhook'); if(waW) waW.value = localStorage.getItem('abunawas_wa_webhook')||'';
  var nR = document.getElementById('notif-rekap-harian');     if(nR) nR.checked = localStorage.getItem('abunawas_notif_rekap')==='true';
  var nP = document.getElementById('notif-pengeluaran-besar');if(nP) nP.checked = localStorage.getItem('abunawas_notif_peng')==='true';
  var nS = document.getElementById('notif-skor-merah');       if(nS) nS.checked = localStorage.getItem('abunawas_notif_skor')==='true';
};

// Patch simpanSetting untuk save webhook config
var _origSimpanSetting = simpanSetting;
simpanSetting = function() {
  _origSimpanSetting();
  var tgT = document.getElementById('set-tg-token');   if(tgT) localStorage.setItem('abunawas_tg_token',tgT.value.trim());
  var tgC = document.getElementById('set-tg-chatid');  if(tgC) localStorage.setItem('abunawas_tg_chatid',tgC.value.trim());
  var waW = document.getElementById('set-wa-webhook'); if(waW) localStorage.setItem('abunawas_wa_webhook',waW.value.trim());
  var nR = document.getElementById('notif-rekap-harian');     if(nR) localStorage.setItem('abunawas_notif_rekap',nR.checked);
  var nP = document.getElementById('notif-pengeluaran-besar');if(nP) localStorage.setItem('abunawas_notif_peng',nP.checked);
  var nS = document.getElementById('notif-skor-merah');       if(nS) localStorage.setItem('abunawas_notif_skor',nS.checked);
};

// Patch simpanPengeluaranCart untuk auto alert pengeluaran besar
var _origSimpanPengCart = typeof simpanPengeluaranCart === 'function' ? simpanPengeluaranCart : null;
if(_origSimpanPengCart) {
  simpanPengeluaranCart = function() {
    _origSimpanPengCart.apply(this, arguments);
    var total = cleanRibuan((document.getElementById('mv-subtotal')||{}).value||'0');
    var vendor = (document.getElementById('fi-vnd')||{}).value||'';
    var ket = (document.getElementById('mv-nama')||{}).value||'';
    if(total >= 500000) checkPengeluaranBesarAlert(total, vendor, ket);
  };
}

// Show floating chatbot setelah login (Boss/Admin only)
var _origBuildSidebar = buildSidebar;
buildSidebar = function(role) {
  _origBuildSidebar(role);
  var btn = document.getElementById('float-chat-btn');
  if (btn) btn.style.display = (role === 'boss' || role === 'admin') ? 'flex' : 'none';
};

// Rekap harian — cek setiap jam berapa kali logout
// logout rekap sudah di-merge ke patch _origLogout di atas

// Profit preview real-time di form barang
function hitungProfitPreview() {
  var modal = cleanRibuan((document.getElementById('mb-modal')||{}).value||'0');
  var jual  = cleanRibuan((document.getElementById('mb-harga-jual')||{}).value||'0');
  var el = document.getElementById('mb-profit-preview');
  if (!el) return;
  if (!modal && !jual) { el.style.display='none'; return; }
  var profit = jual - modal;
  var margin = jual > 0 ? Math.round((profit/jual)*100) : 0;
  var warna  = profit >= 0 ? 'var(--green-d)' : 'var(--red-d)';
  el.style.display = 'block';
  el.innerHTML = 'Estimasi profit: <span style="color:'+warna+';font-size:14px;">' +
    (profit>=0?'+':'') + fmtRp(profit) + '</span> &nbsp;|&nbsp; Margin: <span style="color:'+warna+';">' + margin + '%</span>';
}

// Vendor inline quick-add
function openModalVendorInline() {
  var nama = document.getElementById('mb-vendor') ? document.getElementById('mb-vendor').value.trim() : '';
  var input = prompt('Nama vendor baru (kosongkan untuk batal):',nama||'');
  if (!input) return;
  var wa = prompt('No WhatsApp vendor '+input+' (opsional):','');
  if (!VENDORS.find(function(v){ return v.nama.toLowerCase()===input.toLowerCase(); })) {
    VENDORS.push({nama:input, kontak:wa||''});
    saveData();
    renderVendor();
    populateFiVnd();
    // Update datalist mb-vendor-list
    var dl = document.getElementById('mb-vendor-list');
    if(dl) dl.innerHTML = VENDORS.map(function(v){ return '<option value="'+v.nama+'">'; }).join('');
    toast('✅ Vendor "'+input+'" ditambahkan!', 2500, 'success');
  }
  if(document.getElementById('mb-vendor')) document.getElementById('mb-vendor').value = input;
}

// Init mb-vendor-list on login (merged with existing login patch above)
var _origLoginVendor = login;
login = function() {
  _origLoginVendor();
  setTimeout(function(){
    var dl = document.getElementById('mb-vendor-list');
    if(dl) dl.innerHTML = VENDORS.map(function(v){ return '<option value="'+v.nama+'">'; }).join('');
  }, 300);
};

/* ═══════════════════════════════════════════════════════════
   🔧 MISSING FUNCTIONS FIX — fungsi yang dipanggil HTML
   ═══════════════════════════════════════════════════════════ */

// ── Floating chatbot (fab = floating action button) ──
var _fabChatOpen = false;

function toggleFloatingChat() {
  _fabChatOpen = !_fabChatOpen;
  var panel = document.getElementById('fab-chat-panel');
  if (panel) panel.style.display = _fabChatOpen ? 'flex' : 'none';
}

function fabQuickAsk(q) {
  var inp = document.getElementById('fab-chat-input');
  if (inp) inp.value = q;
  kirimFabChat();
}

async function kirimFabChat() {
  var inp = document.getElementById('fab-chat-input');
  if (!inp) return;
  var pesan = inp.value.trim();
  if (!pesan) return;
  inp.value = '';

  var msgs = document.getElementById('fab-chat-msgs');
  if (!msgs) return;

  // Tambah bubble user
  var userDiv = document.createElement('div');
  userDiv.className = 'ai-bubble ai-bubble-user';
  userDiv.innerHTML = '<div class="ai-bubble-msg" style="font-size:12px;">'+pesan+'</div><div class="ai-bubble-ava" style="width:28px;height:28px;font-size:12px;background:linear-gradient(135deg,#3B82F6,#2563EB);">👤</div>';
  msgs.appendChild(userDiv);

  // Cek perintah auto-fill
  var handled = await cekParsePerintah(pesan);
  if (handled) return;

  if (!apiKey) {
    var nokey = document.createElement('div');
    nokey.className = 'ai-bubble ai-bubble-bot';
    nokey.innerHTML = '<div class="ai-bubble-ava" style="width:28px;height:28px;font-size:13px;">🤖</div><div class="ai-bubble-msg" style="font-size:12px;">⚠️ API Key Gemini belum diisi di Pengaturan Toko.</div>';
    msgs.appendChild(nokey);
    msgs.scrollTop = msgs.scrollHeight;
    return;
  }

  // Typing indicator
  var typingDiv = document.createElement('div');
  typingDiv.className = 'ai-bubble ai-bubble-bot';
  typingDiv.innerHTML = '<div class="ai-bubble-ava" style="width:28px;height:28px;font-size:13px;">🤖</div><div class="ai-bubble-msg" style="font-size:12px;opacity:0.5;">mengetik...</div>';
  msgs.appendChild(typingDiv);
  msgs.scrollTop = msgs.scrollHeight;

  var bulanIni = nowDate().substring(0,7);
  var totalMasuk  = TRX.filter(function(t){return t.tgl&&t.tgl.startsWith(bulanIni);}).reduce(function(s,t){return s+(t.dibayar||0);},0);
  var totalKeluar = PENGELUARAN.filter(function(p){return p.tgl&&p.tgl.startsWith(bulanIni);}).reduce(function(s,p){return s+(p.total||0);},0);
  var piutangList = TRX.filter(function(t){return t.sisa>0;}).slice(0,5).map(function(t){return t.pelanggan+' Rp'+fmt(t.sisa);}).join(', ');

  var ctx = 'Kamu asisten AI percetakan "' + (TOKO.nama||'Abunawas') + '". Jawab singkat & santai dalam Bahasa Indonesia.\n' +
    'Data bulan ini: Pemasukan Rp ' + fmt(totalMasuk) + ', Pengeluaran Rp ' + fmt(totalKeluar) + ', Piutang: ' + (piutangList||'tidak ada') + '.';

  try {
    var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='+apiKey, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({contents:[{parts:[{text: ctx+'\n\nPertanyaan: '+pesan}]}]})
    });
    var data = await resp.json();
    var jawaban = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak bisa menjawab saat ini.';
    typingDiv.querySelector('.ai-bubble-msg').innerHTML = jawaban.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>');
  } catch(e) {
    typingDiv.querySelector('.ai-bubble-msg').textContent = '⚠️ Gagal terhubung ke AI. Cek koneksi.';
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Custom Template Konveksi ──
var CUSTOM_TEMPLATES = JSON.parse(localStorage.getItem('abunawas_custom_tpl') || '[]');

function renderCustomTemplateList() {
  var el = document.getElementById('custom-tpl-list');
  if (!el) return;
  if (!CUSTOM_TEMPLATES.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:10px;">Belum ada template kustom.</div>';
    return;
  }
  el.innerHTML = CUSTOM_TEMPLATES.map(function(t, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:8px 12px;background:var(--surf2);border-radius:8px;border:1px solid var(--bdr);">' +
      '<input value="'+t.nama+'" style="flex:1;border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;font-size:12px;background:var(--surf);color:var(--tx);" oninput="CUSTOM_TEMPLATES['+i+'].nama=this.value;saveCustomTemplates();">' +
      '<button class="btn btn-red btn-xs" onclick="hapusCustomTemplate('+i+')">✕</button>' +
    '</div>';
  }).join('');
  // Sync ke dropdown kalkulator
  syncTemplateDropdown();
}

function tambahCustomTemplate() {
  var nama = prompt('Nama template baru:');
  if (!nama || !nama.trim()) return;
  CUSTOM_TEMPLATES.push({ nama: nama.trim(), rows: [] });
  saveCustomTemplates();
  renderCustomTemplateList();
  toast('✅ Template "'+nama.trim()+'" ditambahkan!', 2000, 'success');
}

function hapusCustomTemplate(i) {
  if (!confirm('Hapus template "'+CUSTOM_TEMPLATES[i].nama+'"?')) return;
  CUSTOM_TEMPLATES.splice(i, 1);
  saveCustomTemplates();
  renderCustomTemplateList();
}

function saveCustomTemplates() {
  localStorage.setItem('abunawas_custom_tpl', JSON.stringify(CUSTOM_TEMPLATES));
  syncTemplateDropdown();
}

function syncTemplateDropdown() {
  var sel = document.getElementById('hpp-template');
  if (!sel) return;
  // Hapus opsi kustom lama
  var opts = sel.querySelectorAll('option.custom-tpl');
  opts.forEach(function(o){ o.remove(); });
  // Tambah opsi kustom baru
  CUSTOM_TEMPLATES.forEach(function(t, i) {
    var o = document.createElement('option');
    o.value = 'custom_' + i;
    o.textContent = t.nama;
    o.className = 'custom-tpl';
    sel.appendChild(o);
  });
}

// ── Show chatbot button setelah login ──
var _origBuildSidebarFix = buildSidebar;
buildSidebar = function(role) {
  _origBuildSidebarFix(role);
  var btn = document.getElementById('fab-chat-btn');
  if (btn) {
    btn.style.display = (role === 'boss' || role === 'admin') ? 'flex' : 'none';
  }
  // Render custom template list di setting jika ada
  renderCustomTemplateList();
  syncTemplateDropdown();
};

// ── Patch renderSetting untuk load custom templates ──
var _origRenderSettingFix = renderSetting;
renderSetting = function() {
  _origRenderSettingFix();
  renderCustomTemplateList();
};


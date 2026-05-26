// ═══════════════════════════════════════════
// login.js — Script Login Abunawas Kasir
// ═══════════════════════════════════════════

'use strict';

// ── Akun Demo (Fallback jika tidak ada backend PHP) ──
const DEMO_USERS = [
  { username: 'boss',  password: '1234', role: 'boss',  name: 'Boss Owner',  avatar: 'BO' },
  { username: 'admin', password: '1234', role: 'admin', name: 'Admin Toko',  avatar: 'AD' },
  { username: 'kasir', password: '1234', role: 'kasir', name: 'Kasir Toko',  avatar: 'KS' },
];

// ── Flag: gunakan backend PHP atau mode demo ──
const USE_PHP_BACKEND = false; // ubah ke true jika server PHP tersedia

// ───────────────────────────────────────────
// DOM Ready
// ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Cek session aktif → redirect ke dashboard
  const session = getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Setup form login
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) btnLogin.addEventListener('click', doLogin);

  const inputPass = document.getElementById('inp-p');
  if (inputPass) inputPass.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  // Setup PWA install
  initPWAInstall();

  // Bersihkan pesan error
  clearError();
});

// ───────────────────────────────────────────
// Fungsi Login Utama
// ───────────────────────────────────────────
async function login() {
  await doLogin();
}

async function doLogin() {
  const username = (document.getElementById('inp-u')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('inp-p')?.value || '').trim();

  clearError();

  if (!username || !password) {
    showError('Username dan password wajib diisi.');
    return;
  }

  setBtnLoading(true);

  try {
    if (USE_PHP_BACKEND) {
      await loginViaAPI(username, password);
    } else {
      loginDemo(username, password);
    }
  } catch (err) {
    showError('Terjadi kesalahan. Coba lagi.');
    console.error('[Login Error]', err);
  } finally {
    setBtnLoading(false);
  }
}

// ── Login via PHP API ──
async function loginViaAPI(username, password) {
  const res = await fetch('login_api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();

  if (data.success) {
    saveSession({
      username: data.user.username,
      name:     data.user.name,
      role:     data.user.role,
      avatar:   data.user.avatar || data.user.username.substring(0, 2).toUpperCase(),
      loginAt:  Date.now(),
    });
    window.location.href = 'dashboard.html';
  } else {
    showError(data.message || 'Username atau password salah.');
  }
}

// ── Login Demo (LocalStorage) ──
function loginDemo(username, password) {
  // Cek user dari localStorage (akun yang dibuat di dalam app)
  const dbUsers = getStoredUsers();
  let found = dbUsers.find(u => u.username.toLowerCase() === username && u.password === password);

  // Fallback ke akun demo bawaan
  if (!found) {
    found = DEMO_USERS.find(u => u.username === username && u.password === password);
  }

  if (!found) {
    showError('Username atau password salah.');
    return;
  }

  saveSession({
    username: found.username,
    name:     found.name,
    role:     found.role,
    avatar:   found.avatar || found.username.substring(0, 2).toUpperCase(),
    loginAt:  Date.now(),
  });

  // Simpan audit log login
  appendAuditLog({
    aksi:   'LOGIN',
    modul:  'Auth',
    detail: `Login berhasil sebagai ${found.role}`,
    user:   found.name,
  });

  window.location.href = 'dashboard.html';
}

// ───────────────────────────────────────────
// Quick Pick Role (tombol demo)
// ───────────────────────────────────────────
function pickRole(username, password, el) {
  // Visual: tandai card yang dipilih
  document.querySelectorAll('.rc').forEach(c => c.classList.remove('sel'));
  if (el) el.classList.add('sel');

  // Isi form
  const u = document.getElementById('inp-u');
  const p = document.getElementById('inp-p');
  if (u) u.value = username;
  if (p) p.value = password;

  clearError();
}

// ───────────────────────────────────────────
// Session Helpers
// ───────────────────────────────────────────
function saveSession(data) {
  localStorage.setItem('kasir_session', JSON.stringify(data));
}

function getSession() {
  try {
    const raw = localStorage.getItem('kasir_session');
    if (!raw) return null;
    const s = JSON.parse(raw);
    // Expired setelah 12 jam
    if (Date.now() - s.loginAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('kasir_session');
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('abunawas_users') || '[]');
  } catch {
    return [];
  }
}

// ───────────────────────────────────────────
// Audit Log
// ───────────────────────────────────────────
function appendAuditLog(entry) {
  try {
    const logs = JSON.parse(localStorage.getItem('abunawas_audit') || '[]');
    logs.unshift({
      id:    Date.now(),
      waktu: new Date().toISOString(),
      ...entry,
    });
    // Simpan maksimal 500 log
    localStorage.setItem('abunawas_audit', JSON.stringify(logs.slice(0, 500)));
  } catch { /* silent */ }
}

// ───────────────────────────────────────────
// UI Helpers
// ───────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById('lerr');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  const el = document.getElementById('lerr');
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}

function setBtnLoading(loading) {
  const btn = document.querySelector('.btn-login-submit');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Memverifikasi...' : 'Masuk ke Sistem →';
}

// ───────────────────────────────────────────
// Katalog Publik
// ───────────────────────────────────────────
function showKatalog() {
  document.getElementById('pg-login').style.display  = 'none';
  document.getElementById('pg-katalog').style.display = 'block';
  renderKatalog();
}

function closeKatalog() {
  document.getElementById('pg-katalog').style.display = 'none';
  document.getElementById('pg-login').style.display   = 'block';
}

function renderKatalog() {
  const container = document.getElementById('katalog-content');
  if (!container) return;

  try {
    const barang = JSON.parse(localStorage.getItem('abunawas_barang') || '[]');
    if (!barang.length) {
      container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--tx2);">Katalog belum tersedia. Silakan hubungi toko.</div>';
      return;
    }

    // Kelompokkan per kategori
    const groups = {};
    barang.forEach(b => {
      const kat = b.kategori || 'Umum';
      if (!groups[kat]) groups[kat] = [];
      groups[kat].push(b);
    });

    let html = '';
    for (const [kat, items] of Object.entries(groups)) {
      html += `<div style="margin-bottom:32px;">
        <div style="font-size:18px;font-weight:900;color:var(--tx);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--bdr);">📦 ${kat}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
      items.forEach(b => {
        html += `<div style="background:var(--surf);border:1px solid var(--bdr);border-radius:12px;padding:16px;box-shadow:var(--sh);">
          <div style="font-size:14px;font-weight:800;color:var(--tx);margin-bottom:6px;">${escHtml(b.nama)}</div>
          <div style="font-size:12px;color:var(--tx2);margin-bottom:8px;">${escHtml(b.satuan || 'pcs')}</div>
          <div style="font-size:18px;font-weight:900;color:var(--blue);">${fmtRp(b.harga1 || b.harga || 0)}</div>
        </div>`;
      });
      html += `</div></div>`;
    }
    container.innerHTML = html;
  } catch {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--tx2);">Gagal memuat katalog.</div>';
  }
}

// ───────────────────────────────────────────
// PWA Install
// ───────────────────────────────────────────
let deferredPrompt = null;

function initPWAInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-install');
    if (btn) btn.style.display = 'block';
  });
}

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
    const btn = document.getElementById('btn-install');
    if (btn) btn.style.display = 'none';
  });
}

// ───────────────────────────────────────────
// Format Helpers
// ───────────────────────────────────────────
function fmtRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

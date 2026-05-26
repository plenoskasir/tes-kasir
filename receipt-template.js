/**
 * receipt-template.js
 * ─────────────────────────────────────────────────────────────────
 * Pure template builder — ZERO side effects.
 * Only returns HTML strings. Never reads DOM.
 * Depends on: receipt-utils.js (ReceiptUtils)
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

const ReceiptTemplate = (() => {

  const U = ReceiptUtils;

  // ─── CONFIG DEFAULTS ─────────────────────────────────────────────
  const DEFAULTS = {
    tokoNama    : 'ABUNAWAS',
    tokoSub     : 'Percetakan & Konveksi',
    tokoTagline : 'Melayani Digital Printing',
    tokoAlamat  : '',
    tokoPhone   : '',
    footerNote1 : 'Hasil warna cetakan tidak bisa 100% sama dengan layar.',
    footerNote2 : 'Barang tidak diambil lebih dari 7 hari dianggap hilang.',
    footerThanks: 'Terima kasih telah mempercayakan pesanan Anda kepada kami! 🙏',
  };

  // ─── SECTION: HEADER ─────────────────────────────────────────────
  const buildHeader = (toko = {}, logoSrc = '') => {
    const nama     = U.esc(toko.nama     || DEFAULTS.tokoNama);
    const sub      = U.esc(toko.sub      || DEFAULTS.tokoSub);
    const tagline  = U.esc(toko.tagline  || DEFAULTS.tokoTagline);
    const alamat   = U.esc(toko.alamat   || DEFAULTS.tokoAlamat);
    const phone    = U.esc(toko.phone    || DEFAULTS.tokoPhone);

    const logoHtml = logoSrc
      ? `<img src="${logoSrc}" class="rcpt-logo" alt="${nama}" onerror="this.style.display='none'">`
      : '';

    const alamatHtml = alamat
      ? `<p class="rcpt-hdr-alamat">${alamat}${phone ? ' · ' + phone : ''}</p>`
      : '';

    return `
      <header class="rcpt-header">
        <div class="rcpt-hdr-overlay" aria-hidden="true"></div>
        ${logoHtml}
        <h1 class="rcpt-hdr-nama">${nama}</h1>
        <p class="rcpt-hdr-sub">${sub}</p>
        <p class="rcpt-hdr-tagline">${tagline}</p>
        ${alamatHtml}
      </header>`;
  };

  // ─── SECTION: STAMP ──────────────────────────────────────────────
  const buildStamp = (trx) => {
    const status = U.getPaymentStatus(trx);
    return `
      <div class="rcpt-stamp" style="
        color: ${status.borderColor};
        border-color: ${status.borderColor};
        opacity: 0.12;
      " aria-hidden="true">${status.label}</div>`;
  };

  // ─── SECTION: DOC TITLE ──────────────────────────────────────────
  const buildDocTitle = (trx) => {
    const title = trx.sisa <= 0
      ? 'BUKTI LUNAS / INVOICE'
      : 'INVOICE / TAGIHAN PESANAN';
    const queueHtml = trx.no_cetak
      ? `<div class="rcpt-queue">Antrean / Cetak: <strong>#${U.esc(trx.no_cetak)}</strong></div>`
      : '';

    return `
      <div class="rcpt-doc-title">${U.esc(title)}</div>
      ${queueHtml}`;
  };

  // ─── SECTION: META INFO ──────────────────────────────────────────
  const buildMeta = (trx) => {
    const rows = [
      { label: 'ID Nota',    value: `<span class="rcpt-mono rcpt-muted">${U.esc(trx.id)}</span>` },
      { label: 'Tanggal',    value: U.formatDate(trx.tgl) },
      { label: 'Pelanggan',  value: U.esc(trx.pelanggan) +
        (trx.wa ? `<br><span class="rcpt-muted rcpt-mono" style="font-size:10px">${U.esc(trx.wa)}</span>` : '')
      },
      trx.alamat ? { label: 'Alamat', value: `<span class="rcpt-muted" style="font-size:11px">${U.esc(trx.alamat)}</span>` } : null,
      { label: 'Kasir',      value: U.esc(trx.kasir || '-') },
    ].filter(Boolean);

    const html = rows.map(r => `
      <div class="rcpt-row">
        <span class="rcpt-lbl">${r.label}</span>
        <span class="rcpt-val">${r.value}</span>
      </div>`).join('');

    return `<section class="rcpt-meta">${html}</section>`;
  };

  // ─── SECTION: ITEMS ──────────────────────────────────────────────
  const buildItems = (trx) => {
    const items = trx.items && trx.items.length
      ? trx.items
      : [{ barang: trx.barang || 'Pesanan', qty: 1, harga: trx.total, total: trx.total }];

    const rows = items.map(item => `
      <div class="rcpt-item">
        <div class="rcpt-item-name">${U.esc(item.barang)}</div>
        <div class="rcpt-item-detail">
          <span class="rcpt-muted rcpt-mono">${item.qty} × ${U.formatRp(item.harga)}</span>
          <span class="rcpt-item-total">${U.formatRp(item.total)}</span>
        </div>
      </div>`).join('');

    return `
      <section class="rcpt-items">
        <div class="rcpt-section-label">Daftar Pesanan</div>
        <div class="rcpt-items-list">${rows}</div>
      </section>`;
  };

  // ─── SECTION: SUMMARY ────────────────────────────────────────────
  const buildSummary = (trx) => {
    const { subtotal } = U.calcSubtotal(trx.items || []);
    const hasExtra     = (trx.diskon > 0) || (trx.ongkir > 0);

    let html = '';

    // Subtotal line (only if there are extras)
    if (hasExtra) {
      html += `
        <div class="rcpt-row rcpt-muted" style="font-size:12px">
          <span class="rcpt-lbl">Subtotal</span>
          <span class="rcpt-val">${U.formatRp(subtotal)}</span>
        </div>`;
    }

    if (trx.diskon > 0) {
      html += `
        <div class="rcpt-row" style="color:#DC2626;font-size:12px">
          <span class="rcpt-lbl">Diskon</span>
          <span class="rcpt-val">-${U.formatRp(trx.diskon)}</span>
        </div>`;
    }

    if (trx.ongkir > 0) {
      html += `
        <div class="rcpt-row rcpt-muted" style="font-size:12px">
          <span class="rcpt-lbl">Ongkos Kirim</span>
          <span class="rcpt-val">+${U.formatRp(trx.ongkir)}</span>
        </div>`;
    }

    // Grand total
    html += `
      <div class="rcpt-total-box">
        <span class="rcpt-total-lbl">Total Tagihan Akhir</span>
        <span class="rcpt-total-val">${U.formatRp(trx.total)}</span>
      </div>`;

    // Paid & remaining
    if (trx.dibayar > 0 && trx.sisa > 0) {
      html += `
        <div class="rcpt-row" style="font-size:12px;margin-top:8px">
          <span class="rcpt-lbl">Sudah Dibayar</span>
          <span class="rcpt-val" style="color:#10B981">${U.formatRp(trx.dibayar)}</span>
        </div>
        <div class="rcpt-row" style="font-size:14px;font-weight:900">
          <span class="rcpt-lbl" style="color:#DC2626">Sisa Tagihan</span>
          <span class="rcpt-val" style="color:#DC2626">${U.formatRp(trx.sisa)}</span>
        </div>`;
    }

    return `<section class="rcpt-summary">${html}</section>`;
  };

  // ─── SECTION: STATUS BADGE ───────────────────────────────────────
  const buildStatusBadge = (trx) => {
    const status = U.getPaymentStatus(trx);
    return `
      <div class="rcpt-status-badge" style="
        color:${status.color};
        background:${status.bgColor};
        border-color:${status.borderColor};
      ">${status.label}</div>`;
  };

  // ─── SECTION: PAYMENT INFO ───────────────────────────────────────
  const buildPayment = (trx, toko = {}) => {
    if (!trx.sisa || trx.sisa <= 0) return ''; // lunas — no payment section

    const rekListHtml = (toko.rekening || []).map(r => `
      <div class="rcpt-rek-item">
        <strong>${U.esc(r.bank)} — ${U.esc(r.no)}</strong>
        <span class="rcpt-muted">${U.esc(r.an)}</span>
      </div>`).join('');

    const qrisHtml = toko.qrisImg ? `
      <div class="rcpt-qris-box">
        <img src="${toko.qrisImg}" class="rcpt-qris-img" alt="QRIS" onerror="this.style.display='none'">
        <p class="rcpt-qris-caption">Scan QRIS — Masukkan nominal sisa tagihan</p>
      </div>` : '';

    return `
      <section class="rcpt-payment">
        <div class="rcpt-section-label">Metode Pembayaran</div>
        ${rekListHtml}
        ${qrisHtml}
      </section>`;
  };

  // ─── SECTION: FOOTER ─────────────────────────────────────────────
  const buildFooter = (toko = {}) => {
    const note1  = U.esc(toko.footerNote1  || DEFAULTS.footerNote1);
    const note2  = U.esc(toko.footerNote2  || DEFAULTS.footerNote2);
    const thanks = U.esc(toko.footerThanks || DEFAULTS.footerThanks);

    return `
      <footer class="rcpt-footer">
        <div class="rcpt-footer-notes">
          <p><strong>NOTED:</strong></p>
          <p>• ${note1}</p>
          <p>• ${note2}</p>
        </div>
        <div class="rcpt-footer-thanks">${thanks}</div>
        <div class="rcpt-footer-powered">Powered by Abunawas POS</div>
      </footer>`;
  };

  // ─── MASTER BUILDER ──────────────────────────────────────────────
  /**
   * Build complete receipt HTML.
   * @param {Object} trx    Transaction object from TRX[]
   * @param {Object} toko   Store config (TOKO)
   * @param {string} logoSrc  Logo image URL/path
   * @returns {string} Complete receipt inner HTML
   */
  const build = (trx, toko = {}, logoSrc = '') => {
    if (!trx) return '<p style="color:red">Error: data transaksi tidak ditemukan.</p>';

    return `
      <div class="rcpt-wrapper" id="rcpt-${U.esc(trx.id)}">
        ${buildHeader(toko, logoSrc)}
        <div class="rcpt-body">
          ${buildStamp(trx)}
          ${buildDocTitle(trx)}
          ${buildStatusBadge(trx)}
          ${buildMeta(trx)}
          <hr class="rcpt-divider">
          ${buildItems(trx)}
          <hr class="rcpt-divider">
          ${buildSummary(trx)}
          ${buildPayment(trx, toko)}
          ${buildFooter(toko)}
        </div>
      </div>`;
  };

  // ─── THERMAL 58mm BUILDER ────────────────────────────────────────
  /**
   * Build compact thermal receipt (58mm).
   * Minimal styling — max compatibility with thermal printers.
   * @param {Object} trx
   * @param {Object} toko
   * @returns {string}
   */
  const buildThermal58 = (trx, toko = {}) => {
    if (!trx) return '';
    const D  = U.thermalDivider('-', 32);
    const DD = U.thermalDivider('=', 32);
    const items = (trx.items || [{ barang: trx.barang || 'Pesanan', qty: 1, total: trx.total }]);
    const status = U.getPaymentStatus(trx);

    const itemRows = items.map(i =>
      `<div class="thm-item">
        <span class="thm-item-name">${U.truncate(U.esc(i.barang), 20)}</span>
        <span class="thm-item-qty">${i.qty}x</span>
        <span class="thm-item-total">${U.formatRp(i.total)}</span>
      </div>`
    ).join('');

    return `
      <div class="rcpt-thermal-58">
        <div class="thm-center thm-bold thm-lg">${U.esc(toko.nama || 'ABUNAWAS')}</div>
        <div class="thm-center thm-sm">${U.esc(toko.sub || 'Percetakan & Konveksi')}</div>
        ${toko.alamat ? `<div class="thm-center thm-xs thm-muted">${U.esc(toko.alamat)}</div>` : ''}
        <div class="thm-div">${DD}</div>

        <div class="thm-row"><span>No</span><span>${U.esc(trx.id)}</span></div>
        <div class="thm-row"><span>Tgl</span><span>${U.esc(trx.tgl)}</span></div>
        <div class="thm-row"><span>Kasir</span><span>${U.esc(trx.kasir || '-')}</span></div>
        <div class="thm-row"><span>Pelanggan</span><span>${U.truncate(U.esc(trx.pelanggan), 16)}</span></div>

        <div class="thm-div">${D}</div>
        <div class="thm-bold thm-sm">DAFTAR PESANAN:</div>
        ${itemRows}
        <div class="thm-div">${D}</div>

        ${trx.diskon > 0 ? `<div class="thm-row"><span>Diskon</span><span>-${U.formatRp(trx.diskon)}</span></div>` : ''}
        ${trx.ongkir > 0 ? `<div class="thm-row"><span>Ongkir</span><span>+${U.formatRp(trx.ongkir)}</span></div>` : ''}

        <div class="thm-div">${DD}</div>
        <div class="thm-row thm-bold thm-lg">
          <span>TOTAL</span>
          <span>${U.formatRp(trx.total)}</span>
        </div>
        ${trx.sisa > 0 ? `<div class="thm-row thm-bold" style="color:#CC0000"><span>SISA</span><span>${U.formatRp(trx.sisa)}</span></div>` : ''}
        <div class="thm-div">${D}</div>

        <div class="thm-status thm-center thm-bold">${status.label}</div>
        <div class="thm-div">${D}</div>

        <div class="thm-center thm-xs thm-muted">Warna cetakan tidak 100% akurat.</div>
        <div class="thm-center thm-xs thm-muted">Barang &gt;7 hari tidak diambil = hilang.</div>
        <div class="thm-div">${D}</div>
        <div class="thm-center thm-bold">Terima kasih! 🙏</div>
        <div class="thm-center thm-xs thm-muted">Abunawas POS</div>
      </div>`;
  };

  // Public API
  return {
    build,
    buildThermal58,
    buildHeader,
    buildItems,
    buildSummary,
    buildPayment,
    buildFooter,
    DEFAULTS
  };

})();

if (typeof module !== 'undefined') module.exports = ReceiptTemplate;

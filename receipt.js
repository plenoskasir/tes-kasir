/**
 * receipt.js
 * ─────────────────────────────────────────────────────────────────
 * Main receipt controller.
 * Bridges main app (TRX, TOKO globals) ↔ receipt system.
 * This is the ONLY file that reads main app globals.
 * ─────────────────────────────────────────────────────────────────
 * Load order in index.html:
 *   1. receipt-utils.js
 *   2. receipt-template.js
 *   3. print.js
 *   4. receipt.js       ← this file (last)
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

const ReceiptController = (() => {

  // ── Internal state ───────────────────────────────────────────────
  let _currentTrx = null;   // currently viewed transaction
  let _currentId  = null;   // currently viewed transaction ID

  // ── Get toko config (from app global TOKO) ───────────────────────
  /**
   * Build toko config object from app global TOKO.
   * Isolates dependency on app globals.
   * @returns {Object}
   */
  const getTokoConfig = () => {
    const t = (typeof TOKO !== 'undefined') ? TOKO : {};
    return {
      nama        : t.nama         || 'ABUNAWAS',
      sub         : 'Percetakan & Konveksi',
      tagline     : 'Melayani Digital Printing',
      alamat      : t.alamat       || '',
      phone       : t.telp         || '',
      rekening    : t.rekening     || [],
      qrisImg     : t.qrisImg      || '',
      logoSrc     : 'HARGA.jpg',
      autoPrint   : t.autoPrint    || false,
      printMode   : t.printMode    || '80mm',
      footerNote1 : 'Hasil warna cetakan tidak bisa 100% sama dengan layar.',
      footerNote2 : 'Barang tidak diambil lebih dari 7 hari dianggap hilang.',
      footerThanks: 'Terima kasih sudah mempercayakan pesanan pada kami! 🙏',
    };
  };

  // ── Show receipt in modal ────────────────────────────────────────
  /**
   * Render receipt into #nota-preview-card and open modal.
   * Replaces old buildNotaInner() + showNota() functions.
   * @param {string} trxId    Transaction ID
   */
  const show = (trxId) => {
    const trxArr = (typeof TRX !== 'undefined') ? TRX : [];
    const trx    = trxArr.find(t => t.id === trxId);

    if (!trx) {
      console.error('[ReceiptController] TRX not found:', trxId);
      return;
    }

    _currentTrx = trx;
    _currentId  = trxId;

    const container = document.getElementById('nota-preview-card');
    if (!container) return;

    const toko = getTokoConfig();
    container.innerHTML = ReceiptTemplate.build(trx, toko, toko.logoSrc);

    // Keep backward compat: notaForWA, currentNotaId
    if (typeof notaForWA  !== 'undefined') window.notaForWA  = trx;
    if (typeof currentNotaId !== 'undefined') window.currentNotaId = trxId;

    if (typeof openModal === 'function') openModal('mo-nota');
  };

  // ── Print current receipt ────────────────────────────────────────
  /**
   * Print the currently shown receipt.
   * @param {string} mode  '58mm' | '80mm' | 'a4'
   */
  const print = (mode = null) => {
    if (!_currentTrx) {
      console.warn('[ReceiptController] No current transaction to print.');
      return;
    }
    ReceiptPrint.printTransaction(_currentTrx, getTokoConfig(), mode);
  };

  // ── Print by ID directly ─────────────────────────────────────────
  const printById = (trxId, mode = null) => {
    const trx = (typeof TRX !== 'undefined') ? TRX.find(t => t.id === trxId) : null;
    if (!trx) return;
    ReceiptPrint.printTransaction(trx, getTokoConfig(), mode);
  };

  // ── Auto print after save ────────────────────────────────────────
  const autoPrint = (trx) => {
    ReceiptPrint.autoPrint(trx, getTokoConfig());
  };

  // ── Send WA from current receipt ─────────────────────────────────
  /**
   * Build WhatsApp message from current transaction.
   * Replaces old kirimWANota() function.
   */
  const sendWAFromCurrent = () => {
    const trx = _currentTrx;
    if (!trx) return;

    const toko  = getTokoConfig();
    const items = trx.items || [{ barang: trx.barang || 'Pesanan', qty: 1, harga: trx.total, total: trx.total }];
    const itemText = items.map(i =>
      `▪️ *${i.barang}*\n   ${i.qty} x ${ReceiptUtils.formatRp(i.harga)} = ${ReceiptUtils.formatRp(i.total)}`
    ).join('\n');

    let extra = '';
    if (trx.diskon > 0) extra += `➖ *Diskon:* -${ReceiptUtils.formatRp(trx.diskon)}\n`;
    if (trx.ongkir > 0) extra += `🛵 *Ongkir:* +${ReceiptUtils.formatRp(trx.ongkir)}\n`;

    const statusLine = trx.sisa > 0
      ? `⚠️ *Sisa Tagihan:* ${ReceiptUtils.formatRp(trx.sisa)}`
      : `✅ *Status: LUNAS*`;

    const msg = [
      `Halo *${trx.pelanggan}*, berikut rincian pesanan dari *${toko.nama}*.`,
      '',
      `📄 ${trx.sisa <= 0 ? '*BUKTI LUNAS*' : '*INVOICE PESANAN*'}`,
      `🧾 *ID Nota:* ${trx.id}`,
      `📅 *Tanggal:* ${trx.tgl}`,
      '',
      `📦 *DAFTAR PESANAN*`,
      itemText,
      extra,
      `💰 *TOTAL: ${ReceiptUtils.formatRp(trx.total)}*`,
      statusLine,
      '',
      `📍 Pengambilan di: ${toko.nama}`,
      trx.alamat ? `Alamat: ${trx.alamat}` : '',
      `(Kasir: ${trx.kasir || '-'})`,
      '',
      `*NOTED:*`,
      `- Warna cetakan tidak 100% akurat dari layar.`,
      `- Barang tidak diambil >7 hari dianggap hilang.`,
      '',
      toko.footerThanks,
    ].filter(l => l !== null).join('\n');

    if (trx.wa && typeof sendWA === 'function') {
      sendWA(trx.wa, msg);
    } else {
      alert('Pesan WA:\n\n' + msg);
    }
  };

  // ── Thermal print selection UI ───────────────────────────────────
  /**
   * Show print mode selector before printing.
   */
  const showPrintSelector = () => {
    if (!_currentTrx) return;

    const modeEl = document.getElementById('rcpt-print-mode');
    const mode   = modeEl ? modeEl.value : '80mm';
    print(mode);
  };

  // ── Update modal buttons ─────────────────────────────────────────
  /**
   * Inject print mode selector into nota modal actions.
   * Call once after modal HTML is loaded.
   */
  const injectPrintControls = () => {
    const actWrap = document.querySelector('.nota-acts');
    if (!actWrap) return;

    // Avoid double inject
    if (document.getElementById('rcpt-print-controls')) return;

    const ctrl = document.createElement('div');
    ctrl.id = 'rcpt-print-controls';
    ctrl.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
    ctrl.innerHTML = `
      <select id="rcpt-print-mode" style="
        padding:8px 10px;border:1px solid var(--bdr);border-radius:8px;
        font-family:var(--fn);font-size:12px;font-weight:700;
        background:var(--surf);color:var(--tx);outline:none;
      ">
        <option value="80mm">🖨️ 80mm (Standar)</option>
        <option value="58mm">🖨️ 58mm (Mini)</option>
        <option value="a4">📄 A4 (PDF)</option>
      </select>`;
    actWrap.prepend(ctrl);
  };

  // Public API
  return {
    show,
    print,
    printById,
    autoPrint,
    sendWAFromCurrent,
    showPrintSelector,
    injectPrintControls,
    getTokoConfig,
    getCurrent: () => _currentTrx,
  };

})();

/* ─── Backward Compatibility Shims ──────────────────────────────
 * Map old function names → new system.
 * Allows existing HTML onclick handlers to work unchanged.
 * ─────────────────────────────────────────────────────────────── */

// Old: showNota(id)
function showNota(id) {
  ReceiptController.show(id);
}

// Old: window.print() from print button
function cetakNota() {
  ReceiptController.showPrintSelector();
}

// Old: kirimWANota()
function kirimWANota() {
  ReceiptController.sendWAFromCurrent();
}

// Old: buildNotaInner(t, isTampil) — kept for any direct callers
function buildNotaInner(t, isTampil = true) {
  const toko = ReceiptController.getTokoConfig();
  return ReceiptTemplate.build(t, toko, toko.logoSrc);
}

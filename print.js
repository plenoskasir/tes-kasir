/**
 * print.js
 * ─────────────────────────────────────────────────────────────────
 * Handles all print operations.
 * Separates print logic from UI and template logic.
 * Depends on: receipt-template.js, receipt-utils.js
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

const ReceiptPrint = (() => {

  // ── Config ───────────────────────────────────────────────────────
  const CONFIG = {
    printDelay    : 400,    // ms before window.print() fires (let CSS render)
    autoClose     : true,   // close print window after dialog
    defaultMode   : '80mm', // '58mm' | '80mm' | 'a4'
    printWindowName: 'rcpt-print',
  };

  // ── State ────────────────────────────────────────────────────────
  let _currentMode = CONFIG.defaultMode;

  // ── Set print mode ───────────────────────────────────────────────
  const setMode = (mode) => {
    if (['58mm', '80mm', 'a4'].includes(mode)) _currentMode = mode;
  };

  const getMode = () => _currentMode;

  // ── Build full print document ────────────────────────────────────
  /**
   * Build a standalone HTML document for print window.
   * @param {string} bodyHtml   Inner receipt HTML
   * @param {string} mode       '58mm' | '80mm' | 'a4'
   * @returns {string}          Full HTML document string
   */
  const buildPrintDoc = (bodyHtml, mode = '80mm') => {
    const pageWidth = mode === '58mm' ? '54mm' : mode === '80mm' ? '74mm' : '210mm';
    const fontSize  = mode === '58mm' ? '10px' : mode === '80mm' ? '11px' : '12px';

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Struk Abunawas</title>
  <link rel="stylesheet" href="receipt/receipt.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width      : ${pageWidth};
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      font-size  : ${fontSize};
      background : #fff;
      color      : #000;
    }
    @page {
      size   : ${mode === 'a4' ? 'A4' : pageWidth + ' auto'};
      margin : ${mode === '58mm' ? '3mm 2mm' : mode === '80mm' ? '4mm 3mm' : '10mm'};
    }
    @media print {
      body { width: ${pageWidth} !important; }
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  };

  // ── Print via popup window (recommended) ─────────────────────────
  /**
   * Open print in new window — avoids interfering with main app.
   * @param {string} innerHtml  Receipt HTML
   * @param {string} mode       Print mode
   */
  const printViaWindow = (innerHtml, mode = _currentMode) => {
    const doc  = buildPrintDoc(innerHtml, mode);
    const win  = window.open('', CONFIG.printWindowName, 'width=400,height=700,toolbar=0,scrollbars=1');

    if (!win) {
      // Popup blocked — fallback to inline print
      printInline(innerHtml);
      return;
    }

    win.document.open();
    win.document.write(doc);
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
        if (CONFIG.autoClose) {
          win.onafterprint = () => win.close();
          // Fallback close if onafterprint not supported
          setTimeout(() => { try { win.close(); } catch(e) {} }, 3000);
        }
      }, CONFIG.printDelay);
    };
  };

  // ── Print inline (fallback) ──────────────────────────────────────
  /**
   * Inject receipt into DOM and call window.print().
   * Less ideal but works when popups are blocked.
   * @param {string} innerHtml
   */
  const printInline = (innerHtml) => {
    // Create temporary print container
    const container = document.createElement('div');
    container.id    = 'rcpt-print-inline';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:99999;background:#fff;';
    container.innerHTML = innerHtml;
    document.body.appendChild(container);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.removeChild(container);
      }, 1000);
    }, CONFIG.printDelay);
  };

  // ── Download as PDF hint ─────────────────────────────────────────
  /**
   * Open print dialog with PDF save hint in title.
   * @param {string} innerHtml
   * @param {string} filename   Suggested filename
   */
  const savePDF = (innerHtml, filename = 'struk-abunawas') => {
    const doc = buildPrintDoc(innerHtml, 'a4');
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.title = filename;
    win.document.open();
    win.document.write(doc);
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
      }, CONFIG.printDelay);
    };
  };

  // ── Main entry: print transaction ───────────────────────────────
  /**
   * Print a transaction receipt from the main app.
   * @param {Object} trx    Transaction object
   * @param {Object} toko   Store config (TOKO global)
   * @param {string} mode   Print mode override
   */
  const printTransaction = (trx, toko = {}, mode = null) => {
    if (!trx) { console.error('[ReceiptPrint] trx is null'); return; }

    const printMode = mode || _currentMode;
    let html;

    if (printMode === '58mm') {
      html = ReceiptTemplate.buildThermal58(trx, toko);
    } else {
      html = ReceiptTemplate.build(trx, toko, toko.logoSrc || 'HARGA.jpg');
    }

    printViaWindow(html, printMode);
  };

  // ── Auto print (called after save) ──────────────────────────────
  /**
   * Trigger auto-print after transaction saved.
   * Respects user preference from TOKO config.
   * @param {Object} trx
   * @param {Object} toko
   */
  const autoPrint = (trx, toko = {}) => {
    if (!toko.autoPrint) return;
    printTransaction(trx, toko, toko.printMode || _currentMode);
  };

  // Public API
  return {
    setMode,
    getMode,
    printViaWindow,
    printInline,
    savePDF,
    printTransaction,
    autoPrint,
    buildPrintDoc,
    CONFIG
  };

})();

if (typeof module !== 'undefined') module.exports = ReceiptPrint;

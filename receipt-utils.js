/**
 * receipt-utils.js
 * ─────────────────────────────────────────────────────────────────
 * Shared utility helpers for receipt system.
 * No dependency on main app — safe to use standalone.
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

const ReceiptUtils = (() => {

  /**
   * Format number to Rupiah string.
   * @param {number} n
   * @returns {string} e.g. "Rp 150.000"
   */
  const formatRp = (n) => {
    if (isNaN(n) || n === null) return 'Rp 0';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
  };

  /**
   * Format number to short Rupiah (no prefix).
   * @param {number} n
   * @returns {string} e.g. "150.000"
   */
  const formatNum = (n) => {
    if (isNaN(n) || n === null) return '0';
    return Number(n).toLocaleString('id-ID');
  };

  /**
   * Format date string to Indonesian readable format.
   * @param {string} dateStr  YYYY-MM-DD
   * @returns {string} e.g. "Senin, 26 Mei 2025"
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  /**
   * Format datetime to Indonesian readable with time.
   * @returns {string} e.g. "26 Mei 2025, 14:35"
   */
  const formatDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  /**
   * Calculate totals from transaction items array.
   * @param {Array} items
   * @returns {{ subtotal, totalQty }}
   */
  const calcSubtotal = (items = []) => {
    const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
    const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
    return { subtotal, totalQty };
  };

  /**
   * Escape HTML to prevent XSS in template strings.
   * @param {string} str
   * @returns {string}
   */
  const esc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  /**
   * Truncate string to max length with ellipsis.
   * @param {string} str
   * @param {number} max
   * @returns {string}
   */
  const truncate = (str, max = 30) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
  };

  /**
   * Get payment status label and color.
   * @param {Object} trx  transaction object
   * @returns {{ label, color, bgColor }}
   */
  const getPaymentStatus = (trx) => {
    if (!trx.sisa || trx.sisa <= 0) {
      return { label: 'LUNAS', color: '#065F46', bgColor: '#D1FAE5', borderColor: '#10B981' };
    }
    if (trx.bayar === 'DP') {
      return { label: 'DP / CICILAN', color: '#92400E', bgColor: '#FEF3C7', borderColor: '#F59E0B' };
    }
    return { label: 'BELUM LUNAS', color: '#991B1B', bgColor: '#FEE2E2', borderColor: '#EF4444' };
  };

  /**
   * Generate simple divider line for thermal printers.
   * @param {string} char   character to repeat (default '-')
   * @param {number} width  number of chars (default 32 for 58mm)
   * @returns {string}
   */
  const thermalDivider = (char = '-', width = 32) => char.repeat(width);

  // Public API
  return {
    formatRp,
    formatNum,
    formatDate,
    formatDateTime,
    calcSubtotal,
    esc,
    truncate,
    getPaymentStatus,
    thermalDivider
  };

})();

// CommonJS / module fallback
if (typeof module !== 'undefined') module.exports = ReceiptUtils;

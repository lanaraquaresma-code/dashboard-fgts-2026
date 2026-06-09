/* ══ HELPERS — Formatadores e constantes de status ══ */

const M = v => {
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' bi';
  return (v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'M';
};

const fmtR = v => 'R$ ' + M(v);

const pct = (a, b) => {
  a = Number(a) || 0;
  b = Number(b) || 0;
  return b > 0 ? (a / b) * 100 : 0;
};

const cl = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

function statusOf(r) {
  const fila = r.comprometido;
  const ratio = pct(fila, r.saldo);
  if (ratio > 100) return 'crit';
  if (ratio > 70)  return 'hot';
  if (ratio > 30)  return 'watch';
  return 'ok';
}

const SCLR = { ok: '#22c55e', watch: '#f59e0b', hot: '#f87171', crit: '#ff4444' };
const SLBL = { ok: 'Normal',  watch: 'Monitorar', hot: 'Atenção Alta', crit: '⚠ CRÍTICO' };
const BCLS = { ok: 'b-ok',   watch: 'b-watch',   hot: 'b-hot',        crit: 'b-crit' };
const BTOP = { ok: '#16a34a', watch: '#d97706',   hot: '#ef4444',      crit: '#dc2626' };

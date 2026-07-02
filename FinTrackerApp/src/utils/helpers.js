import { COLORS_PALETTE } from '../constants/theme';

export function fmt(amount, currency) {
  if (currency === 'PHP') return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (currency === 'USD') return '$' + Number(amount).toFixed(2);
  if (currency === 'BTC') return '₿' + Number(amount).toFixed(4);
  return currency + ' ' + Number(amount).toFixed(2);
}

export function getColor(id) {
  return COLORS_PALETTE.find(c => c.id === id) || COLORS_PALETTE[0];
}

export function totalPhp(accounts) {
  return accounts.reduce((s, a) => {
    const r = a.currency === 'PHP' ? 1 : a.currency === 'USD' ? 56 : a.currency === 'BTC' ? 4184000 : 1;
    return s + a.balance * r;
  }, 0);
}

export function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

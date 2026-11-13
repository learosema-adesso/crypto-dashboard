// Money is always USDT. `signed` adds +/- for P/L (no sign for exactly 0).
export function formatUsdt(value: number, { signed = false } = {}): string {
  const number = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: signed ? 'exceptZero' : 'auto',
  });
  return `${number} USDT`;
}

// Coin quantities need more precision than money (e.g. 0.00123456 BTC).
export function formatQty(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

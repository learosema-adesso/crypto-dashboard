import { describe, expect, it } from 'vitest';
import { formatQty, formatUsdt } from './format';

describe('formatUsdt', () => {
  it('formats with thousands separator and two decimals', () => {
    expect(formatUsdt(10_000)).toBe('10,000.00 USDT');
    expect(formatUsdt(1234.5678)).toBe('1,234.57 USDT');
  });

  it('keeps the minus sign for negative values', () => {
    expect(formatUsdt(-40)).toBe('-40.00 USDT');
  });

  it('adds a plus sign for positive values when signed', () => {
    expect(formatUsdt(150, { signed: true })).toBe('+150.00 USDT');
    expect(formatUsdt(-40, { signed: true })).toBe('-40.00 USDT');
  });

  it('shows no sign for zero when signed', () => {
    expect(formatUsdt(0, { signed: true })).toBe('0.00 USDT');
  });
});

describe('formatQty', () => {
  it('keeps up to 8 decimals without padding', () => {
    expect(formatQty(2)).toBe('2');
    expect(formatQty(0.00123456)).toBe('0.00123456');
  });

  it('rounds beyond 8 decimals and groups thousands', () => {
    expect(formatQty(0.123456789)).toBe('0.12345679');
    expect(formatQty(1234.5)).toBe('1,234.5');
  });
});

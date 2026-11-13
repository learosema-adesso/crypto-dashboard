import { describe, expect, it } from 'vitest';
import { formatUsdt } from './format';

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

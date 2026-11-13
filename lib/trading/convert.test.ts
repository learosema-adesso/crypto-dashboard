import { describe, expect, it } from 'vitest';
import { amountToQty, qtyToAmount } from './convert';

describe('amountToQty', () => {
  it('divides the amount by the price', () => {
    expect(amountToQty('200', 100)).toBe('2');
    expect(amountToQty('50', 4)).toBe('12.5');
  });

  it('rounds to 8 decimals', () => {
    expect(amountToQty('100', 3)).toBe('33.33333333');
  });

  it.each([[''], ['  '], ['abc'], ['-5'], ['Infinity']])(
    'returns an empty string for the input "%s"',
    (input) => {
      expect(amountToQty(input, 100)).toBe('');
    },
  );

  it.each([[0], [-1], [NaN]])(
    'returns an empty string for the price %s',
    (price) => {
      expect(amountToQty('100', price)).toBe('');
    },
  );
});

describe('qtyToAmount', () => {
  it('multiplies the quantity by the price', () => {
    expect(qtyToAmount('2', 100)).toBe('200.00');
  });

  it('rounds to 2 decimals', () => {
    expect(qtyToAmount('0.0023451', 69820.12)).toBe('163.74');
  });

  it.each([[''], ['abc'], ['-1']])(
    'returns an empty string for the input "%s"',
    (input) => {
      expect(qtyToAmount(input, 100)).toBe('');
    },
  );

  it('returns an empty string for a price of 0', () => {
    expect(qtyToAmount('1', 0)).toBe('');
  });
});

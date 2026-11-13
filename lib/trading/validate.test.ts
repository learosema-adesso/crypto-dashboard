import { describe, expect, it } from 'vitest';
import { validateTrade } from './validate';

const base = { qty: 1, price: 100, cash: 1_000, held: 5 };

describe('validateTrade', () => {
  it('allows a buy within the available cash', () => {
    expect(validateTrade({ ...base, side: 'buy' })).toBeNull();
  });

  it('allows a buy that spends exactly all cash', () => {
    expect(validateTrade({ ...base, side: 'buy', qty: 10 })).toBeNull();
  });

  it('rejects a buy that costs more than the cash', () => {
    expect(validateTrade({ ...base, side: 'buy', qty: 10.01 })).toMatch(
      /not enough cash/i,
    );
  });

  it('allows a sell within the holdings', () => {
    expect(validateTrade({ ...base, side: 'sell' })).toBeNull();
  });

  it('allows selling the whole holding', () => {
    expect(validateTrade({ ...base, side: 'sell', qty: 5 })).toBeNull();
  });

  it('rejects a sell above the holdings', () => {
    expect(validateTrade({ ...base, side: 'sell', qty: 5.01 })).toMatch(
      /do not hold enough/i,
    );
  });

  it('rejects selling something that is not held', () => {
    expect(validateTrade({ ...base, side: 'sell', held: 0 })).toMatch(
      /do not hold enough/i,
    );
  });

  it.each([
    ['zero', 0],
    ['negative', -1],
    ['NaN', NaN],
    ['Infinity', Infinity],
  ])('rejects a %s quantity for buy and sell', (_, qty) => {
    expect(validateTrade({ ...base, side: 'buy', qty })).toMatch(/quantity/i);
    expect(validateTrade({ ...base, side: 'sell', qty })).toMatch(/quantity/i);
  });

  it('ignores floating point residue at the limit', () => {
    expect(
      validateTrade({ ...base, side: 'sell', qty: 0.3, held: 0.1 + 0.2 }),
    ).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { computePortfolio } from './portfolio';

describe('computePortfolio', () => {
  it('returns zero totals for no holdings', () => {
    expect(computePortfolio({}, {})).toEqual({
      positions: {},
      totalValue: 0,
      totalCost: 0,
      totalPl: 0,
    });
  });

  it('calculates value, cost and positive P/L for a rising price', () => {
    const result = computePortfolio(
      { BTCUSDT: { qty: 2, avgCost: 100 } },
      { BTCUSDT: 150 },
    );
    expect(result.positions.BTCUSDT).toEqual({
      qty: 2,
      avgCost: 100,
      price: 150,
      value: 300,
      cost: 200,
      pl: 100,
    });
  });

  it('reports a negative P/L when the price falls', () => {
    const result = computePortfolio(
      { BTCUSDT: { qty: 2, avgCost: 100 } },
      { BTCUSDT: 80 },
    );
    expect(result.positions.BTCUSDT.pl).toBe(-40);
    expect(result.totalPl).toBe(-40);
  });

  it('sums across symbols, netting gains and losses', () => {
    const result = computePortfolio(
      {
        BTCUSDT: { qty: 1, avgCost: 100 },
        ETHUSDT: { qty: 10, avgCost: 10 },
      },
      { BTCUSDT: 160, ETHUSDT: 5 },
    );
    expect(result.totalValue).toBe(210);
    expect(result.totalCost).toBe(200);
    expect(result.totalPl).toBe(10);
  });

  it('ignores prices for symbols that are not held', () => {
    const result = computePortfolio(
      { BTCUSDT: { qty: 1, avgCost: 100 } },
      { BTCUSDT: 100, ETHUSDT: 3000 },
    );
    expect(Object.keys(result.positions)).toEqual(['BTCUSDT']);
  });

  it('throws when a held symbol has no price', () => {
    expect(() =>
      computePortfolio({ BTCUSDT: { qty: 1, avgCost: 100 } }, {}),
    ).toThrow('Missing price for BTCUSDT');
  });

  it('throws when a price is not finite', () => {
    expect(() =>
      computePortfolio({ BTCUSDT: { qty: 1, avgCost: 100 } }, { BTCUSDT: NaN }),
    ).toThrow('Missing price for BTCUSDT');
  });
});

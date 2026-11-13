import { afterEach, describe, expect, it } from 'vitest';
import { STARTING_CASH, useTrading } from '../trading/store';
import { computeHoldings } from './holdings';
import { computePortfolio } from './portfolio';

describe('trades -> holdings -> portfolio', () => {
  afterEach(() => {
    useTrading.setState({ cash: STARTING_CASH, trades: [] });
  });

  it('gives the expected numbers for two buys and a partial sell', () => {
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 1, 100);
    buy('BTCUSDT', 3, 200);
    sell('BTCUSDT', 2, 300);

    const { cash, trades } = useTrading.getState();
    const portfolio = computePortfolio(computeHoldings(trades), {
      BTCUSDT: 250,
    });

    // 10_000 - 100 - 600 + 600
    expect(cash).toBe(9_900);
    expect(portfolio.positions.BTCUSDT).toMatchObject({
      qty: 2,
      avgCost: 175,
      value: 500,
      cost: 350,
      pl: 150,
    });
    expect(portfolio.totalPl).toBe(150);
  });
});

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

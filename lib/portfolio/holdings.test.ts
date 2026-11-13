import { describe, expect, it } from 'vitest';
import type { Trade } from '../trading/store';
import { computeHoldings } from './holdings';

let n = 0;
const trade = (
  side: Trade['side'],
  symbol: string,
  qty: number,
  price: number,
): Trade => ({ id: String(n++), side, symbol, qty, price, ts: n });

describe('computeHoldings', () => {
  it('returns no holdings for no trades', () => {
    expect(computeHoldings([])).toEqual({});
  });

  it('uses the buy price as average cost for a single buy', () => {
    expect(computeHoldings([trade('buy', 'BTCUSDT', 2, 100)])).toEqual({
      BTCUSDT: { qty: 2, avgCost: 100 },
    });
  });

  it('weights the average cost across multiple buys', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 1, 100),
      trade('buy', 'BTCUSDT', 3, 200),
    ]);
    expect(result.BTCUSDT).toEqual({ qty: 4, avgCost: 175 });
  });

  it('keeps the average cost on a partial sell', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 4, 100),
      trade('sell', 'BTCUSDT', 1, 500),
    ]);
    expect(result.BTCUSDT).toEqual({ qty: 3, avgCost: 100 });
  });

  it('removes a holding that was sold completely', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 1, 100),
      trade('sell', 'BTCUSDT', 1, 150),
    ]);
    expect(result).toEqual({});
  });

  it('starts a fresh average cost after a full sell', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 1, 100),
      trade('sell', 'BTCUSDT', 1, 150),
      trade('buy', 'BTCUSDT', 2, 300),
    ]);
    expect(result.BTCUSDT).toEqual({ qty: 2, avgCost: 300 });
  });

  it('tracks symbols independently', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 1, 100),
      trade('buy', 'ETHUSDT', 5, 10),
      trade('sell', 'ETHUSDT', 2, 20),
    ]);
    expect(result).toEqual({
      BTCUSDT: { qty: 1, avgCost: 100 },
      ETHUSDT: { qty: 3, avgCost: 10 },
    });
  });

  it('ignores floating point residue when selling everything', () => {
    const result = computeHoldings([
      trade('buy', 'BTCUSDT', 0.1, 100),
      trade('buy', 'BTCUSDT', 0.2, 100),
      trade('sell', 'BTCUSDT', 0.3, 100),
    ]);
    expect(result).toEqual({});
  });

  it('throws when selling more than held', () => {
    expect(() =>
      computeHoldings([
        trade('buy', 'BTCUSDT', 1, 100),
        trade('sell', 'BTCUSDT', 2, 100),
      ]),
    ).toThrow('Cannot sell 2 BTCUSDT: only 1 held');
  });

  it('throws when selling a symbol that was never bought', () => {
    expect(() => computeHoldings([trade('sell', 'ETHUSDT', 1, 10)])).toThrow(
      'only 0 held',
    );
  });
});

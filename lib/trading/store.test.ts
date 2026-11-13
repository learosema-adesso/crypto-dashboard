import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STARTING_CASH, useTrading } from './store';

describe('useTrading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    useTrading.setState({ cash: STARTING_CASH, trades: [] });
  });

  it('starts with the starting cash and no trades', () => {
    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(10_000);
    expect(trades).toEqual([]);
  });

  it('buy reduces cash by qty * price and records a buy trade', () => {
    useTrading.getState().buy('BTCUSDT', 0.5, 60_000);

    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(10_000 - 30_000);
    expect(trades).toEqual([
      {
        id: expect.any(String),
        symbol: 'BTCUSDT',
        side: 'buy',
        qty: 0.5,
        price: 60_000,
        ts: 1_700_000_000_000,
      },
    ]);
  });

  it('sell increases cash by qty * price and records a sell trade', () => {
    useTrading.getState().sell('ETHUSDT', 2, 3_000);

    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(10_000 + 6_000);
    expect(trades).toMatchObject([
      { symbol: 'ETHUSDT', side: 'sell', qty: 2, price: 3_000 },
    ]);
  });

  it('appends trades in order with unique ids', () => {
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 0.1, 50_000);
    sell('BTCUSDT', 0.05, 52_000);

    const { trades } = useTrading.getState();
    expect(trades.map((t) => t.side)).toEqual(['buy', 'sell']);
    expect(trades[0].id).not.toBe(trades[1].id);
  });
});

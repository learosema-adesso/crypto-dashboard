import type { Trade } from '../trading/store';

export type Holding = { qty: number; avgCost: number };

// Tolerance for floating point residue, e.g. 0.1 + 0.2 - 0.3
export const EPSILON = 1e-12;

// Derives holdings from the trade history (oldest first).
// A buy moves the average cost, a sell only reduces qty (avgCost stays).
// Throws if a sell exceeds the holding: short selling is not supported.
export function computeHoldings(trades: Trade[]): Record<string, Holding> {
  const holdings: Record<string, Holding> = {};

  for (const { symbol, side, qty, price } of trades) {
    const current = holdings[symbol] ?? { qty: 0, avgCost: 0 };

    if (side === 'buy') {
      const total = current.qty + qty;
      holdings[symbol] = {
        qty: total,
        avgCost: (current.qty * current.avgCost + qty * price) / total,
      };
      continue;
    }

    if (qty > current.qty + EPSILON) {
      throw new Error(`Cannot sell ${qty} ${symbol}: only ${current.qty} held`);
    }
    const remaining = current.qty - qty;
    if (remaining <= EPSILON) delete holdings[symbol];
    else holdings[symbol] = { qty: remaining, avgCost: current.avgCost };
  }

  return holdings;
}

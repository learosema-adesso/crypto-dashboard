import type { Holding } from './holdings';

type Position = Holding & {
  price: number;
  value: number;
  cost: number;
  pl: number;
};

export type Portfolio = {
  positions: Record<string, Position>;
  totalValue: number;
  totalCost: number;
  totalPl: number;
};

// Pure: P/L per symbol is (price - avgCost) * qty, plus sums over all positions.
// Throws if a held symbol has no valid price, so callers must wait for prices.
export function computePortfolio(
  holdings: Record<string, Holding>,
  prices: Record<string, number>,
): Portfolio {
  const positions: Record<string, Position> = {};
  let totalValue = 0;
  let totalCost = 0;

  for (const [symbol, { qty, avgCost }] of Object.entries(holdings)) {
    const price = prices[symbol];
    if (price === undefined || !Number.isFinite(price)) {
      throw new Error(`Missing price for ${symbol}`);
    }
    const value = qty * price;
    const cost = qty * avgCost;
    positions[symbol] = { qty, avgCost, price, value, cost, pl: value - cost };
    totalValue += value;
    totalCost += cost;
  }

  return { positions, totalValue, totalCost, totalPl: totalValue - totalCost };
}

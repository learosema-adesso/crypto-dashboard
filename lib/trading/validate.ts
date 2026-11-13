import { EPSILON } from '../portfolio/holdings';
import type { Trade } from './store';

type TradeInput = {
  side: Trade['side'];
  qty: number;
  price: number;
  cash: number;
  // quantity currently held of the traded symbol
  held: number;
};

// Returns an error message, or null if the trade is allowed.
// No fees, no short selling: a buy needs enough cash, a sell enough holdings.
export function validateTrade({
  side,
  qty,
  price,
  cash,
  held,
}: TradeInput): string | null {
  if (!Number.isFinite(qty) || qty <= 0) {
    return 'Enter a quantity greater than 0.';
  }
  if (side === 'buy' && qty * price > cash + EPSILON) {
    return 'Not enough cash for this purchase.';
  }
  if (side === 'sell' && qty > held + EPSILON) {
    return 'You do not hold enough to sell this quantity.';
  }
  return null;
}

import { create } from 'zustand';

export const STARTING_CASH = 10_000;

export type Trade = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  ts: number;
};

type TradingState = {
  cash: number;
  trades: Trade[];
  buy: (symbol: string, qty: number, price: number) => void;
  sell: (symbol: string, qty: number, price: number) => void;
};

function createTrade(
  side: Trade['side'],
  symbol: string,
  qty: number,
  price: number,
): Trade {
  return {
    id: crypto.randomUUID(),
    symbol,
    side,
    qty,
    price,
    ts: Date.now(),
  };
}

// Holdings, average cost and P/L are derived from `trades`, never stored.
// Validation (enough cash / holdings, qty > 0) lives in the trade panel.
export const useTrading = create<TradingState>()((set) => ({
  cash: STARTING_CASH,
  trades: [],
  buy: (symbol, qty, price) =>
    set((s) => ({
      cash: s.cash - qty * price,
      trades: [...s.trades, createTrade('buy', symbol, qty, price)],
    })),
  sell: (symbol, qty, price) =>
    set((s) => ({
      cash: s.cash + qty * price,
      trades: [...s.trades, createTrade('sell', symbol, qty, price)],
    })),
}));

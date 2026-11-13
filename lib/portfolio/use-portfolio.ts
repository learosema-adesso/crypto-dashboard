'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { priceQuery } from '../market/queries';
import { useTrading } from '../trading/store';
import { computeHoldings } from './holdings';
import { computePortfolio } from './portfolio';

// Holdings and P/L derived from the trades plus the latest price per held
// symbol. `portfolio` stays null until every price is there, because
// computePortfolio throws on a missing price.
export function usePortfolio() {
  const trades = useTrading((s) => s.trades);
  // derived outside the selector, otherwise it returns a new object every time
  const holdings = useMemo(() => computeHoldings(trades), [trades]);
  const symbols = Object.keys(holdings);

  const results = useQueries({ queries: symbols.map(priceQuery) });
  const isError = results.some((r) => r.isError);
  const isPending = results.some((r) => r.isPending);

  let portfolio = null;
  if (!isError && !isPending) {
    const prices = Object.fromEntries(
      symbols.map((symbol, i) => [symbol, results[i].data as number]),
    );
    portfolio = computePortfolio(holdings, prices);
  }

  return { portfolio, isPending, isError };
}

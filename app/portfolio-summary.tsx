'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { formatUsdt } from '../lib/format';
import { priceQuery } from '../lib/market/queries';
import { computeHoldings } from '../lib/portfolio/holdings';
import { computePortfolio } from '../lib/portfolio/portfolio';
import { useTrading } from '../lib/trading/store';

export function PortfolioSummary() {
  const cash = useTrading((s) => s.cash);
  const trades = useTrading((s) => s.trades);
  // derived outside the selector, otherwise it returns a new object every time
  const holdings = useMemo(() => computeHoldings(trades), [trades]);
  const symbols = Object.keys(holdings);

  const results = useQueries({ queries: symbols.map(priceQuery) });

  const isError = results.some((r) => r.isError);
  const isPending = results.some((r) => r.isPending);

  // computePortfolio throws on a missing price, so only call it with all prices
  let portfolio = null;
  if (!isError && !isPending) {
    const prices = Object.fromEntries(
      symbols.map((symbol, i) => [symbol, results[i].data as number]),
    );
    portfolio = computePortfolio(holdings, prices);
  }

  return (
    <section className="card flow" aria-labelledby="portfolio-heading">
      <h2 id="portfolio-heading">Portfolio</h2>

      <dl>
        <dt>Cash</dt>
        <dd>{formatUsdt(cash)}</dd>

        {portfolio && (
          <>
            <dt>Holdings value</dt>
            <dd>{formatUsdt(portfolio.totalValue)}</dd>
            <dt>Profit / loss</dt>
            <dd>{formatUsdt(portfolio.totalPl, { signed: true })}</dd>
          </>
        )}
      </dl>

      {isPending && <p className="muted">Loading prices…</p>}
      {isError && (
        <p role="alert" className="alert">
          Could not load all prices, so the totals are not available.
        </p>
      )}
    </section>
  );
}

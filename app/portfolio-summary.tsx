'use client';

import { formatUsdt } from '../lib/format';
import { usePortfolio } from '../lib/portfolio/use-portfolio';
import { useTrading } from '../lib/trading/store';

export function PortfolioSummary() {
  const cash = useTrading((s) => s.cash);
  const { portfolio, isPending, isError } = usePortfolio();

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

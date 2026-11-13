'use client';

import { formatUsdt } from '../lib/format';
import { usePrice } from '../lib/market/queries';
import { usePortfolio } from '../lib/portfolio/use-portfolio';

// Coin, current price and the P/L of the held quantity, centered above the chart.
export function CoinHeader({ symbol }: { symbol: string }) {
  const coin = symbol.replace(/USDT$/, '');
  const { data: price, isPending, isError } = usePrice(symbol);
  const { portfolio } = usePortfolio();
  // only shown for a coin we hold, and once all prices are there
  const pl = portfolio?.positions[symbol]?.pl;

  return (
    <header className="coin-header">
      <h2>{coin}</h2>
      {isPending && <p className="muted">Loading price…</p>}
      {isError && <p className="muted">Price unavailable</p>}
      {price !== undefined && <p className="coin-price">{formatUsdt(price)}</p>}
      {pl !== undefined && (
        <p>
          PnL:{' '}
          <span
            className={pl > 0 ? 'positive' : pl < 0 ? 'negative' : undefined}
          >
            {formatUsdt(pl, { signed: true })}
          </span>
        </p>
      )}
    </header>
  );
}

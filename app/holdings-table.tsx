'use client';

import { formatQty, formatUsdt } from '../lib/format';
import { usePortfolio } from '../lib/portfolio/use-portfolio';

export function HoldingsTable() {
  const { portfolio, isPending, isError } = usePortfolio();
  const positions = portfolio ? Object.entries(portfolio.positions) : [];

  return (
    <section className="card flow span-all" aria-labelledby="holdings-heading">
      <h2 id="holdings-heading">Holdings</h2>

      {isPending && <p className="muted">Loading prices…</p>}
      {isError && (
        <p role="alert" className="alert">
          Could not load all prices, so the holdings are not available.
        </p>
      )}
      {portfolio && positions.length === 0 && (
        <p className="muted">No holdings yet.</p>
      )}

      {positions.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Coin</th>
              <th scope="col">Quantity</th>
              <th scope="col">Avg. cost</th>
              <th scope="col">Price</th>
              <th scope="col">Value</th>
              <th scope="col">P/L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(([symbol, p]) => (
              <tr key={symbol}>
                <th scope="row">{symbol}</th>
                <td>{formatQty(p.qty)}</td>
                <td>{formatUsdt(p.avgCost)}</td>
                <td>{formatUsdt(p.price)}</td>
                <td>{formatUsdt(p.value)}</td>
                <td>{formatUsdt(p.pl, { signed: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

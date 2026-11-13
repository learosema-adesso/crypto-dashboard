'use client';

import { formatQty, formatUsdt } from '../lib/format';
import { useTrading } from '../lib/trading/store';

export function TransactionHistory() {
  const trades = useTrading((s) => s.trades);
  // newest first, copy because the store array must not be mutated
  const rows = [...trades].reverse();

  return (
    <section className="card flow span-all" aria-labelledby="history-heading">
      <h2 id="history-heading">Transactions</h2>

      {rows.length === 0 ? (
        <p className="muted">No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Coin</th>
              <th scope="col">Side</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <time dateTime={new Date(t.ts).toISOString()}>
                    {new Date(t.ts).toLocaleString()}
                  </time>
                </td>
                <th scope="row">{t.symbol}</th>
                <td>{t.side === 'buy' ? 'Buy' : 'Sell'}</td>
                <td>{formatQty(t.qty)}</td>
                <td>{formatUsdt(t.price)}</td>
                <td>{formatUsdt(t.qty * t.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

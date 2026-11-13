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
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Coin</th>
                <th scope="col">Side</th>
                <th scope="col" className="num">
                  Quantity
                </th>
                <th scope="col" className="num">
                  Price
                </th>
                <th scope="col" className="num">
                  Total
                </th>
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
                  <td className="num">{formatQty(t.qty)}</td>
                  <td className="num">{formatUsdt(t.price)}</td>
                  <td className="num">{formatUsdt(t.qty * t.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

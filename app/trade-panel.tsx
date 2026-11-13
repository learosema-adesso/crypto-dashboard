'use client';

import { useMemo, useState } from 'react';
import { usePrice } from '../lib/market/queries';
import { SYMBOLS } from '../lib/market/symbols';
import { useSelectedSymbol } from '../lib/market/use-selected-symbol';
import { computeHoldings } from '../lib/portfolio/holdings';
import { useTrading } from '../lib/trading/store';
import { validateTrade } from '../lib/trading/validate';

export function TradePanel() {
  const [symbol] = useSelectedSymbol();
  const { data: price, isPending, isError } = usePrice(symbol);

  const cash = useTrading((s) => s.cash);
  const trades = useTrading((s) => s.trades);
  const buy = useTrading((s) => s.buy);
  const sell = useTrading((s) => s.sell);
  // derived outside the selector, otherwise it returns a new object every time
  const holdings = useMemo(() => computeHoldings(trades), [trades]);

  const [qtyInput, setQtyInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const name = SYMBOLS.find((s) => s.symbol === symbol)?.name ?? symbol;

  function submit(side: 'buy' | 'sell') {
    if (price === undefined) return;

    const qty = Number(qtyInput);
    const message = validateTrade({
      side,
      qty,
      price,
      cash,
      held: holdings[symbol]?.qty ?? 0,
    });
    if (message) {
      setError(message);
      return;
    }

    (side === 'buy' ? buy : sell)(symbol, qty, price);
    setQtyInput('');
    setError(null);
  }

  return (
    <section className="card flow" aria-labelledby="trade-heading">
      <h2 id="trade-heading">Trade {name}</h2>

      {isPending && <p className="muted">Loading price…</p>}
      {isError && (
        <p role="alert" className="alert">
          Could not load the price. Trading is disabled.
        </p>
      )}
      {price !== undefined && <p>Price: {price} USDT</p>}

      <div>
        <label htmlFor="qty">Quantity </label>
        <input
          id="qty"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={qtyInput}
          onChange={(e) => {
            setQtyInput(e.target.value);
            setError(null);
          }}
        />
      </div>

      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}

      <div>
        <button
          type="button"
          disabled={price === undefined}
          onClick={() => submit('buy')}
        >
          Buy
        </button>{' '}
        <button
          type="button"
          disabled={price === undefined}
          onClick={() => submit('sell')}
        >
          Sell
        </button>
      </div>
    </section>
  );
}

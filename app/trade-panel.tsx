'use client';

import { useMemo, useRef, useState } from 'react';
import { usePrice } from '../lib/market/queries';
import { SYMBOLS } from '../lib/market/symbols';
import { useSelectedSymbol } from '../lib/market/use-selected-symbol';
import { computeHoldings } from '../lib/portfolio/holdings';
import { useTrading } from '../lib/trading/store';
import { amountToQty, qtyToAmount } from '../lib/trading/convert';
import { validateTrade } from '../lib/trading/validate';
import { CurrencyInput } from './currency-input';

export function TradePanel() {
  const [symbol] = useSelectedSymbol();
  const { data: price, isPending, isError } = usePrice(symbol);

  const cash = useTrading((s) => s.cash);
  const trades = useTrading((s) => s.trades);
  const buy = useTrading((s) => s.buy);
  const sell = useTrading((s) => s.sell);
  // derived outside the selector, otherwise it returns a new object every time
  const holdings = useMemo(() => computeHoldings(trades), [trades]);

  // both fields describe the same trade, editing one rewrites the other
  const [qtyInput, setQtyInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const coin = symbol.replace(/USDT$/, '');
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
    setAmountInput('');
    setError(null);
    // opening is declarative (command attributes), closing after a valid
    // trade depends on the validation result, so it needs this one call
    dialogRef.current?.close();
  }

  function changeQty(value: string) {
    setQtyInput(value);
    setAmountInput(price === undefined ? '' : qtyToAmount(value, price));
    setError(null);
  }

  function changeAmount(value: string) {
    setAmountInput(value);
    setQtyInput(price === undefined ? '' : amountToQty(value, price));
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

      <button
        type="button"
        className="trade-open"
        command="show-modal"
        commandfor="trade-dialog"
        disabled={price === undefined}
      >
        Trade
      </button>

      <dialog
        id="trade-dialog"
        ref={dialogRef}
        aria-labelledby="trade-heading"
        onClose={() => setError(null)}
      >
        <button
          type="button"
          className="dialog-close"
          command="close"
          commandfor="trade-dialog"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flow">
          <CurrencyInput
            id="amount"
            label="Amount"
            unit="USDT"
            value={amountInput}
            onChange={changeAmount}
          />
          <CurrencyInput
            id="qty"
            label="Quantity"
            unit={coin}
            value={qtyInput}
            onChange={changeQty}
          />

          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}

          <div className="trade-actions">
            <button
              type="button"
              disabled={price === undefined}
              onClick={() => submit('buy')}
            >
              Buy
            </button>
            <button
              type="button"
              disabled={price === undefined}
              onClick={() => submit('sell')}
            >
              Sell
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}

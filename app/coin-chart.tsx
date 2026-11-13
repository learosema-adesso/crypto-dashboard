'use client';

import { SYMBOLS } from '../lib/market/symbols';
import { useSelectedSymbol } from '../lib/market/use-selected-symbol';
import { CoinHeader } from './coin-header';
import { PriceChart } from './price-chart';

export function CoinChart() {
  const [symbol, setSymbol] = useSelectedSymbol();

  return (
    <section className="card flow span-all">
      <div>
        <label htmlFor="coin">Coin </label>
        <select
          id="coin"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          {SYMBOLS.map((s) => (
            <option key={s.symbol} value={s.symbol}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <CoinHeader symbol={symbol} />
      <PriceChart symbol={symbol} />
    </section>
  );
}

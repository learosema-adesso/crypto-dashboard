'use client';

import { useState } from 'react';
import { DEFAULT_SYMBOL, SYMBOLS } from '../lib/market/symbols';
import { PriceChart } from './price-chart';

export function CoinChart() {
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);

  return (
    <section>
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
      <PriceChart symbol={symbol} />
    </section>
  );
}

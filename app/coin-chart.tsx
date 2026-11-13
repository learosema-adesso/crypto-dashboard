'use client';

import { SYMBOLS } from '../lib/market/symbols';
import { useSelectedSymbol } from '../lib/market/use-selected-symbol';
import { Autocomplete } from './autocomplete';
import { CoinHeader } from './coin-header';
import { PriceChart } from './price-chart';

const COIN_OPTIONS = SYMBOLS.map((s) => ({ value: s.symbol, label: s.name }));

export function CoinChart() {
  const [symbol, setSymbol] = useSelectedSymbol();

  return (
    <section className="card flow span-all">
      <Autocomplete
        label="Coin"
        options={COIN_OPTIONS}
        value={symbol}
        onSelect={setSymbol}
      />
      <CoinHeader symbol={symbol} />
      <PriceChart symbol={symbol} />
    </section>
  );
}

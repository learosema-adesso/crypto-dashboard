'use client';

import dynamic from 'next/dynamic';
import { SYMBOLS } from '../lib/market/symbols';
import { useSelectedSymbol } from '../lib/market/use-selected-symbol';
import { Autocomplete } from './autocomplete';
import { CoinHeader } from './coin-header';

// Recharts is the largest dependency, so it loads in its own chunk. Same
// text as the chart's own loading state, so there is no flicker in between.
const PriceChart = dynamic(
  () => import('./price-chart').then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="muted">
        Loading chart…
      </p>
    ),
  },
);

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

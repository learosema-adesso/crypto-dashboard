'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useKlines, usePrice } from '../lib/market/queries';

function QueryJson({
  label,
  query,
}: {
  label: string;
  query: UseQueryResult<unknown>;
}) {
  return (
    <section>
      <h2>{label}</h2>
      {query.isPending && <p>Loading…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.isSuccess && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
    </section>
  );
}

export function MarketJson({ symbol }: { symbol: string }) {
  const price = usePrice(symbol);
  const klines = useKlines(symbol);
  return (
    <>
      <QueryJson label={`Price ${symbol}`} query={price} />
      <QueryJson label={`Klines ${symbol}`} query={klines} />
    </>
  );
}

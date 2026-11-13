'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useKlines } from '../lib/market/queries';

export function PriceChart({ symbol }: { symbol: string }) {
  const { data, isPending, isError, error, refetch } = useKlines(symbol);

  if (isPending) return <p role="status">Loading chart…</p>;

  if (isError) {
    return (
      <div role="alert">
        <p>Could not load the chart: {error.message}</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div role="img" aria-label={`${symbol} price, last 24 hours`}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t: number) =>
              new Date(t).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
          />
          <YAxis domain={['auto', 'auto']} width={80} />
          <Line
            dataKey="price"
            dot={false}
            isAnimationActive={false}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

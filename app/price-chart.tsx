'use client';

import { useId } from 'react';
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { formatUsdt } from '../lib/format';
import { useKlines } from '../lib/market/queries';

export function PriceChart({ symbol }: { symbol: string }) {
  const { data, isPending, isError, error, refetch } = useKlines(symbol);
  // useId can contain characters that are not safe inside url(#...)
  const gradientId = `price-fill-${useId().replace(/\W/g, '')}`;

  if (isPending) {
    return (
      <p role="status" className="muted">
        Loading chart…
      </p>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="alert flow">
        <p>Could not load the chart: {error.message}</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const last = data[data.length - 1];

  return (
    <div role="img" aria-label={`${symbol} price, last 24 hours`}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-chart-line)"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="var(--color-chart-line)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
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
          <YAxis
            orientation="right"
            domain={['auto', 'auto']}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          {/* close 24 h ago, the first point of the klines */}
          <ReferenceLine
            y={data[0].price}
            stroke="var(--color-text-muted)"
            strokeDasharray="2 4"
            ifOverflow="extendDomain"
            label={{
              value: 'Prev close',
              position: 'insideBottomLeft',
              fill: 'var(--color-text-muted)',
            }}
          />
          {/* latest price: dot at the end of the line, value at the right edge */}
          <ReferenceDot
            x={last.time}
            y={last.price}
            r={4}
            fill="var(--color-chart-line)"
            stroke="var(--color-surface)"
            ifOverflow="extendDomain"
            label={{
              value: formatUsdt(last.price),
              position: 'right',
              fill: 'var(--color-chart-line)',
            }}
          />
          <Area
            dataKey="price"
            dot={false}
            stroke="var(--color-chart-line)"
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

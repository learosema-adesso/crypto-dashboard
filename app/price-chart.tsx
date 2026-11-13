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
import type { PricePoint } from '../lib/market/mapping';
import { useKlines, usePrice } from '../lib/market/queries';

// Filled tag in the axis column, vertically centered on the last price.
// Number only (the unit is in the header), so it fits the 80px axis.
function LastPriceTag({
  x = 0,
  y = 0,
  price,
}: {
  x?: number;
  y?: number;
  price: number;
}) {
  const width = 72;
  const height = 22;
  return (
    <g className="last-price-tag">
      <rect
        x={x + 6}
        y={y - height / 2}
        width={width}
        height={height}
        rx={4}
        fill="var(--color-chart-line)"
      />
      <text
        x={x + 6 + width / 2}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-surface)"
        fontSize={12}
        fontWeight={600}
      >
        {price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </text>
    </g>
  );
}

// The klines only change every 15 minutes. The live price (polled every 10 s,
// same query as the header) becomes the last point of the line, so chart and
// header show the same number. Without a live price (loading or failed) the
// chart falls back to the klines alone.
export function withLivePrice(
  klines: PricePoint[],
  price: number | undefined,
  time: number,
): PricePoint[] {
  if (price === undefined || time <= klines[klines.length - 1].time) {
    return klines;
  }
  return [...klines, { time, price }];
}

export function PriceChart({ symbol }: { symbol: string }) {
  const {
    data: klines,
    isPending,
    isError,
    error,
    refetch,
  } = useKlines(symbol);
  const { data: livePrice, dataUpdatedAt: livePriceTime } = usePrice(symbol);
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

  const data = withLivePrice(klines, livePrice, livePriceTime);
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
            label={(props: { x?: number; y?: number }) => (
              <LastPriceTag x={props.x} y={props.y} price={last.price} />
            )}
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

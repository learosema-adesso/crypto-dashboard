export type PricePoint = { time: number; price: number };

function toNumber(value: unknown, label: string): number {
  const n = Number(value);
  if (value === null || value === '' || !Number.isFinite(n)) {
    throw new Error(`Invalid ${label}: ${String(value)}`);
  }
  return n;
}

// Kline = [openTime, open, high, low, close, ...] → index 0 = time (ms), 4 = close
export function mapKlines(data: unknown): PricePoint[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid klines response: expected an array');
  }
  if (data.length === 0) {
    throw new Error('Invalid klines response: empty array');
  }
  return data.map((kline, i) => {
    if (!Array.isArray(kline)) {
      throw new Error(`Invalid kline at index ${i}: expected an array`);
    }
    return {
      time: toNumber(kline[0], `kline time at index ${i}`),
      price: toNumber(kline[4], `kline close at index ${i}`),
    };
  });
}

// Ticker = { symbol, price } with price as a string
export function mapPrice(data: unknown): number {
  if (typeof data !== 'object' || data === null || !('price' in data)) {
    throw new Error('Invalid price response: missing price');
  }
  return toNumber(data.price, 'price');
}

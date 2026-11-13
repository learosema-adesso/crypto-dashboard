const BASE = 'https://data-api.binance.vision/api/v3';

async function getJson(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  const res = await fetch(`${BASE}/${path}?${new URLSearchParams(params)}`);
  if (!res.ok) {
    throw new Error(`Binance request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// 96 × 15 min = 24 h
export function fetchKlines(symbol: string): Promise<unknown> {
  return getJson('klines', { symbol, interval: '15m', limit: '96' });
}

export function fetchPrice(symbol: string): Promise<unknown> {
  return getJson('ticker/price', { symbol });
}

import { mapKlines, mapPrice, type PricePoint } from './mapping';

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
export async function fetchKlines(symbol: string): Promise<PricePoint[]> {
  return mapKlines(
    await getJson('klines', { symbol, interval: '15m', limit: '96' }),
  );
}

export async function fetchPrice(symbol: string): Promise<number> {
  return mapPrice(await getJson('ticker/price', { symbol }));
}

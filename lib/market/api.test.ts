import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchKlines, fetchPrice } from './api';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('fetchKlines', () => {
  it('requests 96 candles of 15 minutes (24 h)', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    await fetchKlines('BTCUSDT');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=15m&limit=96',
    );
  });

  it('returns the unmodified payload', async () => {
    const payload = [[1, '1', '2', '0.5', '1.5']];
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload });

    await expect(fetchKlines('BTCUSDT')).resolves.toBe(payload);
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    await expect(fetchKlines('BTCUSDT')).rejects.toThrow(
      'Binance request failed: 500 Server Error',
    );
  });
});

describe('fetchPrice', () => {
  it('requests the ticker price for the symbol', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await fetchPrice('ETHUSDT');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://data-api.binance.vision/api/v3/ticker/price?symbol=ETHUSDT',
    );
  });

  it('returns the unmodified payload', async () => {
    const payload = { symbol: 'ETHUSDT', price: '3000.00' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload });

    await expect(fetchPrice('ETHUSDT')).resolves.toBe(payload);
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(fetchPrice('ETHUSDT')).rejects.toThrow(
      'Binance request failed: 429 Too Many Requests',
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchKlines, fetchPrice } from './api';
import { klinesQuery, priceQuery, useKlines, usePrice } from './queries';

vi.mock('./api');

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('priceQuery', () => {
  it('uses one query key per symbol', () => {
    expect(priceQuery('BTCUSDT').queryKey).toEqual(['price', 'BTCUSDT']);
    expect(priceQuery('ETHUSDT').queryKey).toEqual(['price', 'ETHUSDT']);
  });

  it('refetches every 10 seconds', () => {
    expect(priceQuery('BTCUSDT').refetchInterval).toBe(10_000);
  });
});

describe('klinesQuery', () => {
  it('uses one query key per symbol', () => {
    expect(klinesQuery('BTCUSDT').queryKey).toEqual(['klines', 'BTCUSDT']);
    expect(klinesQuery('ETHUSDT').queryKey).toEqual(['klines', 'ETHUSDT']);
  });
});

describe('usePrice', () => {
  it('fetches the price for the symbol', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(65000);

    const { result } = renderHook(() => usePrice('BTCUSDT'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(65000);
    expect(fetchPrice).toHaveBeenCalledWith('BTCUSDT');
  });

  it('polls and picks up new prices', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(fetchPrice).mockResolvedValueOnce(65000);
      vi.mocked(fetchPrice).mockResolvedValueOnce(65100);

      const { result } = renderHook(() => usePrice('BTCUSDT'), { wrapper });

      await waitFor(() => expect(result.current.data).toBe(65000));
      await vi.advanceTimersByTimeAsync(10_000);
      await waitFor(() => expect(result.current.data).toBe(65100));
      expect(fetchPrice).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('exposes the error when the fetch fails', async () => {
    vi.mocked(fetchPrice).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => usePrice('BTCUSDT'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('boom');
  });
});

describe('useKlines', () => {
  it('fetches the klines for the symbol', async () => {
    const points = [{ time: 1, price: 1.5 }];
    vi.mocked(fetchKlines).mockResolvedValue(points);

    const { result } = renderHook(() => useKlines('ETHUSDT'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(points);
    expect(fetchKlines).toHaveBeenCalledWith('ETHUSDT');
  });

  it('exposes the error when the fetch fails', async () => {
    vi.mocked(fetchKlines).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useKlines('ETHUSDT'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('boom');
  });
});

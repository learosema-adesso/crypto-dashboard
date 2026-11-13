import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { fetchKlines, fetchPrice } from '../lib/market/api';
import { MarketJson } from '../app/market-json';

vi.mock('../lib/market/api');

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('MarketJson', () => {
  it('shows loading states while fetching', () => {
    vi.mocked(fetchPrice).mockReturnValue(new Promise(() => {}));
    vi.mocked(fetchKlines).mockReturnValue(new Promise(() => {}));

    renderWithClient(<MarketJson symbol="BTCUSDT" />);

    expect(screen.getAllByText('Loading…')).toHaveLength(2);
  });

  it('shows price and klines as JSON', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(65000);
    vi.mocked(fetchKlines).mockResolvedValue([{ time: 1, price: 1.5 }]);

    renderWithClient(<MarketJson symbol="BTCUSDT" />);

    expect(
      await screen.findByRole('heading', { name: 'Price BTCUSDT' }),
    ).toBeDefined();
    expect(await screen.findByText('65000')).toBeDefined();
    const klinesJson = await screen.findByText(/"price": 1\.5/);
    expect(klinesJson.textContent).toBe(
      JSON.stringify([{ time: 1, price: 1.5 }], null, 2),
    );
  });

  it('shows errors', async () => {
    vi.mocked(fetchPrice).mockRejectedValue(new Error('price down'));
    vi.mocked(fetchKlines).mockRejectedValue(new Error('klines down'));

    renderWithClient(<MarketJson symbol="BTCUSDT" />);

    expect(await screen.findByText('price down')).toBeDefined();
    expect(await screen.findByText('klines down')).toBeDefined();
  });
});

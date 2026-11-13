import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { PortfolioSummary } from '../app/portfolio-summary';
import { fetchPrice } from '../lib/market/api';
import { STARTING_CASH, useTrading } from '../lib/trading/store';

vi.mock('../lib/market/api');

function renderSummary() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PortfolioSummary />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  useTrading.setState({ cash: STARTING_CASH, trades: [] });
});

describe('PortfolioSummary', () => {
  it('shows the starting cash and zero totals without trades', async () => {
    renderSummary();

    expect(screen.getByText('10,000.00 USDT')).toBeDefined();
    // holdings value and P/L are both zero
    expect(screen.getAllByText('0.00 USDT')).toHaveLength(2);
    expect(screen.getByText('Holdings value')).toBeDefined();
    expect(screen.getByText('Profit / loss')).toBeDefined();
    expect(fetchPrice).not.toHaveBeenCalled();
  });

  it('shows cash, holdings value and positive P/L', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(150);
    useTrading.getState().buy('BTCUSDT', 2, 100);
    renderSummary();

    expect(await screen.findByText('300.00 USDT')).toBeDefined();
    expect(screen.getByText('9,800.00 USDT')).toBeDefined();
    expect(screen.getByText('+100.00 USDT')).toBeDefined();
    expect(fetchPrice).toHaveBeenCalledWith('BTCUSDT');
  });

  it('shows a negative P/L when the price fell', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(80);
    useTrading.getState().buy('BTCUSDT', 2, 100);
    renderSummary();

    expect(await screen.findByText('-40.00 USDT')).toBeDefined();
  });

  it('refreshes value and P/L when the price is polled again', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(fetchPrice).mockResolvedValueOnce(150);
      vi.mocked(fetchPrice).mockResolvedValueOnce(80);
      useTrading.getState().buy('BTCUSDT', 2, 100);
      renderSummary();

      expect(await screen.findByText('+100.00 USDT')).toBeDefined();

      await vi.advanceTimersByTimeAsync(10_000);

      expect(await screen.findByText('-40.00 USDT')).toBeDefined();
      expect(screen.getByText('160.00 USDT')).toBeDefined();
      expect(fetchPrice).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('adds up several symbols', async () => {
    vi.mocked(fetchPrice).mockImplementation(async (symbol) =>
      symbol === 'BTCUSDT' ? 200 : 5,
    );
    const { buy } = useTrading.getState();
    buy('BTCUSDT', 1, 100);
    buy('ETHUSDT', 10, 10);
    renderSummary();

    // value 200 + 50, cost 100 + 100
    expect(await screen.findByText('250.00 USDT')).toBeDefined();
    expect(screen.getByText('+50.00 USDT')).toBeDefined();
  });

  it('shows cash but no totals while prices are loading', () => {
    vi.mocked(fetchPrice).mockReturnValue(new Promise(() => {}));
    useTrading.getState().buy('BTCUSDT', 1, 100);
    renderSummary();

    expect(screen.getByText('9,900.00 USDT')).toBeDefined();
    expect(screen.getByText('Loading prices…')).toBeDefined();
    expect(screen.queryByText('Holdings value')).toBeNull();
  });

  it('says so and hides the totals when a price fails to load', async () => {
    vi.mocked(fetchPrice).mockRejectedValue(new Error('boom'));
    useTrading.getState().buy('BTCUSDT', 1, 100);
    renderSummary();

    expect((await screen.findByRole('alert')).textContent).toMatch(
      /could not load all prices/i,
    );
    expect(screen.getByText('9,900.00 USDT')).toBeDefined();
    expect(screen.queryByText('Holdings value')).toBeNull();
  });
});

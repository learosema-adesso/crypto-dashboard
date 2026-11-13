import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { fetchKlines } from '../lib/market/api';
import { PriceChart } from '../app/price-chart';

vi.mock('../lib/market/api');
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    // jsdom has no layout, so give the container a fixed size
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
      <actual.ResponsiveContainer
        width={600}
        height={320}
        initialDimension={{ width: 600, height: 320 }}
      >
        {children}
      </actual.ResponsiveContainer>
    ),
  };
});

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

describe('PriceChart', () => {
  it('renders a line for the klines', async () => {
    vi.mocked(fetchKlines).mockResolvedValue([
      { time: 1_700_000_000_000, price: 100 },
      { time: 1_700_000_900_000, price: 110 },
      { time: 1_700_001_800_000, price: 105 },
    ]);

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    expect(
      await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' }),
    ).toBeDefined();
    expect(fetchKlines).toHaveBeenCalledWith('BTCUSDT');
    expect(container.querySelector('.recharts-line-curve')).not.toBeNull();
  });

  it('renders nothing while loading', () => {
    vi.mocked(fetchKlines).mockReturnValue(new Promise(() => {}));

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('renders nothing when the request fails', async () => {
    vi.mocked(fetchKlines).mockRejectedValue(new Error('klines down'));

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    await vi.waitFor(() => expect(fetchKlines).toHaveBeenCalled());
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });
});

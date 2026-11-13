import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  it('renders a line with a gradient fill for the klines', async () => {
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
    expect(container.querySelector('.recharts-area-curve')).not.toBeNull();

    const gradient = container.querySelector('linearGradient');
    expect(gradient?.id).toBeTruthy();
    expect(gradient?.querySelectorAll('stop')).toHaveLength(2);
    expect(
      container.querySelector('.recharts-area-area')?.getAttribute('fill'),
    ).toBe(`url(#${gradient?.id})`);
  });

  it('draws the price axis without axis and tick lines', async () => {
    vi.mocked(fetchKlines).mockResolvedValue([
      { time: 1_700_000_000_000, price: 100 },
      { time: 1_700_000_900_000, price: 110 },
    ]);

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' });
    // jsdom has no layout, so tick labels and the side of the axis can't be checked here
    const yAxis = container.querySelector('.recharts-yAxis');
    expect(yAxis).not.toBeNull();
    expect(
      yAxis?.querySelector('.recharts-cartesian-axis-tick'),
    ).not.toBeNull();
    expect(yAxis?.querySelector('.recharts-cartesian-axis-line')).toBeNull();
    expect(
      yAxis?.querySelector('.recharts-cartesian-axis-tick-line'),
    ).toBeNull();
  });

  it('draws a dashed "Prev close" line at the first kline price', async () => {
    vi.mocked(fetchKlines).mockResolvedValue([
      { time: 1_700_000_000_000, price: 100 },
      { time: 1_700_000_900_000, price: 110 },
      { time: 1_700_001_800_000, price: 105 },
    ]);

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' });
    const line = container.querySelector('.recharts-reference-line line');
    expect(line).not.toBeNull();
    expect(line?.getAttribute('stroke-dasharray')).toBe('2 4');
    // Recharts draws the label in its own layer, outside the line's group
    expect(container.querySelector('.recharts-label')?.textContent).toBe(
      'Prev close',
    );
  });

  it('places the "Prev close" line at the first price, not the last', async () => {
    const render = async (prices: number[]) => {
      vi.mocked(fetchKlines).mockResolvedValue(
        prices.map((price, i) => ({
          time: 1_700_000_000_000 + i * 900_000,
          price,
        })),
      );
      const { container, unmount } = renderWithClient(
        <PriceChart symbol="BTCUSDT" />,
      );
      await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' });
      const y = container
        .querySelector('.recharts-reference-line line')
        ?.getAttribute('y1');
      unmount();
      return y;
    };

    // same first price, different last price: the line must not move
    expect(await render([100, 120, 140])).toBe(await render([100, 120, 110]));
    // different first price: the line moves
    expect(await render([100, 120, 140])).not.toBe(
      await render([110, 120, 140]),
    );
  });

  it('marks the last price with a dot and a value label', async () => {
    vi.mocked(fetchKlines).mockResolvedValue([
      { time: 1_700_000_000_000, price: 100 },
      { time: 1_700_000_900_000, price: 110 },
      { time: 1_700_001_800_000, price: 105 },
    ]);

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' });
    expect(container.querySelector('.recharts-reference-dot')).not.toBeNull();
    const labels = [...container.querySelectorAll('.recharts-label')].map(
      (e) => e.textContent,
    );
    // not the first (100) and not the highest (110) price
    expect(labels).toContain('105.00 USDT');
    expect(labels).not.toContain('100.00 USDT');
    expect(labels).not.toContain('110.00 USDT');
  });

  it('moves the dot with the last price', async () => {
    const dotY = async (prices: number[]) => {
      vi.mocked(fetchKlines).mockResolvedValue(
        prices.map((price, i) => ({
          time: 1_700_000_000_000 + i * 900_000,
          price,
        })),
      );
      const { container, unmount } = renderWithClient(
        <PriceChart symbol="BTCUSDT" />,
      );
      await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' });
      const dot = container.querySelector('.recharts-reference-dot-dot');
      const attrs = [dot?.getAttribute('cx'), dot?.getAttribute('cy')];
      unmount();
      return attrs;
    };

    // same first price, different last price: the dot moves
    expect(await dotY([100, 120, 110])).not.toEqual(
      await dotY([100, 120, 130]),
    );
    // the dot sits at the right end for any series
    expect((await dotY([100, 120, 110]))[0]).toBe(
      (await dotY([100, 120, 130]))[0],
    );
  });

  it('shows a loading state while fetching', () => {
    vi.mocked(fetchKlines).mockReturnValue(new Promise(() => {}));

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    expect(screen.getByRole('status').textContent).toBe('Loading chart…');
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('shows the error with a retry button when the request fails', async () => {
    vi.mocked(fetchKlines).mockRejectedValue(new Error('klines down'));

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('klines down');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('refetches and shows the chart after a retry', async () => {
    vi.mocked(fetchKlines)
      .mockRejectedValueOnce(new Error('klines down'))
      .mockResolvedValueOnce([
        { time: 1_700_000_000_000, price: 100 },
        { time: 1_700_000_900_000, price: 110 },
      ]);

    const { container } = renderWithClient(<PriceChart symbol="BTCUSDT" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(
      await screen.findByRole('img', { name: 'BTCUSDT price, last 24 hours' }),
    ).toBeDefined();
    expect(fetchKlines).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(container.querySelector('.recharts-area-curve')).not.toBeNull();
  });

  it('shows the error again when the retry fails too', async () => {
    vi.mocked(fetchKlines)
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'));

    renderWithClient(<PriceChart symbol="BTCUSDT" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'second failure',
    );
    expect(fetchKlines).toHaveBeenCalledTimes(2);
  });
});

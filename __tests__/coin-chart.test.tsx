import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { CoinChart } from '../app/coin-chart';
import { SYMBOLS } from '../lib/market/symbols';

const replace = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(search),
}));

vi.mock('../app/price-chart', () => ({
  PriceChart: ({ symbol }: { symbol: string }) => <p>chart {symbol}</p>,
}));

vi.mock('../app/coin-header', () => ({
  CoinHeader: ({ symbol }: { symbol: string }) => <p>header {symbol}</p>,
}));

const coinInput = () =>
  screen.getByRole<HTMLInputElement>('combobox', { name: 'Coin' });

beforeEach(() => {
  replace.mockReset();
  search = '';
});

afterEach(cleanup);

describe('CoinChart', () => {
  // Must stay the first test: next/dynamic caches the chunk after its first
  // load, so later renders never show the fallback.
  it('shows the loading state until the chart chunk has loaded', async () => {
    render(<CoinChart />);

    expect(screen.getByText('Loading chart…')).toBeDefined();
    expect(await screen.findByText('chart BTCUSDT')).toBeDefined();
    expect(screen.queryByText('Loading chart…')).toBeNull();
  });

  it('starts with BTC and offers all coins', async () => {
    render(<CoinChart />);

    expect(coinInput().value).toBe('Bitcoin (BTC)');
    expect(await screen.findByText('chart BTCUSDT')).toBeDefined();

    fireEvent.focus(coinInput());
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(
      SYMBOLS.map((s) => s.name),
    );
  });

  it('spans the full row of the card grid', () => {
    const { container } = render(<CoinChart />);

    expect(container.querySelector('section')?.classList).toContain('span-all');
  });

  it('shows the chart of the coin from the URL', async () => {
    search = 'coin=ETHUSDT';
    render(<CoinChart />);

    expect(coinInput().value).toBe('Ethereum (ETH)');
    expect(await screen.findByText('chart ETHUSDT')).toBeDefined();
    expect(screen.queryByText('chart BTCUSDT')).toBeNull();
  });

  it('shows the header of the selected coin above the chart', async () => {
    search = 'coin=ETHUSDT';
    const { container } = render(<CoinChart />);

    const header = screen.getByText('header ETHUSDT');
    const chart = await screen.findByText('chart ETHUSDT');
    expect(
      header.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(container.querySelector('section')?.contains(header)).toBe(true);
  });

  it('falls back to BTC for an unknown coin in the URL', async () => {
    search = 'coin=LTCUSDT';
    render(<CoinChart />);

    expect(coinInput().value).toBe('Bitcoin (BTC)');
    expect(await screen.findByText('chart BTCUSDT')).toBeDefined();
  });

  it('writes the selected coin into the URL', () => {
    render(<CoinChart />);
    fireEvent.focus(coinInput());

    fireEvent.click(screen.getByRole('option', { name: 'Ethereum (ETH)' }));

    expect(replace).toHaveBeenCalledWith('/?coin=ETHUSDT', { scroll: false });
  });

  it('selects a coin found by searching', () => {
    vi.useFakeTimers();
    try {
      render(<CoinChart />);
      fireEvent.focus(coinInput());

      fireEvent.change(coinInput(), { target: { value: 'sol' } });
      act(() => vi.advanceTimersByTime(300));
      fireEvent.click(screen.getByRole('option'));

      expect(replace).toHaveBeenCalledWith('/?coin=SOLUSDT', {
        scroll: false,
      });
    } finally {
      vi.useRealTimers();
    }
  });
});

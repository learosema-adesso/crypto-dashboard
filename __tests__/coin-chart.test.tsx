import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CoinChart } from '../app/coin-chart';

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

beforeEach(() => {
  replace.mockReset();
  search = '';
});

afterEach(cleanup);

describe('CoinChart', () => {
  it('offers BTC and ETH and starts with BTC', () => {
    render(<CoinChart />);

    const select = screen.getByRole<HTMLSelectElement>('combobox', {
      name: 'Coin',
    });
    expect(select.value).toBe('BTCUSDT');
    expect(
      screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value),
    ).toEqual(['BTCUSDT', 'ETHUSDT']);
    expect(screen.getByText('chart BTCUSDT')).toBeDefined();
  });

  it('spans the full row of the card grid', () => {
    const { container } = render(<CoinChart />);

    expect(container.querySelector('section')?.classList).toContain('span-all');
  });

  it('shows the chart of the coin from the URL', () => {
    search = 'coin=ETHUSDT';
    render(<CoinChart />);

    expect(
      screen.getByRole<HTMLSelectElement>('combobox', { name: 'Coin' }).value,
    ).toBe('ETHUSDT');
    expect(screen.getByText('chart ETHUSDT')).toBeDefined();
    expect(screen.queryByText('chart BTCUSDT')).toBeNull();
  });

  it('shows the header of the selected coin above the chart', () => {
    search = 'coin=ETHUSDT';
    const { container } = render(<CoinChart />);

    const header = screen.getByText('header ETHUSDT');
    const chart = screen.getByText('chart ETHUSDT');
    expect(
      header.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(container.querySelector('section')?.contains(header)).toBe(true);
  });

  it('falls back to BTC for an unknown coin in the URL', () => {
    search = 'coin=DOGEUSDT';
    render(<CoinChart />);

    expect(screen.getByText('chart BTCUSDT')).toBeDefined();
  });

  it('writes the selected coin into the URL', () => {
    render(<CoinChart />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Coin' }), {
      target: { value: 'ETHUSDT' },
    });

    expect(replace).toHaveBeenCalledWith('/?coin=ETHUSDT', { scroll: false });
  });
});

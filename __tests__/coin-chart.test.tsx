import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CoinChart } from '../app/coin-chart';

vi.mock('../app/price-chart', () => ({
  PriceChart: ({ symbol }: { symbol: string }) => <p>chart {symbol}</p>,
}));

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

  it('shows the chart of the selected coin', () => {
    render(<CoinChart />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Coin' }), {
      target: { value: 'ETHUSDT' },
    });

    expect(screen.getByText('chart ETHUSDT')).toBeDefined();
    expect(screen.queryByText('chart BTCUSDT')).toBeNull();
  });
});

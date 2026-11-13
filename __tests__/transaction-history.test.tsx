import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { TransactionHistory } from '../app/transaction-history';
import { STARTING_CASH, useTrading } from '../lib/trading/store';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  useTrading.setState({ cash: STARTING_CASH, trades: [] });
});

describe('TransactionHistory', () => {
  it('says there are no transactions without trades', () => {
    render(<TransactionHistory />);

    expect(screen.getByText('No transactions yet.')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows side, quantity, price and total of a trade', () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 0, 2, 3, 4, 5));
    useTrading.getState().buy('BTCUSDT', 0.5, 60_000);
    render(<TransactionHistory />);

    const row = within(screen.getByRole('row', { name: /BTCUSDT/ }));
    const cells = row.getAllByRole('cell').map((c) => c.textContent);
    expect(cells.slice(1)).toEqual([
      'Buy',
      '0.5',
      '60,000.00 USDT',
      '30,000.00 USDT',
    ]);
    expect(row.getByText(cells[0]!).getAttribute('datetime')).toBe(
      '2026-01-02T03:04:05.000Z',
    );
  });

  it('wraps the table in a scroll container and marks number columns', () => {
    useTrading.getState().buy('BTCUSDT', 1, 100);
    const { container } = render(<TransactionHistory />);

    expect(container.querySelector('.table-scroll > table')).not.toBeNull();
    expect(
      screen
        .getAllByRole('columnheader')
        .filter((h) => h.classList.contains('num'))
        .map((h) => h.textContent),
    ).toEqual(['Quantity', 'Price', 'Total']);
  });

  it('shows the newest trade first', () => {
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 1, 100);
    sell('ETHUSDT', 2, 50);
    render(<TransactionHistory />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('ETHUSDT');
    expect(rows[0].textContent).toContain('Sell');
    expect(rows[1].textContent).toContain('BTCUSDT');
  });

  it('does not reorder the trades in the store', () => {
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 1, 100);
    sell('BTCUSDT', 1, 100);
    render(<TransactionHistory />);

    expect(useTrading.getState().trades.map((t) => t.side)).toEqual([
      'buy',
      'sell',
    ]);
  });

  it('updates when a new trade is added', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('No transactions yet.')).toBeDefined();

    act(() => useTrading.getState().buy('BTCUSDT', 1, 100));

    expect(screen.queryByText('No transactions yet.')).toBeNull();
    expect(screen.getByRole('row', { name: /BTCUSDT/ })).toBeDefined();
  });
});

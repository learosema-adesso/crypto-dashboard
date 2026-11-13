import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { HoldingsTable } from '../app/holdings-table';
import { fetchPrice } from '../lib/market/api';
import { STARTING_CASH, useTrading } from '../lib/trading/store';

vi.mock('../lib/market/api');

function renderTable() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HoldingsTable />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  useTrading.setState({ cash: STARTING_CASH, trades: [] });
});

describe('HoldingsTable', () => {
  it('says there are no holdings without trades', () => {
    renderTable();

    expect(screen.getByText('No holdings yet.')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
    expect(fetchPrice).not.toHaveBeenCalled();
  });

  it('shows quantity, average cost, price, value and P/L per coin', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(250);
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 1, 100);
    buy('BTCUSDT', 3, 200);
    sell('BTCUSDT', 2, 300);
    renderTable();

    const row = within(await screen.findByRole('row', { name: /BTCUSDT/ }));
    expect(row.getAllByRole('cell').map((c) => c.textContent)).toEqual([
      '2',
      '175.00 USDT',
      '250.00 USDT',
      '500.00 USDT',
      '+150.00 USDT',
    ]);
  });

  it('wraps the table in a scroll container and marks number columns', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(250);
    useTrading.getState().buy('BTCUSDT', 1, 100);
    const { container } = renderTable();

    await screen.findByRole('table');

    expect(container.querySelector('.table-scroll > table')).not.toBeNull();
    expect(
      screen
        .getAllByRole('columnheader')
        .filter((h) => h.classList.contains('num'))
        .map((h) => h.textContent),
    ).toEqual(['Quantity', 'Avg. cost', 'Price', 'Value', 'P/L']);
    expect(
      within(screen.getByRole('row', { name: /BTCUSDT/ }))
        .getAllByRole('cell')
        .every((c) => c.classList.contains('num')),
    ).toBe(true);
  });

  it('shows a negative P/L when the price fell', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(80);
    useTrading.getState().buy('BTCUSDT', 2, 100);
    renderTable();

    expect(await screen.findByText('-40.00 USDT')).toBeDefined();
  });

  it('lists every held coin and hides fully sold ones', async () => {
    vi.mocked(fetchPrice).mockResolvedValue(10);
    const { buy, sell } = useTrading.getState();
    buy('BTCUSDT', 1, 10);
    buy('ETHUSDT', 1, 10);
    sell('BTCUSDT', 1, 10);
    renderTable();

    expect(await screen.findByRole('row', { name: /ETHUSDT/ })).toBeDefined();
    expect(screen.queryByRole('row', { name: /BTCUSDT/ })).toBeNull();
  });

  it('shows a loading hint and no table while prices load', () => {
    vi.mocked(fetchPrice).mockReturnValue(new Promise(() => {}));
    useTrading.getState().buy('BTCUSDT', 1, 100);
    renderTable();

    expect(screen.getByText('Loading prices…')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('says so and shows no table when a price fails to load', async () => {
    vi.mocked(fetchPrice).mockRejectedValue(new Error('boom'));
    useTrading.getState().buy('BTCUSDT', 1, 100);
    renderTable();

    expect((await screen.findByRole('alert')).textContent).toMatch(
      /could not load all prices/i,
    );
    expect(screen.queryByRole('table')).toBeNull();
  });
});

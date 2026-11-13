import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { TradePanel } from '../app/trade-panel';
import { usePrice } from '../lib/market/queries';
import { STARTING_CASH, useTrading } from '../lib/trading/store';

let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('../lib/market/queries');

const priceState = (state: object) =>
  vi.mocked(usePrice).mockReturnValue(state as ReturnType<typeof usePrice>);

beforeEach(() => {
  search = '';
  priceState({ data: 100, isPending: false, isError: false });
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  useTrading.setState({ cash: STARTING_CASH, trades: [] });
});

function trade(side: 'Buy' | 'Sell', qty: string) {
  fireEvent.change(screen.getByLabelText('Quantity'), {
    target: { value: qty },
  });
  fireEvent.click(screen.getByRole('button', { name: side }));
}

describe('TradePanel', () => {
  it('shows the unit of the selected coin on the quantity field', () => {
    search = 'coin=ETHUSDT';
    render(<TradePanel />);

    expect(screen.getByText('ETH')).toBeDefined();
    expect(screen.getByText('USDT')).toBeDefined();
  });

  it('derives the amount from the quantity', () => {
    render(<TradePanel />);

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '2' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe(
      '200.00',
    );
  });

  it('derives the quantity from the amount', () => {
    render(<TradePanel />);

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '250' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe(
      '2.5',
    );
  });

  it('buys the quantity derived from an amount', () => {
    render(<TradePanel />);

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '300' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));

    expect(useTrading.getState().trades).toMatchObject([
      { side: 'buy', qty: 3, price: 100 },
    ]);
  });

  it('clears both fields after a trade', () => {
    render(<TradePanel />);

    trade('Buy', '2');

    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe('');
  });

  it('clears the other field when one is emptied', () => {
    render(<TradePanel />);
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '2' },
    });

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe('');
  });

  it('does not derive a value while the price is unknown', () => {
    priceState({ data: undefined, isPending: true, isError: false });
    render(<TradePanel />);

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe('');
  });

  it('clears the error when the amount changes', () => {
    render(<TradePanel />);
    trade('Buy', '0');
    expect(screen.getByRole('alert')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the selected coin and its price', () => {
    search = 'coin=ETHUSDT';
    render(<TradePanel />);

    expect(
      screen.getByRole('heading', { name: 'Trade Ethereum (ETH)' }),
    ).toBeDefined();
    expect(screen.getByText('Price: 100 USDT')).toBeDefined();
    expect(usePrice).toHaveBeenCalledWith('ETHUSDT');
  });

  it('buys at the current price and clears the input', () => {
    render(<TradePanel />);

    trade('Buy', '2');

    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(STARTING_CASH - 200);
    expect(trades).toMatchObject([
      { symbol: 'BTCUSDT', side: 'buy', qty: 2, price: 100 },
    ]);
    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('trades the coin from the URL', () => {
    search = 'coin=ETHUSDT';
    render(<TradePanel />);

    trade('Buy', '1');

    expect(useTrading.getState().trades[0].symbol).toBe('ETHUSDT');
  });

  it('sells what was bought', () => {
    render(<TradePanel />);

    trade('Buy', '3');
    trade('Sell', '1');

    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(STARTING_CASH - 300 + 100);
    expect(trades.map((t) => t.side)).toEqual(['buy', 'sell']);
  });

  it('rejects a buy without enough cash', () => {
    render(<TradePanel />);

    trade('Buy', '101');

    expect(screen.getByRole('alert').textContent).toMatch(/not enough cash/i);
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('rejects a sell without holdings', () => {
    render(<TradePanel />);

    trade('Sell', '1');

    expect(screen.getByRole('alert').textContent).toMatch(
      /do not hold enough/i,
    );
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('only counts holdings of the selected coin', () => {
    render(<TradePanel />);
    trade('Buy', '1');

    cleanup();
    search = 'coin=ETHUSDT';
    render(<TradePanel />);
    trade('Sell', '1');

    expect(screen.getByRole('alert').textContent).toMatch(
      /do not hold enough/i,
    );
    expect(useTrading.getState().trades).toHaveLength(1);
  });

  it.each([['0'], ['-1'], ['']])('rejects the quantity "%s"', (qty) => {
    render(<TradePanel />);

    trade('Buy', qty);

    expect(screen.getByRole('alert').textContent).toMatch(/quantity/i);
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('clears the error when the quantity changes', () => {
    render(<TradePanel />);
    trade('Buy', '0');
    expect(screen.getByRole('alert')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '1' },
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables trading while the price is loading', () => {
    priceState({ data: undefined, isPending: true, isError: false });
    render(<TradePanel />);

    expect(screen.getByText('Loading price…')).toBeDefined();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Buy' }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Sell' }).disabled,
    ).toBe(true);
  });

  it('disables trading and says so when the price failed to load', () => {
    priceState({ data: undefined, isPending: false, isError: true });
    render(<TradePanel />);

    expect(
      within(screen.getByRole('alert')).getByText(/could not load the price/i),
    ).toBeDefined();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Buy' }).disabled,
    ).toBe(true);
  });
});

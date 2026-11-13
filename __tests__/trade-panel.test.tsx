import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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

// jsdom has no dialog behaviour: showModal/close only toggle `open`
beforeAll(async () => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  // makes the command attributes work like in a browser without support
  await import('invokers-polyfill');
});

function renderPanel() {
  const result = render(<TradePanel />);
  result.container.querySelector('dialog')?.showModal();
  return result;
}

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

describe('TradePanel dialog', () => {
  it('opens the form from the Trade button via command attributes', () => {
    render(<TradePanel />);
    const dialog = document.querySelector('dialog')!;
    const open = screen.getByRole('button', { name: 'Trade' });

    expect(open.getAttribute('command')).toBe('show-modal');
    expect(open.getAttribute('commandfor')).toBe(dialog.id);
    expect(dialog.hasAttribute('open')).toBe(false);

    fireEvent.click(open);

    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('closes via the close button', () => {
    renderPanel();
    const dialog = document.querySelector('dialog')!;
    const close = screen.getByRole('button', { name: 'Close' });

    expect(close.getAttribute('command')).toBe('close');
    expect(close.getAttribute('commandfor')).toBe(dialog.id);

    fireEvent.click(close);

    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('is labelled by the heading', () => {
    renderPanel();
    const dialog = document.querySelector('dialog')!;
    expect(dialog.getAttribute('aria-labelledby')).toBe('trade-heading');
    expect(document.getElementById('trade-heading')).not.toBeNull();
  });

  it('closes after a valid trade', () => {
    renderPanel();

    trade('Buy', '1');

    expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('stays open and shows the error after an invalid trade', () => {
    renderPanel();

    trade('Buy', '0');

    expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('forgets the error when the dialog is closed', () => {
    renderPanel();
    trade('Buy', '0');

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    document.querySelector('dialog')!.showModal();

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables the Trade button while the price is unknown', () => {
    priceState({ data: undefined, isPending: true, isError: false });
    render(<TradePanel />);

    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Trade' }).disabled,
    ).toBe(true);
  });
});

describe('TradePanel live region', () => {
  it('is an empty polite status region outside the dialog before a trade', () => {
    renderPanel();
    const status = screen.getByRole('status');

    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('');
    expect(document.querySelector('dialog')?.contains(status)).toBe(false);
  });

  it('announces a buy', () => {
    renderPanel();

    trade('Buy', '2');

    expect(screen.getByRole('status').textContent).toBe(
      'Bought 2 BTC at 100.00 USDT.',
    );
  });

  it('announces a sell with the coin of the URL', () => {
    search = 'coin=ETHUSDT';
    renderPanel();
    trade('Buy', '3');
    document.querySelector('dialog')!.showModal();

    trade('Sell', '1');

    expect(screen.getByRole('status').textContent).toBe(
      'Sold 1 ETH at 100.00 USDT.',
    );
  });

  it('announces nothing for a rejected trade', () => {
    renderPanel();

    trade('Buy', '101');

    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('keeps the old result out of the way when a new trade is typed', () => {
    renderPanel();
    trade('Buy', '1');
    document.querySelector('dialog')!.showModal();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '50' },
    });

    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('does not announce price updates', () => {
    const { rerender } = renderPanel();
    priceState({ data: 105, isPending: false, isError: false });

    rerender(<TradePanel />);

    expect(screen.getByRole('status').textContent).toBe('');
  });
});

describe('TradePanel', () => {
  it('shows the unit of the selected coin on the quantity field', () => {
    search = 'coin=ETHUSDT';
    renderPanel();

    expect(screen.getByText('ETH')).toBeDefined();
    expect(screen.getByText('USDT')).toBeDefined();
  });

  it('derives the amount from the quantity', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '2' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe(
      '200.00',
    );
  });

  it('derives the quantity from the amount', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '250' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe(
      '2.5',
    );
  });

  it('buys the quantity derived from an amount', () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '300' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buy' }));

    expect(useTrading.getState().trades).toMatchObject([
      { side: 'buy', qty: 3, price: 100 },
    ]);
  });

  it('clears both fields after a trade', () => {
    renderPanel();

    trade('Buy', '2');

    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe('');
  });

  it('clears the other field when one is emptied', () => {
    renderPanel();
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
    renderPanel();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    });

    expect(screen.getByLabelText<HTMLInputElement>('Quantity').value).toBe('');
  });

  it('clears the error when the amount changes', () => {
    renderPanel();
    trade('Buy', '0');
    expect(screen.getByRole('alert')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the selected coin and its price', () => {
    search = 'coin=ETHUSDT';
    renderPanel();

    expect(
      screen.getByRole('heading', { name: 'Trade Ethereum (ETH)' }),
    ).toBeDefined();
    expect(screen.getByText('Price: 100 USDT')).toBeDefined();
    expect(usePrice).toHaveBeenCalledWith('ETHUSDT');
  });

  it('buys at the current price and clears the input', () => {
    renderPanel();

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
    renderPanel();

    trade('Buy', '1');

    expect(useTrading.getState().trades[0].symbol).toBe('ETHUSDT');
  });

  it('sells what was bought', () => {
    renderPanel();

    trade('Buy', '3');
    // a valid trade closes the dialog, so open it again
    document.querySelector('dialog')!.showModal();
    trade('Sell', '1');

    const { cash, trades } = useTrading.getState();
    expect(cash).toBe(STARTING_CASH - 300 + 100);
    expect(trades.map((t) => t.side)).toEqual(['buy', 'sell']);
  });

  it('rejects a buy without enough cash', () => {
    renderPanel();

    trade('Buy', '101');

    expect(screen.getByRole('alert').textContent).toMatch(/not enough cash/i);
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('rejects a sell without holdings', () => {
    renderPanel();

    trade('Sell', '1');

    expect(screen.getByRole('alert').textContent).toMatch(
      /do not hold enough/i,
    );
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('only counts holdings of the selected coin', () => {
    renderPanel();
    trade('Buy', '1');

    cleanup();
    search = 'coin=ETHUSDT';
    renderPanel();
    trade('Sell', '1');

    expect(screen.getByRole('alert').textContent).toMatch(
      /do not hold enough/i,
    );
    expect(useTrading.getState().trades).toHaveLength(1);
  });

  it.each([['0'], ['-1'], ['']])('rejects the quantity "%s"', (qty) => {
    renderPanel();

    trade('Buy', qty);

    expect(screen.getByRole('alert').textContent).toMatch(/quantity/i);
    expect(useTrading.getState().trades).toEqual([]);
  });

  it('clears the error when the quantity changes', () => {
    renderPanel();
    trade('Buy', '0');
    expect(screen.getByRole('alert')).toBeDefined();

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '1' },
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables trading while the price is loading', () => {
    priceState({ data: undefined, isPending: true, isError: false });
    renderPanel();

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
    renderPanel();

    expect(
      within(screen.getByRole('alert')).getByText(/could not load the price/i),
    ).toBeDefined();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Buy' }).disabled,
    ).toBe(true);
  });
});

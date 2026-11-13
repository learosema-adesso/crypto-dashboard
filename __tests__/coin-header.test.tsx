import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CoinHeader } from '../app/coin-header';
import { usePrice } from '../lib/market/queries';
import { usePortfolio } from '../lib/portfolio/use-portfolio';

vi.mock('../lib/market/queries');
vi.mock('../lib/portfolio/use-portfolio');

const priceState = (state: object) =>
  vi.mocked(usePrice).mockReturnValue(state as ReturnType<typeof usePrice>);

const portfolioWith = (positions: Record<string, { pl: number }>) =>
  vi.mocked(usePortfolio).mockReturnValue({
    portfolio: { positions },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof usePortfolio>);

beforeEach(() => {
  priceState({ data: 69820.12, isPending: false, isError: false });
  vi.mocked(usePortfolio).mockReturnValue({
    portfolio: { positions: {} },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof usePortfolio>);
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('CoinHeader', () => {
  it('shows the coin and its price', () => {
    render(<CoinHeader symbol="BTCUSDT" />);

    expect(screen.getByRole('heading', { name: 'BTC' })).toBeDefined();
    expect(screen.getByText('69,820.12 USDT')).toBeDefined();
    expect(usePrice).toHaveBeenCalledWith('BTCUSDT');
  });

  it('shows the coin of the symbol', () => {
    render(<CoinHeader symbol="ETHUSDT" />);

    expect(screen.getByRole('heading', { name: 'ETH' })).toBeDefined();
  });

  it('hides the P/L for a coin that is not held', () => {
    portfolioWith({ ETHUSDT: { pl: 5 } });
    render(<CoinHeader symbol="BTCUSDT" />);

    expect(screen.queryByText(/PnL/)).toBeNull();
  });

  it('shows a profit as positive', () => {
    portfolioWith({ BTCUSDT: { pl: 12.3 } });
    render(<CoinHeader symbol="BTCUSDT" />);

    const value = screen.getByText('+12.30 USDT');
    expect(value.classList).toContain('positive');
    expect(screen.getByText(/PnL:/)).toBeDefined();
  });

  it('shows a loss as negative', () => {
    portfolioWith({ BTCUSDT: { pl: -4.5 } });
    render(<CoinHeader symbol="BTCUSDT" />);

    const value = screen.getByText('-4.50 USDT');
    expect(value.classList).toContain('negative');
  });

  it('shows a P/L of exactly 0 without color or sign', () => {
    portfolioWith({ BTCUSDT: { pl: 0 } });
    render(<CoinHeader symbol="BTCUSDT" />);

    const value = screen.getByText('0.00 USDT', { selector: 'span' });
    expect(value.className).toBe('');
  });

  it('hides the P/L until the portfolio prices are loaded', () => {
    vi.mocked(usePortfolio).mockReturnValue({
      portfolio: null,
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof usePortfolio>);
    render(<CoinHeader symbol="BTCUSDT" />);

    expect(screen.queryByText(/PnL/)).toBeNull();
  });

  it('shows a loading hint while the price is pending', () => {
    priceState({ data: undefined, isPending: true, isError: false });
    render(<CoinHeader symbol="BTCUSDT" />);

    expect(screen.getByText('Loading price…')).toBeDefined();
    expect(screen.queryByText(/USDT$/)).toBeNull();
  });

  it('says so when the price failed to load', () => {
    priceState({ data: undefined, isPending: false, isError: true });
    render(<CoinHeader symbol="BTCUSDT" />);

    expect(screen.getByText('Price unavailable')).toBeDefined();
  });
});

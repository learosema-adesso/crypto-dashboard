import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

vi.mock('../app/coin-chart', () => ({
  CoinChart: () => <p>coin chart</p>,
}));
vi.mock('../app/portfolio-summary', () => ({
  PortfolioSummary: () => <p>portfolio summary</p>,
}));
vi.mock('../app/holdings-table', () => ({
  HoldingsTable: () => <p>holdings table</p>,
}));
vi.mock('../app/transaction-history', () => ({
  TransactionHistory: () => <p>transaction history</p>,
}));
vi.mock('../app/theme-switcher', () => ({
  ThemeSwitcher: () => <p>theme switcher</p>,
}));

test('Page', () => {
  render(<Page />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Crypto Dashboard' }),
  ).toBeDefined();
  expect(screen.getByText('theme switcher')).toBeDefined();
  expect(screen.getByText('coin chart')).toBeDefined();
});

test('Page places the dashboard cards in an auto-grid', () => {
  const { container } = render(<Page />);
  const grid = container.querySelector('.auto-grid');
  expect(grid).not.toBeNull();
  expect(grid?.textContent).toContain('coin chart');
  expect(grid?.textContent).toContain('portfolio summary');
  expect(grid?.textContent).toContain('holdings table');
  expect(grid?.textContent).toContain('transaction history');
});

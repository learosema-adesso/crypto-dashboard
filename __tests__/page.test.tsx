import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

vi.mock('../app/coin-chart', () => ({
  CoinChart: () => <p>coin chart</p>,
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
});

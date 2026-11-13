import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

vi.mock('../app/coin-chart', () => ({
  CoinChart: () => <p>coin chart</p>,
}));

test('Page', () => {
  render(<Page />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Crypto Dashboard' }),
  ).toBeDefined();
  expect(screen.getByText('coin chart')).toBeDefined();
});

import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../app/page';

vi.mock('../app/price-chart', () => ({
  PriceChart: ({ symbol }: { symbol: string }) => <p>chart {symbol}</p>,
}));

test('Page', () => {
  render(<Page />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Crypto Dashboard' }),
  ).toBeDefined();
  expect(screen.getByText('chart BTCUSDT')).toBeDefined();
});

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';

const loaded = vi.fn();
vi.mock('invokers-polyfill', () => {
  loaded();
  return {};
});

afterEach(cleanup);

it('loads the polyfill in the browser and renders nothing', async () => {
  const { InvokersPolyfill } = await import('../app/invokers-polyfill');
  const { container } = render(<InvokersPolyfill />);

  await waitFor(() => expect(loaded).toHaveBeenCalled());
  expect(container.innerHTML).toBe('');
});

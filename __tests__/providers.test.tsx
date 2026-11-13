import { afterEach, describe, expect, it } from 'vitest';
import { onlineManager, useQuery } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { Providers } from '../app/providers';

afterEach(() => {
  cleanup();
  onlineManager.setOnline(true);
});

function FailingQuery() {
  const { isError, fetchStatus } = useQuery({
    queryKey: ['offline-test'],
    queryFn: () => Promise.reject(new Error('offline')),
    retry: false,
  });
  return <p>{isError ? 'error' : fetchStatus}</p>;
}

describe('Providers', () => {
  it('renders its children', () => {
    render(
      <Providers>
        <p>child</p>
      </Providers>,
    );

    expect(screen.getByText('child')).toBeDefined();
  });

  it('runs queries while the browser is offline, so they can fail into the error state', async () => {
    onlineManager.setOnline(false);

    render(
      <Providers>
        <FailingQuery />
      </Providers>,
    );

    expect(await screen.findByText('error')).toBeDefined();
  });
});

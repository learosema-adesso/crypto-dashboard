'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        // Default 'online' pauses fetches while offline, so queries stay
        // pending forever instead of failing into the error state.
        defaultOptions: { queries: { networkMode: 'always' } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

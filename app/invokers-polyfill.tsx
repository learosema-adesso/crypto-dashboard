'use client';

import { useEffect } from 'react';

// Invoker Commands (command/commandfor) are not supported everywhere yet.
// The polyfill touches document on import, so load it in the browser only.
export function InvokersPolyfill() {
  useEffect(() => {
    void import('invokers-polyfill');
  }, []);
  return null;
}

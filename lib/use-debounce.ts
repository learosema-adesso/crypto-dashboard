import { useEffect, useState } from 'react';

// Returns `value` only after it stayed unchanged for `ms` milliseconds.
export function useDebounce<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);

  return debounced;
}

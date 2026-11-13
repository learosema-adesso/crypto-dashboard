'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_SYMBOL, SYMBOLS } from './symbols';

const COIN_PARAM = 'coin';

function parseSymbol(value: string | null): string {
  return SYMBOLS.find((s) => s.symbol === value)?.symbol ?? DEFAULT_SYMBOL;
}

// The selected coin lives in `?coin=...`, so chart and trade panel read the
// same value, it survives a reload and the URL is shareable.
// Missing or unknown values fall back to DEFAULT_SYMBOL.
// Needs a <Suspense> boundary above it (prerendered route).
export function useSelectedSymbol() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const symbol = parseSymbol(searchParams.get(COIN_PARAM));

  function setSymbol(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(COIN_PARAM, parseSymbol(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return [symbol, setSymbol] as const;
}

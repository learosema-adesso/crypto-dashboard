import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSelectedSymbol } from './use-selected-symbol';

const replace = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(search),
}));

beforeEach(() => {
  replace.mockReset();
  search = '';
});

describe('useSelectedSymbol', () => {
  it('falls back to the default symbol without a param', () => {
    const { result } = renderHook(() => useSelectedSymbol());
    expect(result.current[0]).toBe('BTCUSDT');
  });

  it('reads a valid symbol from the param', () => {
    search = 'coin=ETHUSDT';
    const { result } = renderHook(() => useSelectedSymbol());
    expect(result.current[0]).toBe('ETHUSDT');
  });

  it.each([['DOGEUSDT'], ['ethusdt'], ['']])(
    'falls back to the default symbol for the invalid param "%s"',
    (value) => {
      search = `coin=${value}`;
      const { result } = renderHook(() => useSelectedSymbol());
      expect(result.current[0]).toBe('BTCUSDT');
    },
  );

  it('writes the new symbol into the param via router.replace', () => {
    const { result } = renderHook(() => useSelectedSymbol());

    act(() => result.current[1]('ETHUSDT'));

    expect(replace).toHaveBeenCalledWith('/?coin=ETHUSDT', { scroll: false });
  });

  it('keeps other search params when writing', () => {
    search = 'foo=bar&coin=BTCUSDT';
    const { result } = renderHook(() => useSelectedSymbol());

    act(() => result.current[1]('ETHUSDT'));

    expect(replace).toHaveBeenCalledWith('/?foo=bar&coin=ETHUSDT', {
      scroll: false,
    });
  });

  it('writes the default symbol when given an unknown one', () => {
    const { result } = renderHook(() => useSelectedSymbol());

    act(() => result.current[1]('DOGEUSDT'));

    expect(replace).toHaveBeenCalledWith('/?coin=BTCUSDT', { scroll: false });
  });
});

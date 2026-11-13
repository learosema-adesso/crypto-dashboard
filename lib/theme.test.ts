import { afterEach, describe, expect, it } from 'vitest';
import { applyTheme, parseTheme } from './theme';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('parseTheme', () => {
  it.each(['system', 'light', 'dark'])('accepts %s', (value) => {
    expect(parseTheme(value)).toBe(value);
  });

  it.each([null, undefined, '', 'blue', 42])(
    'falls back to system for %s',
    (value) => {
      expect(parseTheme(value)).toBe('system');
    },
  );
});

describe('applyTheme', () => {
  it('sets data-theme for light and dark', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('removes data-theme for system', () => {
    applyTheme('dark');
    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

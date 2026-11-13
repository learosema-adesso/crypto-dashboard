export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export function parseTheme(value: unknown): Theme {
  return THEMES.find((t) => t === value) ?? 'system';
}

// 'system' means no attribute, so color-scheme follows the OS again
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

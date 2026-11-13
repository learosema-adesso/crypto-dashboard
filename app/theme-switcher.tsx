'use client';

import { useState } from 'react';
import { applyTheme, parseTheme, type Theme } from '../lib/theme';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');

  return (
    <div>
      <label htmlFor="theme">Theme </label>
      <select
        id="theme"
        value={theme}
        onChange={(e) => {
          const next = parseTheme(e.target.value);
          setTheme(next);
          applyTheme(next);
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

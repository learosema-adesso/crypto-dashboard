import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeSwitcher } from '../app/theme-switcher';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

const getSelect = () =>
  screen.getByRole<HTMLSelectElement>('combobox', { name: 'Theme' });

describe('ThemeSwitcher', () => {
  it('offers system, light and dark and starts with system', () => {
    render(<ThemeSwitcher />);

    expect(getSelect().value).toBe('system');
    expect(
      screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value),
    ).toEqual(['system', 'light', 'dark']);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('applies the selected theme', () => {
    render(<ThemeSwitcher />);

    fireEvent.change(getSelect(), { target: { value: 'dark' } });
    expect(getSelect().value).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.change(getSelect(), { target: { value: 'light' } });
    expect(getSelect().value).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('goes back to the system preference', () => {
    render(<ThemeSwitcher />);

    fireEvent.change(getSelect(), { target: { value: 'dark' } });
    fireEvent.change(getSelect(), { target: { value: 'system' } });

    expect(getSelect().value).toBe('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

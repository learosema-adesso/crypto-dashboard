import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { Autocomplete } from '../app/autocomplete';

const OPTIONS = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'sol', label: 'Solana (SOL)' },
];

function setup(value = 'btc') {
  const onSelect = vi.fn();
  const view = render(
    <Autocomplete
      label="Coin"
      options={OPTIONS}
      value={value}
      onSelect={onSelect}
    />,
  );
  const input = screen.getByRole<HTMLInputElement>('combobox', {
    name: 'Coin',
  });
  return { onSelect, input, ...view };
}

const labels = () => screen.queryAllByRole('option').map((o) => o.textContent);
const type = (input: HTMLElement, value: string) =>
  fireEvent.change(input, { target: { value } });
const key = (input: HTMLElement, k: string) =>
  fireEvent.keyDown(input, { key: k });
const wait = (ms = 300) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Autocomplete', () => {
  it('shows the label of the selected value with the list closed', () => {
    const { input } = setup('eth');

    expect(input.value).toBe('Ethereum (ETH)');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows an empty input for an unknown value', () => {
    const { input } = setup('doge');

    expect(input.value).toBe('');
  });

  it('follows a changed value from outside', () => {
    const { input, rerender } = setup('btc');

    rerender(
      <Autocomplete
        label="Coin"
        options={OPTIONS}
        value="sol"
        onSelect={() => {}}
      />,
    );

    expect(input.value).toBe('Solana (SOL)');
  });

  it('opens with all options on focus and marks the selected one', () => {
    const { input } = setup('eth');

    fireEvent.focus(input);

    expect(labels()).toEqual(OPTIONS.map((o) => o.label));
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(
      screen.getAllByRole('option').map((o) => o.getAttribute('aria-selected')),
    ).toEqual(['false', 'true', 'false']);
  });

  it('filters the options after the debounce delay', () => {
    const { input } = setup();
    fireEvent.focus(input);

    type(input, 'sol');
    expect(labels()).toHaveLength(3);

    wait();
    expect(labels()).toEqual(['Solana (SOL)']);
  });

  it('matches case-insensitively and ignores surrounding spaces', () => {
    const { input } = setup();
    fireEvent.focus(input);

    type(input, ' ETH ');
    wait();

    expect(labels()).toEqual(['Ethereum (ETH)']);
  });

  it('shows every option again when the text is cleared', () => {
    const { input } = setup();
    fireEvent.focus(input);
    type(input, 'sol');
    wait();

    type(input, '');
    wait();

    expect(labels()).toHaveLength(3);
  });

  it('announces when nothing matches and closes the list', () => {
    const { input } = setup();
    fireEvent.focus(input);
    expect(screen.getByRole('status').textContent).toBe('');

    type(input, 'zzz');
    wait();

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('status').textContent).toBe('No results found');
  });

  it('selects an option by click and closes the list', () => {
    const { input, onSelect } = setup();
    fireEvent.focus(input);

    fireEvent.click(screen.getByRole('option', { name: 'Ethereum (ETH)' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('eth');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('selects a filtered option by click', () => {
    const { input, onSelect } = setup();
    fireEvent.focus(input);
    type(input, 'sol');
    wait();

    fireEvent.click(screen.getByRole('option'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('sol');
  });

  it('moves the highlight with arrow keys and selects with Enter', () => {
    const { input, onSelect } = setup();
    fireEvent.focus(input);
    const first = screen.getByRole('option', { name: 'Bitcoin (BTC)' });
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id);

    key(input, 'ArrowDown');
    const second = screen.getByRole('option', { name: 'Ethereum (ETH)' });
    expect(input.getAttribute('aria-activedescendant')).toBe(second.id);

    key(input, 'Enter');
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('eth');
  });

  it('wraps around at both ends', () => {
    const { input } = setup();
    fireEvent.focus(input);
    const options = screen.getAllByRole('option');

    key(input, 'ArrowUp');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id);

    key(input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('opens a closed list with the arrow key', () => {
    const { input } = setup();
    fireEvent.focus(input);
    key(input, 'Escape');
    expect(screen.queryByRole('listbox')).toBeNull();

    key(input, 'ArrowDown');

    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('highlights the first match after filtering', () => {
    const { input, onSelect } = setup();
    fireEvent.focus(input);
    key(input, 'ArrowDown');
    type(input, 'e');
    wait();

    key(input, 'Enter');

    // "e" matches Ethereum first ("Bitcoin (BTC)" has no e)
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('eth');
  });

  it('uses the typed text for Enter before the debounce has fired', () => {
    const { input, onSelect } = setup();
    fireEvent.focus(input);

    type(input, 'sol');
    key(input, 'Enter');

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('sol');
  });

  it('ignores Enter when the list is closed or nothing matches', () => {
    const { input, onSelect } = setup();

    key(input, 'Enter');
    fireEvent.focus(input);
    type(input, 'zzz');
    wait();
    key(input, 'Enter');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on Escape and discards the typed text', () => {
    const { input, onSelect } = setup('eth');
    fireEvent.focus(input);
    type(input, 'sol');
    expect(input.value).toBe('sol');

    key(input, 'Escape');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.value).toBe('Ethereum (ETH)');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on blur and discards the typed text', () => {
    const { input, onSelect } = setup('eth');
    fireEvent.focus(input);
    type(input, 'sol');

    fireEvent.blur(input);

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.value).toBe('Ethereum (ETH)');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps focus in the input when pressing an option', () => {
    const { input } = setup();
    fireEvent.focus(input);

    const notPrevented = fireEvent.mouseDown(screen.getAllByRole('option')[1]);

    expect(notPrevented).toBe(false);
  });
});

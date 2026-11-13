import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CurrencyInput } from '../app/currency-input';

afterEach(cleanup);

function setup(value = '') {
  const onChange = vi.fn();
  render(
    <CurrencyInput
      id="amount"
      label="Amount"
      unit="USDT"
      value={value}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe('CurrencyInput', () => {
  it('labels a numeric input', () => {
    setup();
    const input = screen.getByLabelText<HTMLInputElement>('Amount');
    expect(input.type).toBe('number');
    expect(input.min).toBe('0');
  });

  it('shows the value and the unit', () => {
    setup('12.5');
    expect(screen.getByLabelText<HTMLInputElement>('Amount').value).toBe(
      '12.5',
    );
    expect(screen.getByText('USDT')).toBeDefined();
  });

  it('reports typed values as strings', () => {
    const onChange = setup();
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '3.5' },
    });
    expect(onChange).toHaveBeenCalledWith('3.5');
  });

  it('reports a cleared input as an empty string', () => {
    const onChange = setup('3');
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith('');
  });
});

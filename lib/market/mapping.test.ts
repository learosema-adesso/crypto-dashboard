import { describe, expect, it } from 'vitest';
import { mapKlines, mapPrice } from './mapping';

describe('mapKlines', () => {
  it('maps time (index 0) and close (index 4) to numbers', () => {
    expect(
      mapKlines([
        [1000, '1', '2', '0.5', '1.5'],
        [2000, '1.5', '3', '1', '2.25'],
      ]),
    ).toEqual([
      { time: 1000, price: 1.5 },
      { time: 2000, price: 2.25 },
    ]);
  });

  it.each([
    ['an object', {}],
    ['null', null],
    ['a string', 'nope'],
  ])('throws when the response is %s', (_, input) => {
    expect(() => mapKlines(input)).toThrow('expected an array');
  });

  it('throws on an empty array', () => {
    expect(() => mapKlines([])).toThrow('empty array');
  });

  it('throws when a kline is not an array', () => {
    expect(() => mapKlines([1, 2])).toThrow('Invalid kline at index 0');
  });

  it.each([
    ['NaN close', [1, '1', '2', '0.5', 'abc']],
    ['NaN time', ['abc', '1', '2', '0.5', '1.5']],
    ['missing close', [1, '1', '2', '0.5']],
    ['null close', [1, '1', '2', '0.5', null]],
    ['empty-string close', [1, '1', '2', '0.5', '']],
  ])('throws on %s', (_, kline) => {
    expect(() => mapKlines([kline])).toThrow('Invalid');
  });

  it('reports the index of the broken kline', () => {
    expect(() =>
      mapKlines([
        [1, '1', '2', '0.5', '1.5'],
        [2, '1', '2', '0.5', 'abc'],
      ]),
    ).toThrow('index 1');
  });
});

describe('mapPrice', () => {
  it('returns the price as a number', () => {
    expect(mapPrice({ symbol: 'BTCUSDT', price: '65000.12' })).toBe(65000.12);
  });

  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['an object without price', { symbol: 'BTCUSDT' }],
  ])('throws on %s', (_, input) => {
    expect(() => mapPrice(input)).toThrow('missing price');
  });

  it('throws on a NaN price', () => {
    expect(() => mapPrice({ price: 'abc' })).toThrow('Invalid price');
  });
});

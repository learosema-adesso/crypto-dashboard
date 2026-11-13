import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchKlines, fetchPrice } from './api';

export const priceQuery = (symbol: string) =>
  queryOptions({
    queryKey: ['price', symbol],
    queryFn: () => fetchPrice(symbol),
  });

export const klinesQuery = (symbol: string) =>
  queryOptions({
    queryKey: ['klines', symbol],
    queryFn: () => fetchKlines(symbol),
  });

export const usePrice = (symbol: string) => useQuery(priceQuery(symbol));

export const useKlines = (symbol: string) => useQuery(klinesQuery(symbol));

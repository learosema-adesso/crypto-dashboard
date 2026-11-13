// Conversion between a USDT amount and a coin quantity at a given price.
// Both work on the raw input strings and return '' if there is nothing
// sensible to show (empty, invalid, negative or a non-positive price).

function parse(input: string): number | null {
  if (input.trim() === '') return null;
  const value = Number(input);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function amountToQty(amount: string, price: number): string {
  const value = parse(amount);
  if (value === null || !(price > 0)) return '';
  // 8 decimals like formatQty, Number() drops trailing zeros
  return String(Number((value / price).toFixed(8)));
}

export function qtyToAmount(qty: string, price: number): string {
  const value = parse(qty);
  if (value === null || !(price > 0)) return '';
  return (value * price).toFixed(2);
}

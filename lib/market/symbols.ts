export const SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
  { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
  { symbol: 'BNBUSDT', name: 'BNB (BNB)' },
  { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
  { symbol: 'XRPUSDT', name: 'XRP (XRP)' },
  { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
] as const;

export const DEFAULT_SYMBOL = SYMBOLS[0].symbol;

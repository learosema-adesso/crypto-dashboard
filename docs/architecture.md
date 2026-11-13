# Architecture: Crypto Trading Dashboard

Last updated: November 11, 2026

## Overview

Client-side dashboard (Next.js, App Router): 24h price chart, mock trading and a portfolio with profit/loss. There is no backend of our own.

- **Server state** (prices, klines): TanStack Query, polling every 10 s
- **Client state** (`cash` and `trades`): Zustand
- **Derived** (holdings, average cost, P/L): pure functions, not stored
- **UI:** `CoinChart` (coin `Autocomplete`, `CoinHeader`, `PriceChart` with Recharts), `TradePanel` (native dialog), `PortfolioSummary`, `HoldingsTable`, `TransactionHistory`, styled with plain CSS

Data flow: Binance (REST) → TanStack Query → components. Trades → Zustand → `computeHoldings` → `computePortfolio` (with latest prices) → portfolio.

## ADRs

### ADR-1: Next.js (App Router) as the framework

Status: Accepted

- Decision: Next.js, with the whole dashboard as Client Components (`'use client'`)
- Consequence: read live data only after mount (hydration); `useSearchParams` needs a `<Suspense>` boundary; the chart loads via `next/dynamic` with `ssr: false`

### ADR-2: TanStack Query instead of Redux (RTK Query) for server state

Status: Accepted

- Decision: TanStack Query for prices and klines
- Why: caching, polling and error states built in; Redux caused problems with Next.js SSR and is not the most minimal option
- Consequence: one query per symbol, `refetchInterval` for polling

### ADR-3: Zustand for client state

Status: Accepted

- Decision: a Zustand store for `cash` and `trades` only (mock trading)
- Why: both exist only on the client and do not belong in the query cache; Zustand is small, has no boilerplate and needs no provider
- Consequence: two state libraries with a clear split (what the server owns vs. what the user did), justified in the README

### ADR-4: Polling only, no WebSocket

Status: Accepted (replaces the earlier plan for a native WebSocket with polling as fallback)

- Decision: prices are refreshed by TanStack Query polling every 10 s (`refetchInterval`); no WebSocket
- Why: the task asks for periodic fetching ("e.g., every 10 seconds") and says to keep it as simple as possible and not to over-engineer. Polling meets that fully. A WebSocket would add connection state, reconnect with backoff, throttling and a second data path for the same price. It was also dropped for lack of time
- Consequence: prices can be up to 10 s old; the query cache stays the single source for prices. A `usePriceStream` hook writing into the cache via `setQueryData` is the natural extension with more time (listed under "With more time" in the README)

### ADR-5: Plain CSS

Status: Accepted

- Decision: CSS without a framework, CSS variables for colors (light and dark via `light-dark()`), no media queries
- Why: an intrinsic `auto-grid` (with a `halves` modifier) wraps to one column on narrow screens by itself, so the layout is responsive without breakpoints
- Consequence: implement the Figma layout ourselves (grid, tokens in `theme.css`)

### ADR-6: Binance public API as the data source

Status: Accepted

- Decision: `data-api.binance.vision` (REST), no API key
- Why: no key required
- Consequence: numbers arrive as strings (`Number()`), responses are validated

### ADR-7: Store only trades and cash, derive everything else

Status: Accepted

- Decision: holdings, average cost and P/L are pure functions of `trades`; only `cash` is stored next to them
- Why: a single source of truth, easy to test
- Consequence: selectors must not return new objects (`useMemo` instead of computing inside the selector)

### ADR-8: Display in USDT with one formatting function

Status: Accepted

- Decision: load and display everything in USDT; format amounts only via `formatUsdt` (and quantities via `formatQty`)
- Why: it is what Binance delivers, shortest path
- Consequence: EUR/CHF can be added later via an exchange-rate query, the raw data stays in USDT

### ADR-9: Selected coin lives in the URL

Status: Accepted

- Decision: the coin is the search param `?coin=ETHUSDT`, read through `useSelectedSymbol`; missing or unknown values fall back to `DEFAULT_SYMBOL`
- Why: chart and trade panel read the same value, it survives a reload and the link is shareable
- Consequence: both components need a `<Suspense>` boundary above them (see ADR-1)

### ADR-10: Coin autocomplete built from scratch

Status: Accepted

- Decision: a small generic ARIA combobox (`app/autocomplete.tsx`) replaces the `<select>`; it filters a fixed list of coins after a 300 ms debounce, no endpoint
- Why: typing gets visible feedback and the search and the coin choice are one control. A library would be more than seven coins need
- Consequence: keyboard support (arrows, Enter, Esc) and the ARIA wiring are ours to maintain; Enter uses the live text if the debounce has not fired yet

## Open / with more time

- WebSocket price stream (see ADR-4)
- Currency switcher (EUR/CHF)
- Persistence of trades (`persist` with `skipHydration`)
- Decimal arithmetic instead of `number`

# Architecture: Crypto Trading Dashboard

Last updated: November 11, 2026

## Overview

Client-side dashboard (Next.js, App Router): 24h price chart, mock trading and a portfolio with profit/loss. There is no backend of our own.

- **Server state** (prices, klines): TanStack Query, polling every 10 s, optional WebSocket updates written directly into the query cache
- **Client state** (trades): Zustand
- **Derived** (holdings, average cost, P/L): pure functions, not stored
- **UI:** `PriceChart` (Recharts), `TradePanel`, `Portfolio`, styled with plain CSS

Data flow: Binance (REST/WS) → TanStack Query → components. Trades → Zustand → `computeHoldings` → `computePortfolio` (with latest prices) → portfolio.

## ADRs

### ADR-1: Next.js (App Router) as the framework

Status: Accepted

- Decision: Next.js, with the whole dashboard as Client Components (`'use client'`)
- Consequence: read live data and `localStorage` only after mount (hydration); load the chart via `next/dynamic` with `ssr: false`

### ADR-2: TanStack Query instead of Redux (RTK Query) for server state

Status: Accepted

- Decision: TanStack Query for prices and klines
- Why: caching, polling and error states built in; Redux caused problems with Next.js SSR and is not the most minimal option
- Consequence: one query per symbol, `refetchInterval` for polling

### ADR-3: Zustand for client state

Status: Accepted

- Decision: a Zustand store for trades only (mock trading)
- Why: trades exist only on the client and do not belong in the query cache; Zustand is small, has no boilerplate and needs no provider
- Consequence: two state libraries with a clear split, to be justified in the README

### ADR-4: Native WebSocket, polling as fallback

Status: Accepted

- Decision: a custom `usePriceStream` hook using the native `WebSocket` API, no library; updates go into the cache via `setQueryData`
- Why: Binance speaks plain WebSocket, so one hook is enough
- Consequence: build reconnect with backoff ourselves; poll only while the socket is not open

### ADR-5: Plain CSS

Status: Accepted

- Decision: CSS without a framework, CSS variables for colors, one media query for mobile
- Consequence: implement the Figma layout ourselves (grid)

### ADR-6: Binance public API as the data source

Status: Proposed

- Decision: `data-api.binance.vision` (REST) and `data-stream.binance.vision` (WebSocket), no API key
- Why: no key required, REST and WebSocket from one provider
- Consequence: numbers arrive as strings (`Number()`), responses are validated

### ADR-7: Store only trades, derive everything else

Status: Proposed

- Decision: holdings, average cost, P/L (and optionally cash) as pure functions of `trades`
- Why: a single source of truth, easy to test
- Consequence: selectors must not return new objects (`useMemo` instead of computing inside the selector)

### ADR-8: Display in USD(T) with one formatting function

Status: Proposed

- Decision: load everything in USDT and display it as USD; format amounts only via `formatMoney`
- Why: standard in the crypto market, shortest path
- Consequence: EUR/CHF can be added later via an exchange-rate query, the raw data stays in USDT

## Open / with more time

- Currency switcher (EUR/CHF)
- Persistence of trades (`persist` with `skipHydration`)
- Decimal arithmetic instead of `number`

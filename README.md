# Coding challenge: Crypto Trading Dashboard

## Local setup

Requires Node 24.

```bash
npm install
npm run dev     # start the dev server at http://localhost:3000
npm test        # run unit tests with Vitest (watch mode)
npm run lint    # run ESLint
npm run build   # production build
```

## Task description

The app will allow users to view real-time crypto prices,
analyze trends with charts, and simulate trades for popular cryptocurrencies like Bitcoin
and Ethereum. Users can also view their portfolio summary with profit/loss calculations.
Main Features

## 1. Crypto Price Chart

- Display a real-time price chart for a selected cryptocurrency (e.g., BTC or ETH).
- Show price movements for the past 24 hours.
- Use a line chart to plot the data.

## 2. Mock Trading

- Create a buy/sell interface where users can simulate trades for selected
  cryptocurrencies.
- Update the user’s portfolio immediately after a trade (no backend required).

## 3. Portfolio Overview

- Display the user's current crypto holdings and transaction history.
- Calculate and display profit/loss based on the latest prices.

Use the Figma specification as a reference for design implementation. While the provided
design is for a mobile app, adapt the same style to create a responsive design suitable for
desktop screens.

## Tech Requirements

- React
  - Build the app using React. Use modern React features such as hooks.
- State Management
  - Use Redux (or another state management library) to handle the app's data, such as
    prices, trades, and portfolio information.
- Charting
  - Use a charting library like Recharts or Chart.js.
- Data Source
  - Use a free API like CoinGecko, CoinCap, or Binance API.
- Error Handling
  - Gracefully handle errors, such as when API calls fail or return invalid data.
- Styling
  - Use your preferred CSS framework or library (e.g., Tailwind CSS, Bootstrap, or plain
    CSS).

## Extra Points

1. Testing
   a. Write unit tests for key components using a testing library such as Jest or
   React Testing Library.
2. Performance Optimization
   a. Implement optimizations like debouncing the search input and lazy loading
   components.
3. Real-Time Data Updates
   a. Fetch crypto prices periodically (e.g., every 10 seconds) to update the UI.
   Development Practices
   • Use Git for version control, and ensure meaningful commit messages.
   • Write clean, modular, and reusable code.
   • Keep it as simple as the nature of this problem allows it. Do not over-engineer.

---

## Solution

A client-side dashboard: 24h price chart with a coin autocomplete, a buy/sell dialog, and a portfolio with holdings, transaction history and profit/loss. Prices are polled every 10 seconds. There is no backend.

### Running the tests

```bash
npm test             # watch mode
npx vitest run       # single run
npm run lint         # ESLint
npm run format:check # Prettier
```

Tests live next to the code (`lib/**/*.test.ts`) and in `__tests__/` for components. They cover the pure portfolio math, response mapping with broken input, the trade validation and the components, including loading and error states.

### Assumptions

- **Starting balance:** 10,000 USDT (`STARTING_CASH` in `lib/trading/store.ts`).
- **No fees** on trades.
- **No short selling:** a buy needs enough cash, a sell needs enough holdings. Both are checked before a trade, and `computeHoldings` throws on an oversell.
- **Currency:** everything is USDT, as delivered by Binance. Amounts are formatted in one place (`lib/format.ts`).
- **Average cost:** a buy moves the average cost, a sell only reduces the quantity.
- **Trades are not persisted:** a reload resets the portfolio to the starting balance.
- **Theme:** starts with the system setting. The choice is not stored either.

### Decisions

- **Next.js (App Router):** the framework the setup defaults to, with routing and build included. The dashboard is all Client Components, so there is no server code of our own.
- **TanStack Query for server state:** prices and klines get caching, polling (`refetchInterval: 10_000`, paused in background tabs) and loading/error states for free. One query per symbol.
- **Zustand for client state:** only `cash` and `trades`. Small, no provider, no boilerplate. Two libraries with a clear split: what the server owns vs. what the user did.
- **Derive, don't store:** holdings, average cost and P/L are pure functions of `trades` (`computeHoldings`, `computePortfolio`). One source of truth, and easy to test.
- **`number` instead of a decimal library:** enough for a mock with Binance's 8 decimals. A small epsilon absorbs floating point residue when comparing against holdings.
- **Polling, no WebSocket:** the task asks for periodic fetching and says not to over-engineer. A socket would add connection state, reconnects and a second data path for the same price.
- **Plain CSS:** design tokens as CSS variables (light and dark via `light-dark()`), and an intrinsic `auto-grid` instead of media queries.
- **Selected coin in the URL (`?coin=ETHUSDT`):** chart and trade panel read the same value, it survives a reload and is shareable.
- **Native `<dialog>`** for the trade form, opened with the Invoker Commands API (`command`/`commandfor`) plus a polyfill for older browsers. Focus trap, Esc and backdrop come from the browser.
- **Autocomplete from scratch:** a small ARIA combobox with keyboard support and a debounced filter, instead of a library.
- **Lazy loaded chart:** Recharts is the largest dependency, so `PriceChart` loads in its own chunk via `next/dynamic`.

More detail on the decisions is in [docs/architecture.md](docs/architecture.md).

### With more time

- WebSocket price stream (`@miniTicker`) writing into the query cache, with reconnect and backoff, polling only while the socket is closed
- Persist trades (Zustand `persist` with `skipHydration`)
- Decimal arithmetic instead of `number`
- Currency switcher (EUR/CHF) via an exchange-rate query

## Why I used AI in the project

- The time frame of 4 hours was already very short. With AI assistance I could cover the whole scope (data layer, trading logic, chart, accessibility, tests, docs) instead of only a slice of it.
- Much of the work is well-understood and repetitive: response mapping, store actions, tests, table markup. A model is fast at that, and I could spend my time on the decisions.
- Every step is a small, reviewable commit. I read and steered the result, and the commits carry a `Co-Authored-By` trailer so the split stays visible in the history.

### What I (Lea) contributed

- **The initial architecture decisions:** the stack and the split between server state and client state (see [Decisions](#decisions) and [docs/architecture.md](docs/architecture.md)).
- **The repository setup:** tooling, formatting, pre-commit hook, test setup and the working rules for the project (`CLAUDE.md`).
- **The design decision to use native web standards wherever possible:**
  - the `<dialog>` element and the Invoker Commands API (`command`/`commandfor`) for the trade form
  - plain, native CSS instead of a styling framework
  - established building blocks instead of custom ones: a well-tested CSS reset and layout utility classes
- **Direction and review:** deciding what to build next, and accepting or rejecting what the model produced.

### What the model did

- Implemented the features within those decisions: market fetching and validation, the Zustand store, portfolio math, the chart, the coin search, the trade form and the tables.
- Wrote the tests and the documentation text.
- Did the refactorings and fixes that came up along the way, one commit at a time.

I take responsibility for the result. The choices above are mine, the typing was mostly not.

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

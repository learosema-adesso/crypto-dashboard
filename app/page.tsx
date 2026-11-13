import { Suspense } from 'react';
import { CoinChart } from './coin-chart';
import { HoldingsTable } from './holdings-table';
import { PortfolioSummary } from './portfolio-summary';
import { ThemeSwitcher } from './theme-switcher';
import { TradePanel } from './trade-panel';
import { TransactionHistory } from './transaction-history';

export default function Home() {
  return (
    <main className="wrapper flow">
      <header className="page-header">
        <h1>Crypto Dashboard</h1>
        <ThemeSwitcher />
      </header>
      <div className="auto-grid halves">
        {/* useSearchParams in CoinChart and TradePanel needs a Suspense boundary */}
        <Suspense fallback={<p className="muted span-all">Loading…</p>}>
          <CoinChart />
          <TradePanel />
        </Suspense>
        <PortfolioSummary />
        <HoldingsTable />
        <TransactionHistory />
      </div>
    </main>
  );
}

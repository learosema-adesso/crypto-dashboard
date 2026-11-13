import { Suspense } from 'react';
import { CoinChart } from './coin-chart';
import { ThemeSwitcher } from './theme-switcher';

export default function Home() {
  return (
    <main className="wrapper flow">
      <header className="page-header">
        <h1>Crypto Dashboard</h1>
        <ThemeSwitcher />
      </header>
      {/* useSearchParams in CoinChart needs a Suspense boundary */}
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <CoinChart />
      </Suspense>
    </main>
  );
}

import { MarketJson } from './market-json';

export default function Home() {
  return (
    <>
      <main>
        <h1>Crypto Dashboard</h1>
        <MarketJson symbol="BTCUSDT" />
      </main>
    </>
  );
}

import { PriceChart } from './price-chart';

export default function Home() {
  return (
    <>
      <main>
        <h1>Crypto Dashboard</h1>
        <PriceChart symbol="BTCUSDT" />
      </main>
    </>
  );
}

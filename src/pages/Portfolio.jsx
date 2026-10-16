export default function Portfolio({ account, onFund }) {
  if (!account.wallet) {
    return (
      <div className="page empty-page">
        <p className="eyebrow">Portfolio</p>
        <h1>Your positions live here.</h1>
        <p className="lede">Connect your wallet to see your Hyperliquid and trade.xyz accounts, wallet balances on Robinhood Chain and HyperEVM, your loan and your Tribute rewards.</p>
        <button className="mint-btn" onClick={account.openConnect}>Connect wallet</button>
        <div className="info-grid">
          <article><h2>Trading accounts</h2><p>Equity, open PnL and positions on Hyperliquid and trade.xyz.</p></article>
          <article><h2>Wallet balances</h2><p>USDG on Robinhood Chain and USDC on HyperEVM, ready to deposit.</p></article>
          <article><h2>Borrow</h2><p>Collateral, debt and loan health at a glance.</p></article>
          <article><h2>Tribute</h2><p>Silver and Gold rewards earned, pending and paid.</p></article>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-intro">
        <p className="eyebrow">Portfolio</p>
        <h1>Trading accounts overview</h1>
        <p className="lede">Shared collateral account. These balances overlap and are not added together.</p>
      </div>
      <div className="info-grid">
        <article>
          <h2>Hyperliquid perps</h2>
          <p>${account.balances.usdc.toLocaleString("en-US")} available · crypto perpetuals</p>
          <span className="muted">0 open positions · 0 open orders</span>
        </article>
        <article>
          <h2>trade.xyz</h2>
          <p>$0.00 available · stocks & commodities</p>
          <span className="muted">Separate USDC collateral</span>
        </article>
        <article>
          <h2>Robinhood wallet</h2>
          <p>{account.balances.usdg.toLocaleString("en-US")} USDG</p>
          <button className="text-btn" onClick={onFund}>Deposit USDG to trade</button>
        </article>
        <article>
          <h2>Borrow and Tribute</h2>
          <p>No active loan. No rewards recorded yet.</p>
        </article>
      </div>
    </div>
  );
}

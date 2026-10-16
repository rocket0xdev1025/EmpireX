import { useState } from "react";
import TokenIcon from "../components/TokenIcon.jsx";
import { markets } from "../data.js";

const collateral = markets.filter((market) => ["BTC", "ETH", "SOL", "XAU", "NVDA", "TSLA", "PAXG", "HYPE"].includes(market.symbol));

export default function Borrow({ account }) {
  const [asset, setAsset] = useState(collateral[0]);
  const [posted, setPosted] = useState("1");
  const [note, setNote] = useState("");
  const borrowable = Number(posted || 0) * asset.price * 0.5;

  function borrow(event) {
    event.preventDefault();
    setNote(
      account.wallet
        ? `Preview only. Lending is not yet live. ${asset.symbol} would borrow about $${borrowable.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDG.`
        : "Connect a preview wallet to explore the borrow flow.",
    );
  }

  return (
    <div className="page borrow-page">
      <div className="page-intro">
        <p className="eyebrow">Borrow</p>
        <h1>Unlock their potential.</h1>
        <p className="lede">Explore USDG borrowing against tokens and real-world assets. Crypto and real-world assets are posted as collateral, and USDG is borrowed through Empire.</p>
        <p className="preview-flag">Interactive preview · lending is not yet live.</p>
      </div>
      <div className="borrow-grid">
        <form className="panel" onSubmit={borrow}>
          <h2>Your collateral</h2>
          <div className="choice-grid">
            {collateral.map((market) => (
              <button type="button" key={market.symbol} className={asset.symbol === market.symbol ? "is-active" : ""} onClick={() => setAsset(market)}>
                <TokenIcon symbol={market.symbol} size={28} />
                {market.symbol}
              </button>
            ))}
          </div>
          <label>
            Post collateral · {asset.symbol}
            <input value={posted} onChange={(event) => setPosted(event.target.value)} />
          </label>
          <ol className="steps compact">
            <li><span>01</span><div><strong>Post collateral</strong><p>Keep your assets.</p></div></li>
            <li><span>02</span><div><strong>Borrow via Empire</strong><p>Against the posted value.</p></div></li>
            <li><span>03</span><div><strong>Receive USDG</strong><p>Use it on Robinhood Chain.</p></div></li>
          </ol>
          <dl className="ticket-stats">
            <div><dt>Collateral value</dt><dd>${(Number(posted || 0) * asset.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}</dd></div>
            <div><dt>Borrow up to</dt><dd>${borrowable.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDG</dd></div>
          </dl>
          <button className="mint-btn wide" type="submit">Review borrow</button>
          {note && <p className="form-note">{note}</p>}
        </form>
        <aside className="panel soft">
          <h2>No active loan.</h2>
          <p>Borrow USDG against {asset.name} and keep your position.</p>
          <p className="muted">{account.wallet ? "Loan data is a local preview. Nothing is borrowed on Robinhood Chain." : "Connect your wallet to see collateral, debt and loan health."}</p>
        </aside>
      </div>
    </div>
  );
}

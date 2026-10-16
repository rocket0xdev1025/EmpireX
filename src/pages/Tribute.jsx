import { useMemo, useState } from "react";

export default function Tribute({ account }) {
  const [entry, setEntry] = useState(10000);
  const [days, setDays] = useState(7);
  const [gold, setGold] = useState(false);
  const reward = useMemo(() => entry * days * (gold ? 0.005 : 0.0025), [entry, days, gold]);

  return (
    <div className="page tribute-page">
      <div className="tribute-hero">
        <img src="/assets/tributecoins-poster.jpg" alt="" />
        <div>
          <p className="eyebrow">Participation, recognized</p>
          <h1>Your tribute.</h1>
          <p className="lede">Earn Silver on eligible Empire positions. Hold 1,000,000 $EMPIREX to earn Gold at twice the daily rate.</p>
          <p className="preview-flag">In preparation. Silver and gold rewards are being prepared. Nothing is accruing yet.</p>
        </div>
      </div>

      <div className="tier-grid">
        <article className={gold ? "" : "is-current"}>
          <img src="/assets/empire-coin-ag.png" alt="" />
          <h2>Silver · 0.25% daily</h2>
          <p>The base rate on eligible positions opened through Empire.</p>
        </article>
        <article className={gold ? "is-current" : ""}>
          <img src="/assets/empire-coin-au.png" alt="" />
          <h2>Gold · 0.5% daily</h2>
          <p>Hold at least 1,000,000 $EMPIREX to qualify for Gold. Gold replaces Silver; the rates do not stack.</p>
        </article>
      </div>

      <section className="panel calculator">
        <div>
          <p className="eyebrow">How Tribute accrues</p>
          <h2>Entry value × time open × daily rate.</h2>
          <p className="muted">Rewards are paid automatically after daily settlement. No claim is required. Closing a position stops new accrual.</p>
          <label className="check">
            <input type="checkbox" checked={gold} onChange={(event) => setGold(event.target.checked)} />
            Example uses the Gold rate
          </label>
        </div>
        <div>
          <label>
            Example position entry value
            <input type="number" min="0" value={entry} onChange={(event) => setEntry(Number(event.target.value))} />
          </label>
          <label>
            Days open
            <input type="number" min="1" value={days} onChange={(event) => setDays(Number(event.target.value))} />
          </label>
          <dl className="ticket-stats">
            <div><dt>{gold ? "Gold" : "Silver"} example</dt><dd>${reward.toLocaleString("en-US", { maximumFractionDigits: 2 })}</dd></div>
            <div><dt>Position maximum</dt><dd>$25</dd></div>
            <div><dt>Wallet maximum / day</dt><dd>$100</dd></div>
          </dl>
        </div>
      </section>

      <section className="panel">
        <h2>Your Tribute account</h2>
        {account.wallet ? (
          <p>No rewards recorded yet. Eligible positions opened through Empire earn Tribute.</p>
        ) : (
          <p>Connect to view your Tribute. Connect your wallet to see verified positions and rewards.</p>
        )}
        <ul className="rule-list">
          <li>Only verified exposure opened through Empire after the program starts is eligible.</li>
          <li>Maximum per position is $25 across its lifetime.</li>
          <li>Maximum per wallet per day is $100, resetting at 00:00 UTC.</li>
          <li>Daily excess does not roll over.</li>
        </ul>
      </section>
    </div>
  );
}

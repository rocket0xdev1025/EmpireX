import { useState } from "react";

const STEPS = [
  { n: "01", title: "Bridge USDG", copy: "USDG leaves your Robinhood wallet." },
  { n: "02", title: "Arrive on HyperEVM", copy: "The same value arrives as USDC." },
  { n: "03", title: "Deposit to HyperCore", copy: "USDC is posted to the trading account." },
];

export default function DepositDialog({ account, onClose }) {
  const [amount, setAmount] = useState("1000");
  const [done, setDone] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!account.wallet) {
      account.openConnect();
      return;
    }
    account.fund(amount);
    setDone(true);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal deposit-modal" role="dialog" aria-labelledby="deposit-title" onClick={(event) => event.stopPropagation()}>
        <div className="deposit-hero" />
        <p className="eyebrow">Deposit funds</p>
        <h2 id="deposit-title">Fund your next trade.</h2>
        <p className="muted">Move USDG from Robinhood to USDC on HyperEVM, then deposit it to HyperCore.</p>
        <ol className="steps">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span>{step.n}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
        {done ? (
          <p className="success-note">Preview transfer recorded. Trading USDC was credited in this local session.</p>
        ) : (
          <form onSubmit={submit} className="deposit-form">
            <label>
              USDG transfer amount
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <button className="mint-btn wide" type="submit">Review transfer</button>
          </form>
        )}
        <button className="text-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

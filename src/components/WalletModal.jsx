import { useState } from "react";
import { requestAccount, walletInstalled, walletLinks } from "../wallet.js";

const OPTIONS = [
  { id: "metamask", name: "MetaMask" },
  { id: "phantom", name: "Phantom" },
  { id: "rabby", name: "Rabby Wallet" },
  { id: "browser", name: "Browser Wallet" },
];

function WalletGlyph({ id }) {
  if (id === "metamask") return <img src="/assets/wallets/metamask.svg" alt="" />;
  if (id === "phantom") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="#AB9FF2" />
        <path fill="#fff" d="M14.2 7.2c2.4 0 3.8 1.6 3.8 3.6 0 2.2-1.4 4.2-2.8 4.2-.4 0-.7-.2-.7-.6 0-.1 0-.2.1-.3-.6.8-1.6 1.5-2.5 1.5-.7 0-1.1-.4-1.1-1 0-.2 0-.4.1-.6-1.4 1.1-3.2 2.2-4.1 2.2-.8 0-1.6-.4-1.6-1.7 0-3.2 4.2-8.3 8.8-8.3Z" />
      </svg>
    );
  }
  if (id === "rabby") {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="#7084ff" />
        <path fill="#fff" d="M8 16.5c1.2 2.4 3.2 3.8 6 3.8 3.6 0 6-2.6 6-6.2S17.4 8 14 8c-2.2 0-4 .9-5.2 2.4l1.6 1.2C11.2 10.4 12.4 9.8 14 9.8c2.4 0 4.2 1.9 4.2 4.3S16.4 18.4 14 18.4c-1.9 0-3.3-.9-4.2-2.4L8 16.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#e8eef8" />
      <circle cx="14" cy="14" r="5" fill="#4c6fff" />
    </svg>
  );
}

export default function WalletModal({ account, onClose }) {
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const links = walletLinks();

  async function choose(id) {
    setError("");
    setPending(id);
    try {
      const address = await requestAccount(id);
      account.connect(address);
      onClose();
    } catch (caught) {
      const code = caught?.code;
      if (code === 4001) setError("Request declined in the wallet.");
      else if (code === "not-installed") setError("That wallet is not installed in this browser.");
      else setError(caught?.message || "Wallet request failed.");
    } finally {
      setPending("");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="wallet-modal" role="dialog" aria-labelledby="rk_connect_title" onClick={(event) => event.stopPropagation()}>
        <header>
          <span className="wallet-info" aria-hidden="true">?</span>
          <h2 id="rk_connect_title">Connect a Wallet</h2>
          <button type="button" aria-label="Close" onClick={onClose}>×</button>
        </header>
        <p className="wallet-kicker">Connect your wallet</p>
        <div className="wallet-options">
          {OPTIONS.map((option) => {
            const installed = walletInstalled(option.id);
            return (
              <button key={option.id} type="button" disabled={Boolean(pending)} onClick={() => choose(option.id)}>
                <span className={`wallet-glyph is-${option.id}`}><WalletGlyph id={option.id} /></span>
                <span>{option.name}</span>
                <small>{pending === option.id ? "Waiting…" : installed ? "Installed" : "Install"}</small>
              </button>
            );
          })}
        </div>
        {error && <p className="wallet-error">{error}</p>}
        <div className="wallet-phone">
          <strong>Using a phone?</strong>
          <p>Open Empire in your wallet&apos;s browser, then tap Connect wallet.</p>
          <div>
            <a href={links.metamask} target="_blank" rel="noreferrer">Open MetaMask</a>
            <a href={links.phantom} target="_blank" rel="noreferrer">Open Phantom</a>
          </div>
        </div>
      </div>
    </div>
  );
}

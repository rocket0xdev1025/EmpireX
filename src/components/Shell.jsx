import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AccentChevron, ArrowIcon, EmpireMark, HyperliquidMark, RobinhoodMark } from "./Icons.jsx";
import DepositDialog from "./DepositDialog.jsx";
import WalletModal from "./WalletModal.jsx";

const NAV = [
  { to: "/", label: "Overview", end: true },
  { to: "/trade", label: "Trade" },
  { to: "/borrow", label: "Borrow" },
  { to: "/tribute", label: "Tribute" },
  { to: "/portfolio", label: "Portfolio" },
];

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function WalletButton({ account, onConnect }) {
  return (
    <button className="wallet-btn" type="button" aria-label={account.wallet ? shortAddress(account.wallet) : "Connect wallet"} onClick={() => (account.wallet ? account.disconnect() : onConnect())}>
      <span className="am-accent" aria-hidden="true">
        <AccentChevron />
      </span>
      <span className="am-label">{account.wallet ? shortAddress(account.wallet) : "Connect wallet"}</span>
    </button>
  );
}

export default function Shell({ account, walletOpen, setWalletOpen, depositOpen, setDepositOpen, notice, clearNotice, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = NAV.find((item) => (item.end ? location.pathname === "/" : location.pathname.startsWith(item.to)));

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
    const titles = {
      "/": "Overview | EmpireX",
      "/trade": "BTC Perpetuals | EmpireX",
      "/borrow": "Borrow | EmpireX",
      "/tribute": "Tribute | EmpireX",
      "/portfolio": "Portfolio | EmpireX",
    };
    document.title = titles[location.pathname] || (location.pathname.startsWith("/trade") ? "Trade | EmpireX" : "Empire — Fortune favors the bold");
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {location.pathname.startsWith("/trade") && <div className="trade-backdrop" aria-hidden="true" />}
      <header className="notch-nav">
        <div className="notch-row">
          <div className="notch notch-logo">
            <button className="notch-brand" onClick={() => navigate("/")} aria-label="EmpireX home">
              <EmpireMark />
              <span>EMPIREX</span>
            </button>
          </div>

          <nav className="notch notch-center" aria-label="Main navigation">
            <a className="notch-social" href="https://x.com/EmpireXhub" target="_blank" rel="noreferrer" aria-label="EmpireX on X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.5l-5.1-6.7L6 22H2.8l7.3-8.4L.9 2h6.6l4.6 6.1L18.9 2Zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20Z" />
              </svg>
            </a>
            <div className="notch-items">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `notch-item${isActive ? " is-active" : ""}`}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="notch notch-actions">
            <button className="balance-chip" onClick={() => setDepositOpen(true)}>
              <img src="/assets/tokens/HOOD.png" alt="" />
              <span>USDG</span>
              <strong>{account.wallet && account.balances.usdg != null ? account.balances.usdg.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}</strong>
            </button>
            <button className="balance-chip" onClick={() => setDepositOpen(true)}>
              <img src="/assets/tokens/HYPE.svg" alt="" />
              <span>USDC</span>
              <strong>{account.wallet && account.balances.usdc != null ? account.balances.usdc.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}</strong>
            </button>
            <WalletButton account={account} onConnect={() => setWalletOpen(true)} />
          </div>

          <div className="mobile-bar">
            <button className="notch-brand" onClick={() => navigate("/")} aria-label="EmpireX home">
              <EmpireMark />
            </button>
            <button className="mobile-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {current?.label ?? "Overview"}
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <WalletButton account={account} onConnect={() => setWalletOpen(true)} />
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-sheet">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="mobile-link">
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-brand">
          <EmpireMark size={18} />
          <span>EMPIREX</span>
        </div>
        <p className="footer-credits">
          <span>Execution by <HyperliquidMark /> Hyperliquid</span>
          <i aria-hidden="true">·</i>
          <span>Assets on <RobinhoodMark /> Robinhood Chain</span>
        </p>
        <nav className="footer-links" aria-label="Contact and social links">
          <a href="https://x.com/EmpireXhub" target="_blank" rel="noreferrer" aria-label="EmpireX on X: @EmpireXhub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @EmpireXhub
          </a>
        </nav>
        <span className="footer-copy">© 2026</span>
      </footer>

      {notice && (
        <button className="toast" onClick={clearNotice}>
          {notice}
        </button>
      )}

      {walletOpen && <WalletModal account={account} onClose={() => setWalletOpen(false)} />}

      {depositOpen && <DepositDialog account={account} onClose={() => setDepositOpen(false)} />}
      <span className="sr-only"><ArrowIcon /></span>
    </div>
  );
}

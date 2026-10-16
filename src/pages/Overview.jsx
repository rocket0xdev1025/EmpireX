import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TokenIcon from "../components/TokenIcon.jsx";
import { ArrowIcon, DotsIcon, EmpireMark, HyperliquidMark, RobinhoodMark } from "../components/Icons.jsx";
import { cryptoRail, equityRail, findMarket, formatPrice, markets } from "../data.js";

const TABS = ["All", "Crypto", "Equities", "Metals"];

function Rail({ symbols, onOpen }) {
  const items = [...symbols, ...symbols];
  return (
    <div className="rail">
      <div className="rail-track">
        {items.map((symbol, index) => {
          const market = findMarket(symbol);
          const down = market.change < 0;
          return (
            <button key={`${symbol}-${index}`} className="rail-card" onClick={() => onOpen(symbol)}>
              <TokenIcon symbol={symbol} size={34} />
              <span>
                <strong>{symbol}</strong>
                <small>{market.name}</small>
              </span>
              <em>{formatPrice(market.price)}</em>
              <b className={down ? "down" : "up"}>{down ? "↓" : "↑"} {Math.abs(market.change).toFixed(2)}%</b>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Overview({ onFund }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const counts = useMemo(
    () => ({
      All: markets.length,
      Crypto: markets.filter((market) => market.category === "crypto").length,
      Equities: markets.filter((market) => market.category === "equities").length,
      Metals: markets.filter((market) => market.category === "metals").length,
    }),
    [],
  );
  const rows = useMemo(() => {
    if (tab === "All") return ["BTC", "NVDA", "XAU", "ETH", "TSLA"].map((symbol) => findMarket(symbol));
    if (tab === "Crypto") return markets.filter((market) => market.category === "crypto").slice(0, 5);
    if (tab === "Equities") return markets.filter((market) => market.category === "equities").slice(0, 5);
    return markets.filter((market) => market.category === "metals");
  }, [tab]);

  return (
    <div className="forum-page">
      <section className="legion-hero">
        <img className="legion-backdrop" src="/assets/empirebg-poster.jpg" alt="" />
        <div className="legion-shade" />
        <div className="legion-content">
          <p className="hero-eyebrow">
            <i />
            <span>Built on <RobinhoodMark /> Robinhood</span>
            <span className="sep">–</span>
            <span>Powered By <HyperliquidMark /> Hyperliquid</span>
          </p>
          <h1>
            The world.
            <br />
            Your <em>Empire.</em>
          </h1>
          <p className="lede">
            Trade global markets. Unlock your assets.
            <br />
            Build something that lasts.
          </p>
          <div className="hero-actions">
            <button className="mint-btn" onClick={() => navigate("/trade")}>
              <span className="mint-icon"><DotsIcon /></span>
              Start trading
            </button>
            <button className="ghost-link" onClick={onFund}>
              Fund your account <ArrowIcon />
            </button>
          </div>
          <div className="hero-metals">
            <span><TokenIcon symbol="BTC" size={28} /><TokenIcon symbol="ETH" size={28} /><TokenIcon symbol="SOL" size={28} /> Crypto</span>
            <span><TokenIcon symbol="NVDA" size={28} /><TokenIcon symbol="TSLA" size={28} /><TokenIcon symbol="AAPL" size={28} /> Equities</span>
            <span><TokenIcon symbol="XAU" size={28} /><TokenIcon symbol="XAG" size={28} /> Commodities</span>
          </div>
        </div>
      </section>

      <section className="asset-carousel" aria-label="Featured markets">
        <header className="section-head">
          <div>
            <span className="live-dot">Market snapshot</span>
            <small>Refresh page to update</small>
          </div>
          <button className="ghost-link" onClick={() => document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" })}>
            Explore all {markets.length} markets <ArrowIcon />
          </button>
        </header>
        <Rail symbols={cryptoRail} onOpen={(symbol) => navigate(`/trade/${symbol}`)} />
        <Rail symbols={equityRail} onOpen={(symbol) => navigate(`/trade/${symbol}`)} />
      </section>

      <section className="move-section" id="markets">
        <img className="section-bg" src="/assets/empiremarket-poster.jpg" alt="" />
        <div className="move-shade" />
        <div className="section-copy">
          <p className="eyebrow">Markets without borders</p>
          <h2>
            Your next move.
            <br />
            <span>Starts here.</span>
          </h2>
          <div className="market-tabs" role="tablist" aria-label="Market category">
            {TABS.map((name) => (
              <button key={name} role="tab" aria-selected={tab === name} className={tab === name ? "is-active" : ""} onClick={() => setTab(name)}>
                {name}
                <span>{counts[name]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="market-panel">
          <div className="table-head">
            <span>Asset</span>
            <span>Snapshot price / USD</span>
            <span>24h snapshot</span>
            <span />
          </div>
          {rows.map((market) => (
            <button key={market.symbol} className="table-row" onClick={() => navigate(`/trade/${market.symbol}`)}>
              <span className="asset-cell">
                <TokenIcon symbol={market.symbol} size={32} />
                <span>
                  <strong>{market.symbol === "XAU" ? "GOLD" : market.symbol}</strong>
                  <small>{market.name}</small>
                </span>
              </span>
              <strong className="price">{formatPrice(market.price)}</strong>
              <span className={market.change < 0 ? "down" : "up"}>
                {market.change < 0 ? "" : "+"}
                {market.change.toFixed(2)}%
              </span>
              <svg className="row-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </button>
          ))}
          <button className="table-foot" onClick={() => navigate("/trade")}>
            <span>Explore all markets</span>
            <span>{markets.length} markets <ArrowIcon /></span>
          </button>
        </div>
      </section>

      <section className="capital-section">
        <div className="capital-copy">
          <p className="eyebrow">Capital, unlocked</p>
          <h2>
            Your capital.
            <br />
            Global possibilities.
          </h2>
          <p>
            Move USDG from Robinhood to USDC on HyperEVM.
            <br />
            Fund your Hyperliquid account and choose your next market.
          </p>
          <button className="mint-btn" onClick={onFund}>
            <span className="mint-icon"><DotsIcon /></span>
            Fund your account
          </button>
        </div>
        <div className="capital-flow" role="img" aria-label="USDG from your Robinhood Chain wallet is bridged through Empire, arrives as USDC on HyperEVM and is deposited to HyperCore.">
          <span className="cf-network origin"><RobinhoodMark /> Robinhood Chain</span>
          <span className="cf-network target"><HyperliquidMark /> Hyperliquid</span>
          <div className="cf-chips">
            <span className="cf-chip"><img src="/assets/tokens/USDG.png" alt="" /> USDG</span>
            <span className="cf-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
              </svg>
              Your wallet
            </span>
          </div>
          <div className="cf-lane in" aria-hidden="true">
            <svg viewBox="0 0 260 116" preserveAspectRatio="none">
              <path d="M2 26C90 26 150 58 258 58" />
              <path d="M2 90C90 90 150 58 258 58" />
            </svg>
          </div>
          <div className="cf-core" aria-hidden="true">
            <span className="cf-ring" />
            <EmpireMark size={46} />
          </div>
          <div className="cf-lane out" aria-hidden="true">
            <svg viewBox="0 0 260 116" preserveAspectRatio="none">
              <path d="M0 58H258" />
            </svg>
            <img src="/assets/tokens/USDC.svg" alt="" />
          </div>
          <div className="cf-result">
            <img src="/assets/tokens/USDC.svg" alt="" />
            <strong>USDC</strong>
          </div>
          <span className="cf-destination"><HyperliquidMark /> HyperEVM <i /> HyperCore</span>
          <span className="cf-step s1"><b>1</b> Bridge USDG</span>
          <span className="cf-step s2"><b>2</b> Arrive on HyperEVM</span>
          <span className="cf-step s3"><b>3</b> Deposit to HyperCore</span>
        </div>
      </section>

      <section className="tribute-section">
        <img className="section-bg coins" src="/assets/tributecoins-poster.jpg" alt="" />
        <div className="section-copy">
          <p className="eyebrow">Earn Tribute</p>
          <h2>
            A little silver.
            <br />
            A higher standard.
          </h2>
          <p className="lede">
            Earn Silver on eligible Empire positions.
            <br />
            Hold 1,000,000 $EMPIREX to earn Gold at twice the daily rate.
          </p>
        </div>
        <div className="tribute-card">
          <div className="metal-row">
            <img src="/assets/empire-coin-au.png" alt="Gold" />
            <div>
              <strong>Gold</strong>
              <span>0.5% daily</span>
            </div>
            <img src="/assets/empire-coin-ag.png" alt="Silver" />
            <div>
              <strong>Silver</strong>
              <span>0.25% daily</span>
            </div>
          </div>
          <p className="formula">Entry value <i>×</i> Time open <i>×</i> Reward rate</p>
          <button className="mint-btn wide" onClick={() => navigate("/tribute")}>
            <span className="mint-icon"><DotsIcon /></span>
            Discover Tribute
          </button>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TokenIcon from "../components/TokenIcon.jsx";
import { AccentChevron, ArrowIcon, EmpireMark, HyperliquidMark, RobinhoodMark } from "../components/Icons.jsx";
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
  const flowRef = useRef(null);
  const tributeRef = useRef(null);
  const videoRef = useRef(null);
  const [flowOn, setFlowOn] = useState({ revealed: false, active: false });
  const [tributeOn, setTributeOn] = useState({ revealed: false, active: false });
  const [videoOn, setVideoOn] = useState(false);
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

  useEffect(() => {
    const node = flowRef.current;
    if (!node) return undefined;
    let timer;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setFlowOn({ revealed: true, active: false });
      timer = window.setTimeout(() => setFlowOn({ revealed: true, active: true }), 700);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const node = tributeRef.current;
    const video = videoRef.current;
    if (!node) return undefined;
    let timer;
    const onPlaying = () => setVideoOn(true);
    video?.addEventListener("playing", onPlaying);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setTributeOn({ revealed: true, active: false });
      timer = window.setTimeout(() => setTributeOn({ revealed: true, active: true }), 400);
      video?.play().catch(() => {});
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      video?.removeEventListener("playing", onPlaying);
    };
  }, []);

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
            0x5a03abc090301b2e9d12349bf3eda99f2d67c1c2
          </p>
          <div className="hero-actions">
            <button className="mint-btn" onClick={() => navigate("/trade")}>
              <span className="am-accent" aria-hidden="true"><AccentChevron /></span>
              <span className="am-label">Start trading</span>
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
            <span className="am-accent" aria-hidden="true"><AccentChevron /></span>
            <span className="am-label">Fund your account</span>
          </button>
        </div>
        <div
          className="capital-flow"
          ref={flowRef}
          data-revealed={flowOn.revealed ? "" : undefined}
          data-active={flowOn.active ? "" : undefined}
          role="img"
          aria-label="USDG from your Robinhood Chain wallet is bridged through Empire, arrives as USDC on HyperEVM and is deposited to HyperCore."
        >
          <span className="cf-network origin br-reveal" style={{ "--i": 0 }}><RobinhoodMark /> Robinhood Chain</span>
          <span className="cf-network target br-reveal" style={{ "--i": 5 }}><HyperliquidMark /> Hyperliquid</span>
          <div className="cf-chips br-reveal" style={{ "--i": 1 }}>
            <span className="cf-chip"><img src="/assets/tokens/USDG.png" alt="" /> USDG</span>
            <span className="cf-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
              </svg>
              Your wallet
            </span>
          </div>
          <div className="cf-lane in br-reveal" style={{ "--i": 2 }} aria-hidden="true">
            <svg viewBox="0 0 100 116" preserveAspectRatio="none">
              <defs>
                <linearGradient id="br-pulse-in" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ccff00" />
                  <stop offset="1" stopColor="#97fce4" />
                </linearGradient>
              </defs>
              <path className="cf-track" d="M0 26 C16 26 10 58 28 58 H100" pathLength="100" />
              <path className="cf-track" d="M0 90 C16 90 10 58 28 58 H100" pathLength="100" />
              <path className="cf-pulse cf-pulse-in" d="M0 26 C16 26 10 58 28 58 H100" pathLength="100" stroke="url(#br-pulse-in)" />
              <path className="cf-pulse cf-pulse-in" d="M0 90 C16 90 10 58 28 58 H100" pathLength="100" stroke="url(#br-pulse-in)" />
            </svg>
            <span className="br-rail br-rail-in"><span className="br-coin"><img src="/assets/tokens/USDG.png" alt="" /></span></span>
          </div>
          <div className="cf-core br-reveal" style={{ "--i": 3 }} aria-hidden="true">
            <span className="cf-ring" />
            <span className="cf-halo" />
            <span className="cf-empire"><EmpireMark size={46} /></span>
          </div>
          <div className="cf-lane out br-reveal" style={{ "--i": 4 }} aria-hidden="true">
            <svg viewBox="0 0 100 116" preserveAspectRatio="none">
              <path className="cf-track" d="M0 58 H100" pathLength="100" />
              <path className="cf-pulse cf-pulse-out" d="M0 58 H100" pathLength="100" />
            </svg>
            <span className="br-rail br-rail-out"><span className="br-coin"><img src="/assets/tokens/USDC.svg" alt="" /></span></span>
          </div>
          <div className="cf-result br-reveal" style={{ "--i": 5 }}>
            <span className="cf-token"><img src="/assets/tokens/USDC.svg" alt="" /><i aria-hidden="true" /></span>
            <strong data-text="USDC">USDC</strong>
          </div>
          <span className="cf-destination br-reveal" style={{ "--i": 6 }}><HyperliquidMark /> HyperEVM <i /> HyperCore</span>
          <span className="cf-step s1 br-step br-step-1 br-reveal" style={{ "--i": 7 }}><b>1<span aria-hidden="true">1</span></b> Bridge USDG</span>
          <span className="cf-step s2 br-step br-step-2 br-reveal" style={{ "--i": 8 }}><b>2<span aria-hidden="true">2</span></b> Arrive on HyperEVM</span>
          <span className="cf-step s3 br-step br-step-3 br-reveal" style={{ "--i": 9 }}><b>3<span aria-hidden="true">3</span></b> Deposit to HyperCore</span>
        </div>
      </section>

      <section className="forum-tribute" ref={tributeRef}>
        <img className="tribute-backdrop" alt="" src="/assets/tributecoins-poster.jpg" />
        <video
          className={`tribute-backdrop tribute-video${videoOn ? " is-playing" : ""}`}
          ref={videoRef}
          loop
          muted
          playsInline
          preload="metadata"
          poster="/assets/tributecoins-poster.jpg"
          aria-hidden="true"
        >
          <source src="/assets/tributecoins-1080.mp4" type="video/mp4" media="(max-width: 900px)" />
          <source src="/assets/tributecoins-1440.mp4" type="video/mp4" />
        </video>
        <div className="tribute-shade" aria-hidden="true" />
        <div className="forum-tribute-copy">
          <span className="civic-label">Earn Tribute</span>
          <h2>
            A little silver.
            <br />
            A higher standard.
          </h2>
          <p>
            Earn Silver on eligible Empire positions.
            <br />
            Hold 1,000,000 $EMPIREX to earn Gold at twice the daily rate.
          </p>
          <div className="tribute-card" data-revealed={tributeOn.revealed ? "" : undefined} data-active={tributeOn.active ? "" : undefined}>
            <div className="tc-metals" style={{ "--i": 0 }}>
              <span className="tc-metal tc-au"><img src="/assets/empire-coin-au.png" alt="" /><strong>Gold</strong></span>
              <span className="tc-metal tc-ag"><img src="/assets/empire-coin-ag.png" alt="" /><strong>Silver</strong></span>
            </div>
            <div className="tc-formula" style={{ "--i": 1 }} aria-label="Rewards accrue as entry value times time open times reward rate">
              <span className="tc-factor">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                Entry value
              </span>
              <i aria-hidden="true">×</i>
              <span className="tc-factor">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4.5 0" /></svg>
                Time open
              </span>
              <i aria-hidden="true">×</i>
              <span className="tc-factor">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
                Reward rate
              </span>
            </div>
            <div className="tc-accrual" style={{ "--i": 2 }}>
              <div className="tc-track" aria-hidden="true">
                <span className="tc-run tc-run-au"><span className="tc-fill" /><span className="tc-rail"><span className="tc-coin"><img src="/assets/empire-coin-au.png" alt="" /></span></span></span>
                <span className="tc-run tc-run-ag"><span className="tc-fill" /><span className="tc-rail"><span className="tc-coin"><img src="/assets/empire-coin-ag.png" alt="" /></span></span></span>
                <span className="tc-wallet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                </span>
              </div>
            </div>
            <button className="mint-btn wide tc-cta" style={{ "--i": 3 }} type="button" onClick={() => navigate("/tribute")}>
              <span className="am-accent" aria-hidden="true"><AccentChevron /></span>
              <span className="am-label">Discover Tribute</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

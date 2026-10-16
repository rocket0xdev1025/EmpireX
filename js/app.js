const RAW = [
  ["BTC", "Bitcoin", 81588, -0.85, "crypto", "#f7931a", "₿"],
  ["ETH", "Ethereum", 2411.6, -1.74, "crypto", "#627eea", "◆"],
  ["SOL", "Solana", 103.57, -2.1, "crypto", "#9945ff", "◎"],
  ["HYPE", "Hyperliquid", 79.11, -3.5, "crypto", "#14b89a", "H"],
  ["XRP", "Ripple", 1.301, -2.92, "crypto", "#23292f", "✕"],
  ["BNB", "Binance Coin", 721, -1.46, "crypto", "#f3ba2f", "B"],
  ["DOGE", "Dogecoin", 0.08024, -1.46, "crypto", "#c2a633", "Ð"],
  ["AVAX", "Avalanche", 9.989, -0.6, "crypto", "#e84142", "A"],
  ["LINK", "Chainlink", 12.3, -1.83, "crypto", "#2a5ada", "⬡"],
  ["SUI", "SUI", 1.018, -1.51, "crypto", "#4da2ff", "S"],
  ["AAVE", "Aave", 155.94, -0.41, "crypto", "#b6509e", "A"],
  ["ENA", "Ethena", 0.19879, -2.88, "crypto", "#9aa4b2", "E"],
  ["LTC", "Litecoin", 59.73, -1.22, "crypto", "#345d9d", "Ł"],
  ["NVDA", "NVIDIA", 213.83, -1.76, "equity", "#76b900", "N"],
  ["TSLA", "Tesla", 354.3, -2.26, "equity", "#e31937", "T"],
  ["AAPL", "Apple", 343.27, 0.42, "equity", "#555b60", "A"],
  ["MSFT", "Microsoft", 528.75, -1.85, "equity", "#00a4ef", "M"],
  ["AMZN", "Amazon", 250.09, -1.88, "equity", "#ff9900", "a"],
  ["GOOGL", "Google", 341.04, -2.36, "equity", "#4285f4", "G"],
  ["META", "Meta", 710.38, -3.43, "equity", "#0668e1", "∞"],
  ["COIN", "Coinbase", 173.33, -5.19, "equity", "#0052ff", "C"],
  ["HOOD", "Robinhood", 99.28, -4.33, "equity", "#c3f53c", "h"],
  ["PLTR", "Palantir", 185.35, -7.46, "equity", "#9aa0a6", "P"],
  ["AMD", "Advanced Micro Devices", 528.7, -5.94, "equity", "#ed1c24", "▲"],
  ["MSTR", "Strategy", 137.15, -9.36, "equity", "#cf0a2c", "M"],
  ["TSM", "TSMC", 412.63, -2.61, "equity", "#c41230", "T"],
  ["GOLD", "Gold", 4169, -0.15, "metal", "#e0b44f", "Au"]
];

const MARKETS = RAW.map(([symbol, name, price, change, kind, color, glyph]) => ({
  symbol, name, price, change, kind, color, glyph
}));

const TITLES = {
  overview: "Overview",
  trade: "Trade",
  borrow: "Borrow",
  tribute: "Tribute",
  portfolio: "Portfolio",
  markets: "Markets"
};

const STORE = "empirex-demo-v1";
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
  catch { return {}; }
})();

const state = {
  wallet: saved.wallet || null,
  positions: saved.positions || [],
  filter: "all",
  navOpen: false,
  modal: null,
  side: "long",
  query: "",
  page: "overview",
  symbol: "BTC"
};

const $ = (id) => document.getElementById(id);

function persist() {
  localStorage.setItem(STORE, JSON.stringify({ wallet: state.wallet, positions: state.positions }));
}

function market(symbol) {
  return MARKETS.find((m) => m.symbol === symbol) || MARKETS[0];
}

function fmt(n) {
  if (n >= 100) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 5 });
}

function money(n) {
  return (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function chgHtml(m) {
  const up = m.change >= 0;
  return `<span class="chg ${up ? "up" : "down"}" data-chg="${m.symbol}">${up ? "▲" : "▼"} ${Math.abs(m.change).toFixed(2)}%</span>`;
}

function token(m) {
  return `<span class="token" style="--c:${m.color}">${m.glyph}</span>`;
}

function chev() {
  return `<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><g fill="#06352c"><circle cx="3" cy="2" r="1.05"/><circle cx="6" cy="5" r="1.05"/><circle cx="9" cy="8" r="1.05"/><circle cx="6" cy="11" r="1.05"/><circle cx="3" cy="14" r="1.05"/><circle cx="7" cy="2" r="1.05"/><circle cx="10" cy="5" r="1.05"/><circle cx="13" cy="8" r="1.05"/><circle cx="10" cy="11" r="1.05"/><circle cx="7" cy="14" r="1.05"/></g></svg>`;
}

function mark() {
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h11l5 5-5 5H4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 12h9" stroke="currentColor" stroke-width="1.8"/></svg>`;
}

function icon(name) {
  const common = `width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    compass: `<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-1.8 5.4-5.4 1.8 1.8-5.4z"/>`,
    trade: `<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>`,
    borrow: `<path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
    medal: `<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5"/>`,
    bag: `<path d="M6 7h12l-1 14H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>`,
    wallet: `<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-5h-4a2 2 0 0 1 0-4h4V9a2 2 0 0 0-2-2"/>`,
    arrow: `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`
  };
  return `<svg ${common} aria-hidden="true">${paths[name] || ""}</svg>`;
}

function parseRoute() {
  const parts = (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean);
  const page = TITLES[parts[0]] ? parts[0] : "overview";
  const symbol = (parts[1] || "BTC").toUpperCase();
  return { page, symbol: market(symbol).symbol };
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function navHtml() {
  const page = state.page;
  const label = TITLES[page] || "Overview";
  const w = state.wallet;
  const items = [
    ["overview", "Overview", "compass"],
    ["trade", "Trade", "trade"],
    ["borrow", "Borrow", "borrow"],
    ["tribute", "Tribute", "medal"],
    ["portfolio", "Portfolio", "bag"]
  ];
  return `
    <header class="notch">
      <svg class="wing wing-l" viewBox="0 0 20 20" aria-hidden="true"><path d="M0 0C11 0 20 9 20 20H21V-1H0Z" fill="#07111f"/></svg>
      <div class="island">
        <a class="brand" href="#/" aria-label="EmpireX home">${mark()}</a>
        <button class="nav-trigger" data-act="toggle-nav" aria-expanded="${state.navOpen}" aria-label="${label}, open navigation menu">
          ${icon("compass")}<span>${label}</span>
          <svg class="chev-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <button class="chip-bal" data-act="deposit" aria-label="USDG balance and deposit">
          <span class="dot">$</span>
          <span><small>USDG</small><b>${w ? money(w.usdg) : "--"}</b></span>
        </button>
        <button class="chip-bal" data-act="deposit" aria-label="USDC balance and deposit">
          <span class="dot hl">◈</span>
          <span><small>USDC · TRADING</small><b>${w ? money(w.usdc) : "--"}</b></span>
        </button>
        <button class="btn-connect" data-act="wallet">
          ${icon("wallet")}
          <span>${w ? shortAddr(w.address) : "Connect wallet"}</span>
        </button>
        ${state.navOpen ? `<nav class="nav-pop" aria-label="Main navigation">${items.map(([id, name, ic]) => `<a href="#/${id === "overview" ? "" : id}" ${page === id ? 'aria-current="page"' : ""}>${icon(ic)}${name}</a>`).join("")}</nav>` : ""}
      </div>
      <svg class="wing wing-r" viewBox="0 0 20 20" aria-hidden="true"><path d="M20 0C9 0 0 9 0 20H-1V-1H20Z" fill="#07111f"/></svg>
    </header>`;
}

function tick(m) {
  return `<a class="tick" href="#/trade/${m.symbol}">${token(m)}<b>${m.symbol}</b><span class="px" data-px="${m.symbol}">${fmt(m.price)}</span><span class="name">${m.name}</span>${chgHtml(m)}</a>`;
}

function row(m) {
  return `<a class="mrow" href="#/trade/${m.symbol}">${token(m)}<span class="mmeta"><b>${m.symbol}</b><small>${m.name}</small></span><span class="px" data-px="${m.symbol}">${fmt(m.price)}</span>${chgHtml(m)}<span class="arrow">→</span></a>`;
}

function previewList() {
  if (state.filter === "crypto") return MARKETS.filter((m) => m.kind === "crypto").slice(0, 5);
  if (state.filter === "equity") return MARKETS.filter((m) => m.kind === "equity").slice(0, 5);
  if (state.filter === "metal") return MARKETS.filter((m) => m.kind === "metal");
  return ["BTC", "NVDA", "GOLD", "ETH", "TSLA"].map(market);
}

function counts() {
  return {
    all: MARKETS.length,
    crypto: MARKETS.filter((m) => m.kind === "crypto").length,
    equity: MARKETS.filter((m) => m.kind === "equity").length,
    metal: MARKETS.filter((m) => m.kind === "metal").length
  };
}

function overviewHtml() {
  const c = counts();
  const crypto = MARKETS.filter((m) => m.kind === "crypto");
  const equity = MARKETS.filter((m) => m.kind === "equity");
  const seq = (list) => `<div class="seq">${list.map(tick).join("")}</div>`;
  const tabs = [
    ["all", "All", c.all],
    ["crypto", "Crypto", c.crypto],
    ["equity", "Equities", c.equity],
    ["metal", "Metals", c.metal]
  ];
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><i class="pip"></i>
          <span class="partner"><i class="mark-rh"></i> Built on <b>Robinhood</b></span>
          <span class="sep">-</span>
          <span class="partner"><i class="mark-hl"></i> Powered By <b>Hyperliquid</b></span>
        </p>
        <h1>The world.<br>Your <em>Empire.</em></h1>
        <p class="lede">Trade global markets. Unlock your assets.<br>Build something that lasts.</p>
        <div class="hero-actions">
          <a class="btn-trade" href="#/trade"><span class="ico">${chev()}</span><span class="lbl">Start trading</span></a>
          <button class="btn-fund" data-act="deposit">Fund your account ${icon("arrow")}</button>
        </div>
        <div class="clusters">
          <div class="cluster"><span class="stack">${["BTC", "ETH", "SOL"].map((s) => token(market(s))).join("")}</span> Crypto</div>
          <i class="cdot"></i>
          <div class="cluster"><span class="stack">${["NVDA", "TSLA", "AAPL"].map((s) => token(market(s))).join("")}</span> Equities</div>
          <i class="cdot"></i>
          <div class="cluster"><span class="stack">${token(market("GOLD"))}<span class="token" style="--c:#c5d0dc">Ag</span></span> Commodities</div>
        </div>
      </div>
    </section>
    <section class="snap" aria-label="Featured markets">
      <div class="snap-head">
        <p><span class="pulse" aria-hidden="true"><i></i><i></i><i></i></span> Market snapshot <span>Prices refresh on this page</span></p>
        <a class="linkish" href="#/markets">Explore all ${c.all} markets →</a>
      </div>
      <div class="marquee">${`<div class="marquee-track">${seq(crypto)}${seq(crypto)}</div>`}</div>
      <div class="marquee rev">${`<div class="marquee-track">${seq(equity)}${seq(equity)}</div>`}</div>
    </section>
    <section class="stage">
      <div class="stage-bg" aria-hidden="true"></div>
      <div class="markets">
        <div>
          <span class="kicker">Markets without borders</span>
          <h2>Your next move.<br><em>Starts here.</em></h2>
          <div class="tabs" role="tablist">
            ${tabs.map(([id, name, n]) => `<button role="tab" data-act="filter" data-filter="${id}" aria-selected="${state.filter === id}">${name} <em>${n}</em></button>`).join("")}
          </div>
        </div>
        <div>
          <div class="list-head"><span></span><span>Asset</span><span>Snapshot price / USD</span><span>24h snapshot</span><span></span></div>
          ${previewList().map(row).join("")}
          <a class="list-foot" href="#/markets">Explore all markets <span>${c.all} markets →</span></a>
        </div>
      </div>
      <div class="treasury">
        <div class="numeral">II</div>
        <div>
          <span class="kicker">Capital, unlocked</span>
          <h2>Your capital.<br>Global possibilities.</h2>
          <p>Move USDG from Robinhood to USDC on HyperEVM.<br>Fund your Hyperliquid account and choose your next market.</p>
          <div class="hero-actions"><button class="btn-trade" data-act="deposit"><span class="ico">${chev()}</span><span class="lbl">Fund your account</span></button></div>
          <div class="flow">
            <div>
              <div class="net"><i class="mark-rh"></i> Robinhood Chain</div>
              <div class="pill"><span class="dot">$</span> USDG</div>
              <div class="pill">${icon("wallet")} Your wallet</div>
            </div>
            <svg class="lanes" viewBox="0 0 120 90" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d6ff4a"/><stop offset="1" stop-color="#97fce4"/></linearGradient></defs>
              <path class="track" d="M0 18 C30 18 24 45 50 45 H120"/>
              <path class="track" d="M0 72 C30 72 24 45 50 45 H120"/>
              <path class="pulse" d="M0 18 C30 18 24 45 50 45 H120"/>
              <path class="pulse" d="M0 72 C30 72 24 45 50 45 H120"/>
            </svg>
            <div class="core">${mark()}</div>
            <svg class="lanes" viewBox="0 0 120 90" preserveAspectRatio="none" aria-hidden="true">
              <path class="track" d="M0 45 H120"/>
              <path class="pulse" d="M0 45 H120"/>
            </svg>
            <div>
              <div class="net"><i class="mark-hl"></i> Hyperliquid</div>
              <div class="pill"><span class="dot hl">◈</span> USDC</div>
              <div class="pill">HyperEVM</div>
              <div class="pill">HyperCore</div>
            </div>
          </div>
          <ol class="steps">
            <li><b>1</b> Bridge USDG</li>
            <li><b>2</b> Arrive on HyperEVM</li>
            <li><b>3</b> Deposit to HyperCore</li>
          </ol>
        </div>
      </div>
    </section>
    <section class="tribute">
      <div class="tribute-copy">
        <span class="kicker">Introducing Tribute</span>
        <h2>A little silver.<br>A higher standard.</h2>
        <p>Introducing the next chapter of participation.<br>Silver and gold are coming to Empire.</p>
        <div class="tcard">
          <div class="metals"><span class="metal"><i class="coin"></i> Gold</span><span class="metal"><i class="coin ag"></i> Silver</span></div>
          <div class="formula"><span class="factor">${icon("borrow")} Entry value</span><i>×</i><span class="factor">◷ Time open</span><i>×</i><span class="factor">% Reward rate</span></div>
          <div class="tracks" aria-hidden="true"><div class="track"><span></span></div><div class="track ag"><span></span></div></div>
          <a class="btn-trade" href="#/tribute"><span class="ico">${chev()}</span><span class="lbl">Discover Tribute</span></a>
        </div>
      </div>
    </section>`;
}

function bookRows(m) {
  const asks = [];
  const bids = [];
  for (let i = 6; i >= 1; i--) asks.push(m.price * (1 + i * 0.0012));
  for (let i = 1; i <= 6; i++) bids.push(m.price * (1 - i * 0.0012));
  const line = (px, klass) => `<div class="lvl ${klass}"><span>${fmt(px)}</span><span>${(Math.abs(Math.sin(px)) * 4 + 0.2).toFixed(3)}</span></div>`;
  return `<div><h3>Asks</h3>${asks.map((p) => line(p, "ask")).join("")}</div><div><h3>Bids</h3>${bids.map((p) => line(p, "bid")).join("")}</div>`;
}

function tradeHtml() {
  const m = market(state.symbol);
  const options = MARKETS.map((item) => `<option value="${item.symbol}" ${item.symbol === m.symbol ? "selected" : ""}>${item.symbol} · ${item.name}</option>`).join("");
  const pos = state.positions;
  return `
    <section class="page">
      <div class="trade-grid">
        <div>
          <div class="card">
            <div class="pair-row">
              <label>Market <select id="pair">${options}</select></label>
              <div style="text-align:right">
                <div class="bigpx" data-px="${m.symbol}">${fmt(m.price)}</div>
                ${chgHtml(m)}
              </div>
            </div>
            <canvas id="chart" aria-label="${m.symbol} price chart"></canvas>
            <div class="book">${bookRows(m)}</div>
          </div>
          <div class="card positions">
            <h3>Open positions</h3>
            ${pos.length ? `<table><thead><tr><th>Market</th><th>Side</th><th>Size</th><th>Entry</th><th>PnL</th><th></th></tr></thead><tbody>
              ${pos.map((p) => {
                const px = market(p.symbol).price;
                const pnl = (px - p.entry) / p.entry * p.size * (p.side === "short" ? -1 : 1);
                return `<tr><td>${p.symbol}</td><td>${p.side}</td><td>${money(p.size)}</td><td>${fmt(p.entry)}</td><td class="${pnl >= 0 ? "chg up" : "chg down"}">${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}</td><td><button class="mini-btn" data-act="close-pos" data-id="${p.id}">Close</button></td></tr>`;
              }).join("")}
            </tbody></table>` : `<p class="empty">No open positions. Place a demo order to see it here.</p>`}
          </div>
        </div>
        <form class="card" data-stop id="ticket">
          <h3>Order ticket</h3>
          <div class="seg">
            <button type="button" class="long ${state.side === "long" ? "on" : ""}" data-act="side" data-side="long">Long</button>
            <button type="button" class="short ${state.side === "short" ? "on" : ""}" data-act="side" data-side="short">Short</button>
          </div>
          <label class="field">Size (USD)<input id="size" type="number" min="1" step="1" value="1000"></label>
          <label class="field">Leverage <output id="lev-out">5×</output><input id="lev" type="range" min="1" max="20" value="5"></label>
          <div class="math"><span>Margin<b id="margin">200.00 USDC</b></span><span>Liq. price<b id="liq">${fmt(m.price * (state.side === "short" ? 1.18 : 0.82))}</b></span></div>
          <p class="note">Illustrative ticket. Orders stay in this browser and never reach a live exchange.</p>
          <button class="full ${state.side}" type="submit">${state.wallet ? "Place demo order" : "Connect to trade"}</button>
        </form>
      </div>
    </section>`;
}

function borrowHtml() {
  const rows = [
    ["USDC", "Settle trades", "4.2%", "6.8%"],
    ["ETH", "Collateral", "1.8%", "3.4%"],
    ["BTC", "Collateral", "0.6%", "2.1%"],
    ["GOLD", "Collateral", "1.1%", "2.8%"]
  ];
  return `
    <section class="page">
      <div class="borrow-grid">
        <div class="prose">
          <span class="kicker">Borrow</span>
          <h2>Credit, without<br><em>leaving the empire.</em></h2>
          <p>Post collateral, borrow against it, and keep the position open. Rates below are illustrative samples for this demo, not live quotes.</p>
          <button class="btn-trade" data-act="deposit"><span class="ico">${chev()}</span><span class="lbl">Fund your account</span></button>
        </div>
        <div class="card">
          <h3>Markets</h3>
          ${rows.map(([sym, use, supply, borrow]) => `<div class="apy"><span><b style="color:white">${sym}</b><small class="note"> ${use}</small></span><span>Supply <b>${supply}</b></span><span>Borrow <b>${borrow}</b></span></div>`).join("")}
        </div>
      </div>
    </section>`;
}

function tributePage() {
  return `
    <section class="page">
      <span class="kicker">Introducing Tribute</span>
      <h2>A little silver.<br><em>A higher standard.</em></h2>
      <div class="borrow-grid" style="margin-top:28px">
        <div class="prose">
          <p>Tribute is the participation layer. Gold and silver are the next markets, and rewards are framed as a simple product of size and time.</p>
          <div class="tcard">
            <div class="metals"><span class="metal"><i class="coin"></i> Gold</span><span class="metal"><i class="coin ag"></i> Silver</span></div>
            <div class="formula"><span class="factor">Entry value</span><i>×</i><span class="factor">Time open</span><i>×</i><span class="factor">Reward rate</span></div>
            <div class="tracks"><div class="track"><span></span></div><div class="track ag"><span></span></div></div>
            <p class="note">Holding a qualifying position accrues tribute. Silver is not listed yet. Gold already has a snapshot market.</p>
          </div>
        </div>
        <div class="card">
          <h3>How it reads</h3>
          <div class="apy"><span>Gold snapshot</span><b data-px="GOLD">${fmt(market("GOLD").price)}</b></div>
          <div class="apy"><span>Silver</span><b class="soon">Coming soon</b></div>
          <div class="apy"><span>Reward rate</span><b>Set per market</b></div>
          <button class="full" type="button" data-act="soon" style="margin-top:16px">Follow Tribute</button>
        </div>
      </div>
    </section>`;
}

function portfolioHtml() {
  const w = state.wallet;
  if (!w) {
    return `<section class="page"><span class="kicker">Portfolio</span><h2>Your empire,<br><em>once you enter.</em></h2><p class="lede">Connect a demo wallet to see balances and positions. Nothing here talks to a real chain.</p><div class="hero-actions"><button class="btn-trade" data-act="wallet"><span class="ico">${chev()}</span><span class="lbl">Connect wallet</span></button></div></section>`;
  }
  const pnl = state.positions.reduce((sum, p) => {
    const px = market(p.symbol).price;
    return sum + (px - p.entry) / p.entry * p.size * (p.side === "short" ? -1 : 1);
  }, 0);
  return `
    <section class="page">
      <div class="page-head">
        <div><span class="kicker">Portfolio</span><h2>${shortAddr(w.address)}</h2></div>
        <button class="mini-btn" data-act="disconnect">Disconnect</button>
      </div>
      <div class="port-grid">
        <div class="balances">
          <div class="card bal-card"><span class="note">USDG</span><b>${money(w.usdg)}</b></div>
          <div class="card bal-card"><span class="note">USDC · trading</span><b>${money(w.usdc)}</b></div>
          <div class="card bal-card"><span class="note">Open PnL</span><b class="${pnl >= 0 ? "chg up" : "chg down"}">${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}</b></div>
          <div class="card bal-card"><span class="note">Positions</span><b>${state.positions.length}</b></div>
        </div>
        <div class="card">
          <h3>Positions</h3>
          ${state.positions.length ? state.positions.map((p) => `<div class="apy"><span>${p.side} ${p.symbol}<small class="note"> ${p.lev}×</small></span><span>${money(p.size)} USD</span></div>`).join("") : `<p class="empty">No positions yet. The world is waiting.</p><a class="linkish" href="#/trade">Start trading →</a>`}
          <button class="full" type="button" data-act="deposit" style="margin-top:16px">Deposit demo funds</button>
        </div>
      </div>
    </section>`;
}

function filteredMarkets() {
  const q = state.query.trim().toLowerCase();
  return MARKETS.filter((m) => {
    const kindOk = state.filter === "all" || m.kind === state.filter;
    const text = `${m.symbol} ${m.name}`.toLowerCase();
    return kindOk && (!q || text.includes(q));
  });
}

function marketsHtml() {
  const c = counts();
  const tabs = [["all", "All", c.all], ["crypto", "Crypto", c.crypto], ["equity", "Equities", c.equity], ["metal", "Metals", c.metal]];
  return `
    <section class="page">
      <div class="page-head">
        <div><span class="kicker">Markets without borders</span><h2>All markets.</h2></div>
      </div>
      <div class="search-row">
        <input id="q" type="text" placeholder="Search assets" value="${state.query.replace(/"/g, "&quot;")}" />
        <div class="tabs" role="tablist">
          ${tabs.map(([id, name, n]) => `<button data-act="filter" data-filter="${id}" aria-selected="${state.filter === id}">${name} <em>${n}</em></button>`).join("")}
        </div>
      </div>
      <div class="list-head"><span></span><span>Asset</span><span>Snapshot price / USD</span><span>24h snapshot</span><span></span></div>
      <div id="market-body">${filteredMarkets().map(row).join("") || `<p class="empty">No markets match that search.</p>`}</div>
    </section>`;
}

function viewHtml() {
  if (state.page === "trade") return tradeHtml();
  if (state.page === "borrow") return borrowHtml();
  if (state.page === "tribute") return tributePage();
  if (state.page === "portfolio") return portfolioHtml();
  if (state.page === "markets") return marketsHtml();
  return overviewHtml();
}

function footHtml() {
  return `
    <div class="site-foot">
      <span class="foot-brand">${mark()} EMPIREX</span>
      <span class="foot-credits"><span>Execution by Hyperliquid</span><i>·</i><span>Assets on Robinhood Chain</span><i>·</i><span>Demo interface. Balances never leave this browser.</span></span>
      <nav aria-label="Contact and social links">
        <a href="mailto:support@empirex.io">support@empirex.io</a>
        &nbsp;·&nbsp;
        <a href="https://x.com/HyperEmpireX" target="_blank" rel="noreferrer">@HyperEmpireX</a>
        &nbsp;·&nbsp;
        <span>© ${new Date().getFullYear()}</span>
      </nav>
    </div>`;
}

function modalHtml() {
  if (state.modal === "wallet") {
    return `<div class="backdrop"><div class="sheet" data-stop><div class="sheet-inner">
      <div class="sheet-top"><div><span class="kicker">Wallet</span><h2>Enter the empire.</h2></div><button class="x" data-act="close" aria-label="Close">×</button></div>
      <p>This preview creates a demo address in your browser. It does not connect to Robinhood, Hyperliquid, or ask for a seed phrase.</p>
      ${state.wallet ? `<p class="note">Connected as ${shortAddr(state.wallet.address)}</p><button class="full" data-act="disconnect">Disconnect</button>` : `<button class="full" data-act="connect">Continue with demo wallet</button>`}
    </div></div></div>`;
  }
  if (state.modal === "deposit") {
    return `<div class="backdrop"><div class="sheet" data-stop><div class="sheet-inner">
      <div class="sheet-top"><div><span class="kicker">Deposit funds</span><h2>Fund your next trade.</h2></div><button class="x" data-act="close" aria-label="Close">×</button></div>
      <p>Add demo USDG or USDC. The bridge story on the homepage is visual only.</p>
      <label class="field">Asset<select id="asset"><option value="usdc">USDC · trading</option><option value="usdg">USDG</option></select></label>
      <label class="field">Amount<input id="amt" type="number" min="1" step="1" value="10000"></label>
      <button class="full" style="margin-top:16px" data-act="confirm-deposit">${state.wallet ? "Add demo funds" : "Connect wallet first"}</button>
    </div></div></div>`;
  }
  return "";
}

function toast(message) {
  const el = $("toast");
  el.hidden = false;
  el.textContent = message;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

function render() {
  const route = parseRoute();
  state.page = route.page;
  state.symbol = route.symbol;
  document.title = `${TITLES[state.page]} | EmpireX`;
  document.body.dataset.page = state.page;
  $("nav-root").innerHTML = navHtml();
  $("view").innerHTML = viewHtml();
  $("foot").innerHTML = footHtml();
  $("modal-root").innerHTML = modalHtml();
  const canvas = $("chart");
  if (canvas) requestAnimationFrame(() => drawChart(canvas, market(state.symbol)));
  updateTicketMath();
}

function updateTicketMath() {
  const sizeEl = $("size");
  const levEl = $("lev");
  const margin = $("margin");
  const liq = $("liq");
  if (!sizeEl || !levEl || !margin || !liq) return;
  const size = Number(sizeEl.value) || 0;
  const lev = Number(levEl.value) || 1;
  const px = market(state.symbol).price;
  const dir = state.side === "short" ? 1 : -1;
  margin.textContent = `${money(size / lev)} USDC`;
  liq.textContent = fmt(px * (1 + dir * 0.9 / lev));
  const out = $("lev-out");
  if (out) out.textContent = `${lev}×`;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawChart(canvas, m) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const rand = mulberry32(m.symbol.split("").reduce((s, ch) => s + ch.charCodeAt(0), 40));
  const candles = [];
  let price = 100;
  for (let i = 0; i < 48; i++) {
    const open = price;
    const close = Math.max(70, open * (1 + (rand() - 0.48) * 0.03));
    const high = Math.max(open, close) * (1 + rand() * 0.012);
    const low = Math.min(open, close) * (1 - rand() * 0.012);
    candles.push({ open, close, high, low });
    price = close;
  }
  const scale = m.price / candles[candles.length - 1].close;
  candles.forEach((c) => {
    c.open *= scale;
    c.close *= scale;
    c.high *= scale;
    c.low *= scale;
  });
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const span = max - min || 1;
  const pad = 16;
  const cw = (w - pad * 2) / candles.length;
  ctx.strokeStyle = "rgba(148,176,206,0.15)";
  ctx.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const y = pad + ((h - pad * 2) * g) / 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  candles.forEach((c, i) => {
    const x = pad + i * cw + cw / 2;
    const y = (v) => pad + (max - v) / span * (h - pad * 2);
    const up = c.close >= c.open;
    ctx.strokeStyle = up ? "#7deccf" : "#ff6b7d";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y(c.high));
    ctx.lineTo(x, y(c.low));
    ctx.stroke();
    const top = y(Math.max(c.open, c.close));
    const bot = y(Math.min(c.open, c.close));
    ctx.fillRect(x - Math.max(2, cw * 0.28), top, Math.max(4, cw * 0.56), Math.max(1, bot - top));
  });
}

function placeOrder() {
  if (!state.wallet) {
    state.modal = "wallet";
    render();
    return;
  }
  const size = Number($("size").value);
  const lev = Number($("lev").value);
  if (!size || size <= 0) return toast("Enter a position size.");
  const margin = size / lev;
  if (state.wallet.usdc + 1e-9 < margin) return toast("Not enough demo USDC. Deposit funds first.");
  const m = market(state.symbol);
  state.wallet.usdc -= margin;
  const dir = state.side === "short" ? 1 : -1;
  state.positions.push({
    id: Date.now(),
    symbol: m.symbol,
    side: state.side,
    size,
    lev,
    entry: m.price,
    margin,
    liq: m.price * (1 + dir * 0.9 / lev)
  });
  persist();
  toast(`${state.side === "long" ? "Long" : "Short"} ${m.symbol} opened in the demo wallet.`);
  render();
}

function closePos(id) {
  const index = state.positions.findIndex((p) => String(p.id) === String(id));
  if (index < 0 || !state.wallet) return;
  const p = state.positions[index];
  const px = market(p.symbol).price;
  const pnl = (px - p.entry) / p.entry * p.size * (p.side === "short" ? -1 : 1);
  state.wallet.usdc = Math.max(0, state.wallet.usdc + p.margin + pnl);
  state.positions.splice(index, 1);
  persist();
  toast(`Closed ${p.symbol}. PnL ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDC.`);
  render();
}

function confirmDeposit() {
  if (!state.wallet) {
    state.modal = "wallet";
    render();
    return;
  }
  const amt = Number($("amt").value);
  const asset = $("asset").value;
  if (!amt || amt <= 0) return toast("Enter an amount.");
  state.wallet[asset] += amt;
  persist();
  state.modal = null;
  toast(`Added ${money(amt)} ${asset.toUpperCase()} to the demo wallet.`);
  render();
}

function connect() {
  if (!state.wallet) {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    const address = `0x${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    state.wallet = { address, usdg: 0, usdc: 0 };
    persist();
  }
  state.modal = null;
  toast("Demo wallet is ready in this browser.");
  render();
}

function disconnect() {
  state.wallet = null;
  state.positions = [];
  state.modal = null;
  persist();
  toast("Demo wallet removed from this browser.");
  render();
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("backdrop")) {
    state.modal = null;
    render();
    return;
  }
  const trigger = event.target.closest("[data-act]");
  if (!trigger) {
    if (state.navOpen && !event.target.closest(".island")) {
      state.navOpen = false;
      $("nav-root").innerHTML = navHtml();
    }
    return;
  }
  const act = trigger.dataset.act;
  if (act === "toggle-nav") {
    state.navOpen = !state.navOpen;
    $("nav-root").innerHTML = navHtml();
    return;
  }
  if (act === "deposit") { state.modal = "deposit"; state.navOpen = false; render(); return; }
  if (act === "wallet") { state.modal = "wallet"; state.navOpen = false; render(); return; }
  if (act === "close") { state.modal = null; render(); return; }
  if (act === "connect") return connect();
  if (act === "disconnect") return disconnect();
  if (act === "confirm-deposit") return confirmDeposit();
  if (act === "filter") {
    state.filter = trigger.dataset.filter;
    if (state.page === "markets") {
      $("view").innerHTML = marketsHtml();
      $("nav-root").innerHTML = navHtml();
    } else render();
    return;
  }
  if (act === "side") {
    state.side = trigger.dataset.side;
    render();
    return;
  }
  if (act === "close-pos") return closePos(trigger.dataset.id);
  if (act === "soon") return toast("Tribute is preview-only in this demo.");
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "ticket") {
    event.preventDefault();
    placeOrder();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "q") {
    state.query = event.target.value;
    const body = $("market-body");
    if (body) body.innerHTML = filteredMarkets().map(row).join("") || `<p class="empty">No markets match that search.</p>`;
  }
  if (event.target.id === "lev" || event.target.id === "size") updateTicketMath();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "pair") location.hash = `#/trade/${event.target.value}`;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.modal || state.navOpen)) {
    state.modal = null;
    state.navOpen = false;
    render();
  }
});

window.addEventListener("hashchange", () => {
  state.navOpen = false;
  state.modal = null;
  render();
});

window.addEventListener("resize", () => {
  const canvas = $("chart");
  if (canvas) drawChart(canvas, market(state.symbol));
});

setInterval(() => {
  MARKETS.forEach((m) => {
    m.price = Math.max(0.0001, m.price * (1 + (Math.random() - 0.5) * 0.0016));
    m.change = Math.max(-15, Math.min(15, m.change + (Math.random() - 0.5) * 0.04));
  });
  document.querySelectorAll("[data-px]").forEach((el) => {
    el.textContent = fmt(market(el.dataset.px).price);
  });
  document.querySelectorAll("[data-chg]").forEach((el) => {
    const m = market(el.dataset.chg);
    const up = m.change >= 0;
    el.classList.toggle("up", up);
    el.classList.toggle("down", !up);
    el.textContent = `${up ? "▲" : "▼"} ${Math.abs(m.change).toFixed(2)}%`;
  });
  const canvas = $("chart");
  if (canvas && document.body.dataset.page === "trade") drawChart(canvas, market(state.symbol));
}, 1800);

render();

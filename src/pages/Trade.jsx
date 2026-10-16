import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TokenIcon from "../components/TokenIcon.jsx";
import TradingChart from "../components/TradingChart.jsx";
import { AccentChevron, HyperliquidMark } from "../components/Icons.jsx";
import { findMarket, formatCompact, formatPrice, markets } from "../data.js";

const SLIPPAGES = ["0.10%", "0.25%", "0.50%", "1.00%"];

function makeBook(price) {
  const asks = [];
  const bids = [];
  let askTotal = 0;
  let bidTotal = 0;
  for (let i = 12; i >= 1; i -= 1) {
    const size = Number((0.2 + ((i * 17) % 9) * 0.35).toFixed(3));
    askTotal += size;
    asks.push({ price: price + i, size, total: askTotal });
  }
  asks.reverse();
  for (let i = 1; i <= 12; i += 1) {
    const size = Number((0.15 + ((i * 11) % 8) * 0.42).toFixed(3));
    bidTotal += size;
    bids.push({ price: price - i, size, total: bidTotal });
  }
  const max = Math.max(...asks.map((row) => row.total), ...bids.map((row) => row.total));
  return { asks, bids, max };
}

function leverageStops(max) {
  const stops = [1, Math.round(max / 4), Math.round(max / 2), max].filter((value, index, list) => value > 0 && list.indexOf(value) === index);
  return stops;
}

export default function Trade({ account, onFund }) {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [bookTab, setBookTab] = useState("book");
  const [activity, setActivity] = useState("Positions");
  const [side, setSide] = useState("long");
  const [orderType, setOrderType] = useState("market");
  const [unit, setUnit] = useState("USD");
  const [size, setSize] = useState("");
  const [marginMode, setMarginMode] = useState("Cross");
  const [slippage, setSlippage] = useState("0.50%");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const requested = findMarket((symbol || "BTC").toUpperCase());
  const venue = requested.category === "crypto" ? "crypto" : "xyz";
  const universe = markets.filter((item) => (venue === "crypto" ? item.category === "crypto" : item.category !== "crypto"));
  const market = requested;
  const [leverage, setLeverage] = useState(Math.min(5, market.leverage));
  const book = useMemo(() => makeBook(market.price), [market.price]);
  const stops = leverageStops(market.leverage);
  const coinSize = unit === "USD" ? (Number(size) || 0) / market.price : Number(size) || 0;
  const notional = coinSize * market.price;
  const initialMargin = leverage ? notional / leverage : 0;
  const available = account.wallet && account.balances.usdc != null ? account.balances.usdc : null;
  const filtered = universe.filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase()));

  function applyPercent(percent) {
    if (!available) return;
    const budget = available * percent;
    setUnit("USD");
    setSize(budget.toFixed(2));
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!account.wallet) {
      account.openConnect();
      return;
    }
    if (!coinSize) {
      setMessage("Enter an order size.");
      return;
    }
    setMessage(`${side === "long" ? "Long" : "Short"} ${coinSize.toFixed(4)} ${market.symbol} recorded locally. Nothing was sent to Hyperliquid.`);
  }

  return (
    <main className="trade-desk">
      <h1 className="td-sr">Trade {market.name} perpetuals</h1>
      <header className="td-header">
        <div className="td-identity">
          <div className="market-picker">
            <button className="market-picker-trigger" onClick={() => setPicker((open) => !open)}>
              <TokenIcon symbol={market.symbol} size={34} />
              <span>
                <strong>{market.symbol}-USD</strong>
                <small>{market.name} PERP</small>
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
            {picker && (
              <div className="picker-pop">
                <input autoFocus placeholder="Search markets" value={query} onChange={(event) => setQuery(event.target.value)} />
                <div className="picker-list">
                  {filtered.map((item) => (
                    <button key={item.symbol} onClick={() => { navigate(`/trade/${item.symbol}`); setPicker(false); setQuery(""); }}>
                      <TokenIcon symbol={item.symbol} size={24} />
                      <span><strong>{item.symbol}</strong><small>{item.name}</small></span>
                      <em className={item.change < 0 ? "down" : "up"}>{item.change.toFixed(2)}%</em>
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="muted">No markets found.</p>}
                </div>
              </div>
            )}
          </div>
          <div className="td-quote">
            <strong className="td-price">{formatPrice(market.price)}</strong>
            <span className={market.change < 0 ? "down" : "up"}>{market.change.toFixed(2)}%</span>
          </div>
        </div>
        <dl className="td-stats">
          <div><dt>Mark</dt><dd>{formatPrice(market.price)}</dd></div>
          <div><dt>Oracle</dt><dd>{formatPrice(market.price * 1.0004)}</dd></div>
          <div><dt>24h volume</dt><dd>{formatCompact(market.volume)}</dd></div>
          <div><dt>Open interest</dt><dd>{formatCompact(market.volume * 1.16)}</dd></div>
          <div><dt>Funding · 1h</dt><dd>0.0013% <small>10.95% APR</small></dd></div>
          <div><dt>Next funding</dt><dd>36:13</dd></div>
        </dl>
      </header>

      <div className="td-subbar">
        <div className="market-tabs td-venues" role="tablist">
          <button className={venue === "crypto" ? "is-active" : ""} onClick={() => navigate("/trade/BTC")}>Crypto <span>{markets.filter((item) => item.category === "crypto").length}</span></button>
          <button className={venue === "xyz" ? "is-active" : ""} onClick={() => navigate("/trade/NVDA")}>trade.xyz <span>{markets.filter((item) => item.category !== "crypto").length}</span></button>
        </div>
        <span className="td-venue-note">
          {venue === "crypto" ? <>Crypto perpetuals powered by <HyperliquidMark /> Hyperliquid</> : "Stocks, indices & commodities · separate USDC collateral"}
        </span>
        <span className="td-live">Live on Hyperliquid</span>
      </div>

      <div className="td-grid">
        <TradingChart symbol={market.symbol} category={market.category} price={market.price} />

        <section className="td-card td-book">
          <div className="book-tabs">
            <button className={bookTab === "book" ? "is-active" : ""} onClick={() => setBookTab("book")}>Order book</button>
            <button className={bookTab === "trades" ? "is-active" : ""} onClick={() => setBookTab("trades")}>Trades</button>
          </div>
          {bookTab === "book" ? (
            <div className="order-book">
              <div className="book-columns"><span>Price (USD)</span><span>Size ({market.symbol})</span><span>Total</span></div>
              <div className="book-asks">
                {book.asks.map((row) => (
                  <div key={row.price} className="book-line ask" style={{ "--depth": `${(row.total / book.max) * 100}%` }}>
                    <span>{formatPrice(row.price)}</span><span>{row.size.toFixed(3)}</span><span>{row.total.toFixed(3)}</span>
                  </div>
                ))}
              </div>
              <div className="book-spread"><span>Spread</span><strong>1.0</strong><span>0.001%</span></div>
              <div className="book-bids">
                {book.bids.map((row) => (
                  <div key={row.price} className="book-line bid" style={{ "--depth": `${(row.total / book.max) * 100}%` }}>
                    <span>{formatPrice(row.price)}</span><span>{row.size.toFixed(3)}</span><span>{row.total.toFixed(3)}</span>
                  </div>
                ))}
              </div>
              <p className="book-foot">Hyperliquid · top price levels</p>
            </div>
          ) : (
            <div className="order-book">
              <div className="book-columns"><span>Price</span><span>Size</span><span>Time</span></div>
              {book.bids.slice(0, 10).map((row, index) => (
                <div key={row.price} className={`book-line ${index % 2 ? "ask" : "bid"}`}>
                  <span>{formatPrice(row.price)}</span><span>{row.size.toFixed(3)}</span><span>21:{String(10 + index).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <form className="td-card td-ticket" onSubmit={placeOrder}>
          <div className="ticket-kicker"><span>HYPERLIQUID</span><span>CRYPTO PERPS</span></div>
          <h2>Place an order</h2>
          <div className="side-toggle">
            <button type="button" className={side === "long" ? "is-long" : ""} onClick={() => setSide("long")}>Long / Buy</button>
            <button type="button" className={side === "short" ? "is-short" : ""} onClick={() => setSide("short")}>Short / Sell</button>
          </div>
          <div className="type-toggle">
            <button type="button" className={orderType === "market" ? "is-active" : ""} onClick={() => setOrderType("market")}>Market</button>
            <button type="button" className={orderType === "limit" ? "is-active" : ""} onClick={() => setOrderType("limit")}>Limit</button>
          </div>
          <label className="size-box">
            Order size
            <span className="unit-toggle">
              <button type="button" className={unit === "USD" ? "is-active" : ""} onClick={() => setUnit("USD")}>USD</button>
              <button type="button" className={unit === "BTC" ? "is-active" : ""} onClick={() => setUnit("BTC")}>{market.symbol}</button>
            </span>
            <input value={size} placeholder="0.00" onChange={(event) => setSize(event.target.value)} />
            <small>{coinSize.toFixed(4)} {market.symbol}</small>
          </label>
          {orderType === "limit" && (
            <label className="size-box">Limit price · USD<input defaultValue={formatPrice(market.price)} /></label>
          )}
          <div className="quick-sizes">
            {[0.25, 0.5, 0.75, 1].map((percent) => (
              <button key={percent} type="button" onClick={() => applyPercent(percent)}>{percent === 1 ? "Max" : `${percent * 100}%`}</button>
            ))}
          </div>
          <div className="margin-row">
            <label>Margin
              <select value={marginMode} onChange={(event) => setMarginMode(event.target.value)}>
                <option>Cross</option>
                <option>Isolated</option>
              </select>
            </label>
            <label>Leverage
              <input value={`${leverage}x`} onChange={(event) => setLeverage(Math.max(1, Math.min(market.leverage, Number(event.target.value) || 1)))} />
            </label>
          </div>
          <div className="lev-stops">
            {stops.map((stop) => (
              <button key={stop} type="button" className={leverage === stop ? "is-active" : ""} onClick={() => setLeverage(stop)}>{stop}x</button>
            ))}
          </div>
          <dl className="ticket-stats">
            <div><dt>Position value</dt><dd>${notional.toLocaleString("en-US", { maximumFractionDigits: 2 })}</dd></div>
            <div><dt>Est. initial margin</dt><dd>${initialMargin.toLocaleString("en-US", { maximumFractionDigits: 2 })}</dd></div>
            <div><dt>Available to trade</dt><dd>{available == null ? "--" : `$${available.toLocaleString("en-US")}`}</dd></div>
          </dl>
          <label className="check"><input type="checkbox" checked={reduceOnly} onChange={(event) => setReduceOnly(event.target.checked)} /> Reduce only</label>
          <label className="slip-row">Slippage limit
            <select value={slippage} onChange={(event) => setSlippage(event.target.value)}>
              {SLIPPAGES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {account.wallet ? (
            <button className="mint-btn wide" type="submit"><span className="am-accent" aria-hidden="true"><AccentChevron /></span><span className="am-label">Submit order</span></button>
          ) : (
            <button className="mint-btn wide" type="button" onClick={account.openConnect}><span className="am-accent" aria-hidden="true"><AccentChevron /></span><span className="am-label">Connect wallet</span></button>
          )}
          <button className="text-btn" type="button" onClick={onFund}>Deposit funds</button>
          <p className="ticket-note">Hyperliquid perps / USDC collateral</p>
          {message && <p className="form-note">{message}</p>}
        </form>

        <section className="td-card td-activity">
          <div className="activity-tabs">
            {["Positions", "Open orders", "Trade history", "Funding"].map((tab) => (
              <button key={tab} className={activity === tab ? "is-active" : ""} onClick={() => setActivity(tab)}>{tab}</button>
            ))}
          </div>
          <div className="activity-empty">
            <strong>{activity === "Positions" ? "Your positions live here." : `No ${activity.toLowerCase()}.`}</strong>
            <p>{account.wallet ? "No open positions on the supported Hyperliquid markets." : "Connect your wallet to view your Hyperliquid account."}</p>
          </div>
        </section>
      </div>
    </main>
  );
}

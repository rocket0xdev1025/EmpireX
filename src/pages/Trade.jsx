import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TokenIcon from "../components/TokenIcon.jsx";
import { findMarket, formatCompact, formatPrice, markets } from "../data.js";

function candles(seed) {
  const bars = [];
  let price = 100;
  for (let i = 0; i < 48; i += 1) {
    const drift = Math.sin(i / 4 + seed) * 2.2 + ((i * 17 + seed) % 7) - 3;
    const open = price;
    const close = Math.max(20, price + drift);
    const high = Math.max(open, close) + 1.4;
    const low = Math.min(open, close) - 1.2;
    bars.push({ open, close, high, low });
    price = close;
  }
  return bars;
}

function book(price) {
  const asks = [];
  const bids = [];
  for (let i = 1; i <= 8; i += 1) {
    asks.push({ price: price * (1 + i * 0.0004), size: (0.4 + i * 0.17).toFixed(3) });
    bids.push({ price: price * (1 - i * 0.0004), size: (0.55 + i * 0.13).toFixed(3) });
  }
  return { asks: asks.reverse(), bids };
}

export default function Trade({ account, onFund }) {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const market = findMarket((symbol || "BTC").toUpperCase());
  const [side, setSide] = useState("long");
  const [orderType, setOrderType] = useState("market");
  const [size, setSize] = useState("0.10");
  const [leverage, setLeverage] = useState(5);
  const [query, setQuery] = useState("");
  const [picker, setPicker] = useState(false);
  const [message, setMessage] = useState("");

  const bars = useMemo(() => candles(market.symbol.length * 3), [market.symbol]);
  const levels = useMemo(() => book(market.price), [market.price]);
  const max = Math.max(...bars.map((bar) => bar.high));
  const min = Math.min(...bars.map((bar) => bar.low));
  const notional = Number(size || 0) * market.price;
  const margin = leverage ? notional / leverage : 0;
  const filtered = markets.filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase()));

  function placeOrder(event) {
    event.preventDefault();
    if (!account.wallet) {
      setMessage("Connect a wallet before placing an order.");
      return;
    }
    if (!Number(size) || Number(size) <= 0) {
      setMessage("Enter an order size.");
      return;
    }
    setMessage(`${side === "long" ? "Long" : "Short"} ${size} ${market.symbol} recorded locally. Nothing was sent to Hyperliquid.`);
  }

  return (
    <div className="trade-page">
      <div className="trade-top">
        <button className="market-select" onClick={() => setPicker((open) => !open)}>
          <TokenIcon symbol={market.symbol} size={32} />
          <span>
            <strong>{market.symbol}-USD</strong>
            <small>{market.category === "crypto" ? "Crypto perpetuals" : "Stocks, indices & commodities"}</small>
          </span>
        </button>
        <div className="stat">
          <small>Mark</small>
          <strong>{formatPrice(market.price)}</strong>
        </div>
        <div className={`stat ${market.change < 0 ? "down" : "up"}`}>
          <small>24h</small>
          <strong>{market.change.toFixed(2)}%</strong>
        </div>
        <div className="stat">
          <small>Open interest</small>
          <strong>{formatCompact(market.volume * 0.42)}</strong>
        </div>
        <div className="stat">
          <small>Funding · 1h</small>
          <strong>0.0012%</strong>
        </div>
        <div className="stat">
          <small>Volume</small>
          <strong>{formatCompact(market.volume)}</strong>
        </div>
        <span className="live-pill">Live preview</span>
      </div>

      {picker && (
        <div className="picker">
          <input autoFocus placeholder="Search markets" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="picker-list">
            {filtered.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  navigate(`/trade/${item.symbol}`);
                  setPicker(false);
                  setQuery("");
                }}
              >
                <TokenIcon symbol={item.symbol} size={28} />
                <span>
                  <strong>{item.symbol}</strong>
                  <small>{item.name}</small>
                </span>
                <em className={item.change < 0 ? "down" : "up"}>{item.change.toFixed(2)}%</em>
              </button>
            ))}
            {filtered.length === 0 && <p className="muted">No markets found.</p>}
          </div>
        </div>
      )}

      <div className="trade-grid">
        <section className="chart-card">
          <div className="chart">
            {bars.map((bar, index) => {
              const top = ((max - Math.max(bar.open, bar.close)) / (max - min)) * 100;
              const height = (Math.abs(bar.close - bar.open) / (max - min)) * 100;
              const up = bar.close >= bar.open;
              return (
                <span key={index} className={up ? "candle up" : "candle down"} style={{ left: `${(index / bars.length) * 100}%`, top: `${top}%`, height: `${Math.max(height, 1.5)}%` }} />
              );
            })}
          </div>
          <div className="book">
            <header>
              <span>Live order book</span>
              <span>Size</span>
            </header>
            {levels.asks.map((level) => (
              <div key={`a-${level.price}`} className="book-row ask">
                <span>{formatPrice(level.price)}</span>
                <span>{level.size}</span>
              </div>
            ))}
            <div className="book-mid">{formatPrice(market.price)}</div>
            {levels.bids.map((level) => (
              <div key={`b-${level.price}`} className="book-row bid">
                <span>{formatPrice(level.price)}</span>
                <span>{level.size}</span>
              </div>
            ))}
          </div>
        </section>

        <form className="ticket" onSubmit={placeOrder}>
          <p className="eyebrow">Place an order</p>
          <h1>{market.name}</h1>
          <div className="side-toggle">
            <button type="button" className={side === "long" ? "is-long" : ""} onClick={() => setSide("long")}>Long / Buy</button>
            <button type="button" className={side === "short" ? "is-short" : ""} onClick={() => setSide("short")}>Short / Sell</button>
          </div>
          <div className="type-toggle">
            <button type="button" className={orderType === "market" ? "is-active" : ""} onClick={() => setOrderType("market")}>Market</button>
            <button type="button" className={orderType === "limit" ? "is-active" : ""} onClick={() => setOrderType("limit")}>Limit</button>
          </div>
          <label>
            Size · {market.symbol}
            <input value={size} onChange={(event) => setSize(event.target.value)} />
          </label>
          {orderType === "limit" && (
            <label>
              Limit price · USD
              <input defaultValue={formatPrice(market.price)} />
            </label>
          )}
          <div className="lev-row">
            <span>Leverage {leverage}x</span>
            <input type="range" min="1" max={market.leverage} value={leverage} onChange={(event) => setLeverage(Number(event.target.value))} />
          </div>
          <dl className="ticket-stats">
            <div><dt>Position value</dt><dd>${notional.toLocaleString("en-US", { maximumFractionDigits: 2 })}</dd></div>
            <div><dt>Est. initial margin</dt><dd>${margin.toLocaleString("en-US", { maximumFractionDigits: 2 })}</dd></div>
            <div><dt>Available to trade</dt><dd>{account.wallet ? `$${account.balances.usdc.toLocaleString("en-US")}` : "Connect wallet"}</dd></div>
          </dl>
          {account.wallet ? (
            <button className={`mint-btn wide ${side}`} type="submit">Submit order</button>
          ) : (
            <button className="mint-btn wide" type="button" onClick={account.openConnect}>Connect wallet</button>
          )}
          <button className="text-btn" type="button" onClick={onFund}>Deposit USDC to trade</button>
          {message && <p className="form-note">{message}</p>}
        </form>
      </div>

      <section className="positions">
        <h2>Your positions</h2>
        <p>No open positions on the supported Hyperliquid markets.</p>
        <p className="muted">No open orders.</p>
      </section>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { AreaSeries, CandlestickSeries, ColorType, LineSeries, createChart } from "lightweight-charts";
import { formatPrice } from "../data.js";

const FRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];
const STEP = { "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400 };
const ALIAS = { XAU: "xyz:GOLD", XAG: "xyz:SILVER", WTI: "xyz:CL", SPY: "xyz:SP500" };
const COLORS = ["#87d6c5", "#7dffa8", "#ff6b7a", "#f5d76e", "#8eb7ff"];

function coinCandidates(symbol, category) {
  if (category === "crypto") return [symbol];
  return [ALIAS[symbol] || `xyz:${symbol}`];
}

function priceFormat(price) {
  const abs = Math.abs(price || 1);
  const precision = abs >= 1000 ? 1 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return { type: "price", precision, minMove: Number((10 ** -precision).toFixed(precision)) };
}

function movingAverage(bars, period = 20) {
  const points = [];
  let sum = 0;
  bars.forEach((bar, index) => {
    sum += bar.close;
    if (index >= period) sum -= bars[index - period].close;
    if (index >= period - 1) points.push({ time: bar.time, value: sum / period });
  });
  return points;
}

function fallbackBars(symbol, frame, price) {
  const count = frame === "1d" ? 90 : 160;
  const step = STEP[frame];
  let cursor = price * 0.985;
  let seed = 0;
  for (let i = 0; i < symbol.length; i += 1) seed = (seed * 33 + symbol.charCodeAt(i)) >>> 0;
  const bars = [];
  const end = Math.floor(Date.now() / 1000);
  for (let i = 0; i < count; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = (seed / 4294967296 - 0.5) * price * 0.004;
    const open = cursor;
    const close = Math.max(price * 0.2, open + noise);
    bars.push({
      time: end - (count - i) * step,
      open,
      close,
      high: Math.max(open, close) * 1.001,
      low: Math.min(open, close) * 0.999,
      volume: 1,
    });
    cursor = close;
  }
  bars[bars.length - 1].close = price;
  return bars;
}

async function fetchCandles(symbol, category, frame) {
  const end = Date.now();
  for (const coin of coinCandidates(symbol, category)) {
    const response = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "candleSnapshot",
        req: { coin, interval: frame, startTime: end - STEP[frame] * 1000 * 450, endTime: end },
      }),
    });
    if (!response.ok) continue;
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const bars = [];
    rows.forEach((row) => {
      const bar = {
        time: Math.floor(Number(row.t) / 1000),
        open: Number(row.o),
        high: Number(row.h),
        low: Number(row.l),
        close: Number(row.c),
        volume: Number(row.v),
      };
      if (!Number.isFinite(bar.open) || !bar.time) return;
      if (bars.length && bars[bars.length - 1].time === bar.time) bars[bars.length - 1] = bar;
      else bars.push(bar);
    });
    bars.sort((a, b) => a.time - b.time);
    if (bars.length) return bars;
  }
  return null;
}

function formatBarTime(time) {
  return new Date(time * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TradingChart({ symbol, category, price }) {
  const screenRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const priceSeriesRef = useRef(null);
  const maSeriesRef = useRef(null);
  const drawingsRef = useRef([]);
  const toolRef = useRef("cross");
  const pendingRef = useRef(null);
  const colorRef = useRef(COLORS[0]);
  const [frame, setFrame] = useState("5m");
  const [style, setStyle] = useState("candle");
  const [showMa, setShowMa] = useState(false);
  const [tool, setTool] = useState("cross");
  const [color, setColor] = useState(COLORS[0]);
  const [bars, setBars] = useState([]);
  const [live, setLive] = useState(false);
  const [hover, setHover] = useState(null);
  const [drawingCount, setDrawingCount] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return undefined;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8ea6c0",
        fontFamily: "DM Sans, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(171, 199, 229, 0.06)" },
        horzLines: { color: "rgba(171, 199, 229, 0.06)" },
      },
      rightPriceScale: { borderColor: "rgba(171, 199, 229, 0.14)" },
      timeScale: { borderColor: "rgba(171, 199, 229, 0.14)", timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "rgba(151, 252, 228, 0.35)" }, horzLine: { color: "rgba(151, 252, 228, 0.35)" } },
      handleScroll: true,
      handleScale: true,
    });
    chartRef.current = chart;
    const resize = () => {
      const box = container.getBoundingClientRect();
      chart.resize(Math.max(box.width, 10), Math.max(box.height, 10));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    chart.subscribeCrosshairMove((param) => {
      const series = priceSeriesRef.current;
      if (!series || !param.point) {
        setHover(null);
        return;
      }
      const bar = param.seriesData.get(series);
      if (!bar) {
        setHover(null);
        return;
      }
      setHover({
        time: param.time,
        open: bar.open ?? bar.value,
        high: bar.high ?? bar.value,
        low: bar.low ?? bar.value,
        close: bar.close ?? bar.value,
        volume: bar.volume,
      });
    });
    chart.subscribeClick((param) => {
      const series = priceSeriesRef.current;
      if (!series || !param.point || toolRef.current === "cross") return;
      const value = series.coordinateToPrice(param.point.y);
      if (value == null || param.time == null) return;
      const active = toolRef.current;
      if (active === "hline") {
        const line = series.createPriceLine({
          price: value,
          color: colorRef.current,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
        });
        drawingsRef.current.push({ kind: "line", line });
        setDrawingCount(drawingsRef.current.length);
        return;
      }
      if (active === "trend" || active === "fib") {
        if (!pendingRef.current) {
          pendingRef.current = { time: param.time, value };
          return;
        }
        const start = pendingRef.current;
        pendingRef.current = null;
        const ordered = start.time <= param.time ? [start, { time: param.time, value }] : [{ time: param.time, value }, start];
        if (ordered[0].time === ordered[1].time) return;
        if (active === "trend") {
          const drawn = chart.addSeries(LineSeries, {
            color: colorRef.current,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          drawn.setData(ordered);
          drawingsRef.current.push({ kind: "series", series: drawn });
        } else {
          const high = Math.max(start.value, value);
          const low = Math.min(start.value, value);
          [0, 0.382, 0.5, 0.618, 1].forEach((level) => {
            const line = series.createPriceLine({
              price: high - (high - low) * level,
              color: colorRef.current,
              lineWidth: 1,
              lineStyle: 2,
              title: `${Math.round(level * 100)}%`,
              axisLabelVisible: true,
            });
            drawingsRef.current.push({ kind: "line", line });
          });
        }
        setDrawingCount(drawingsRef.current.length);
      }
    });
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      maSeriesRef.current = null;
      drawingsRef.current = [];
    };
  }, []);

  useEffect(() => {
    chartRef.current?.applyOptions({ timeScale: { timeVisible: frame !== "1d", secondsVisible: false } });
  }, [frame]);

  useEffect(() => {
    let cancelled = false;
    setBars([]);
    setLive(false);
    setHover(null);
    fetchCandles(symbol, category, frame)
      .then((rows) => {
        if (cancelled) return;
        if (rows) {
          setBars(rows);
          setLive(true);
        } else {
          setBars(fallbackBars(symbol, frame, price));
          setLive(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBars(fallbackBars(symbol, frame, price));
          setLive(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, category, frame, price]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || bars.length === 0) return undefined;
    drawingsRef.current.forEach((item) => {
      if (item.kind === "series") chart.removeSeries(item.series);
    });
    drawingsRef.current = [];
    setDrawingCount(0);
    if (priceSeriesRef.current) {
      chart.removeSeries(priceSeriesRef.current);
      priceSeriesRef.current = null;
    }
    if (maSeriesRef.current) {
      chart.removeSeries(maSeriesRef.current);
      maSeriesRef.current = null;
    }
    const format = priceFormat(bars[bars.length - 1].close);
    const series = style === "area"
      ? chart.addSeries(AreaSeries, {
        lineColor: "#97fce4",
        topColor: "rgba(151, 252, 228, 0.28)",
        bottomColor: "rgba(151, 252, 228, 0.02)",
        priceLineColor: "#97fce4",
        priceFormat: format,
      })
      : chart.addSeries(CandlestickSeries, {
        upColor: "#7dffa8",
        downColor: "#ff6b7a",
        borderUpColor: "#7dffa8",
        borderDownColor: "#ff6b7a",
        wickUpColor: "#7dffa8",
        wickDownColor: "#ff6b7a",
        priceFormat: format,
      });
    series.setData(style === "area" ? bars.map((bar) => ({ time: bar.time, value: bar.close })) : bars);
    priceSeriesRef.current = series;
    if (showMa) {
      const average = chart.addSeries(LineSeries, {
        color: "#87d6c5",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        priceFormat: format,
      });
      average.setData(movingAverage(bars));
      maSeriesRef.current = average;
    }
    chart.timeScale().fitContent();
    return undefined;
  }, [bars, style, showMa]);

  function zoom(direction) {
    const scale = chartRef.current?.timeScale();
    const range = scale?.getVisibleLogicalRange();
    if (!scale || !range) return;
    const center = (range.from + range.to) / 2;
    const half = ((range.to - range.from) / 2) * (direction < 0 ? 1.25 : 0.8);
    scale.setVisibleLogicalRange({ from: center - half, to: center + half });
  }

  function undoDrawing() {
    const chart = chartRef.current;
    const last = drawingsRef.current.pop();
    if (!last || !chart) return;
    if (last.kind === "series") chart.removeSeries(last.series);
    if (last.kind === "line" && priceSeriesRef.current) priceSeriesRef.current.removePriceLine(last.line);
    setDrawingCount(drawingsRef.current.length);
  }

  function clearDrawings() {
    const chart = chartRef.current;
    drawingsRef.current.forEach((item) => {
      if (item.kind === "series" && chart) chart.removeSeries(item.series);
      if (item.kind === "line" && priceSeriesRef.current) priceSeriesRef.current.removePriceLine(item.line);
    });
    drawingsRef.current = [];
    setDrawingCount(0);
  }

  function toggleHidden() {
    const next = !hidden;
    drawingsRef.current.forEach((item) => {
      if (item.kind === "series") item.series.applyOptions({ visible: !next });
      if (item.kind === "line") item.line.applyOptions({ lineVisible: !next, axisLabelVisible: !next });
    });
    setHidden(next);
  }

  function toggleFull() {
    const node = screenRef.current;
    if (!node) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else node.requestFullscreen?.();
  }

  const latest = bars[bars.length - 1];
  const shown = hover || latest;
  const down = shown && shown.close < shown.open;

  return (
    <section className="td-card td-chart" aria-label="Price chart">
      <div className="chart-screen" ref={screenRef}>
        <div className="chart-wrap interactive-chart">
          <div className="chart-toolbar">
            <div className="chart-controls chart-intervals" role="group" aria-label="Candle interval">
              {FRAMES.map((item) => (
                <button key={item} type="button" className={frame === item ? "active" : ""} aria-pressed={frame === item} onClick={() => setFrame(item)}>{item}</button>
              ))}
            </div>
            <div className="chart-controls">
              <div className="chart-control-group chart-style-control" role="group" aria-label="Chart style">
                <button type="button" className={style === "candle" ? "active" : ""} aria-pressed={style === "candle"} title="Candlesticks" aria-label="Candlestick chart" onClick={() => setStyle("candle")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5v4" /><rect x="7" y="9" width="4" height="6" rx="1" /><path d="M9 15v2" /><path d="M17 3v2" /><rect x="15" y="5" width="4" height="8" rx="1" /><path d="M17 13v3" /><path d="M3 3v16a2 2 0 0 0 2 2h16" /></svg>
                </button>
                <button type="button" className={style === "area" ? "active" : ""} aria-pressed={style === "area"} title="Area chart" aria-label="Area chart" onClick={() => setStyle("area")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 3-8.6 8.6a.5.5 0 0 1-.7 0L9.4 8.4a.5.5 0 0 0-.7 0L2 15" /><path d="M4 18v3M8 14v7M12 16v5M16 14v7M20 10v11" /></svg>
                </button>
              </div>
              <button type="button" className={showMa ? "active" : ""} aria-pressed={showMa} title="20-period simple moving average" onClick={() => setShowMa((value) => !value)}>MA 20</button>
              <button type="button" title="Full screen" aria-label="Chart full screen" onClick={toggleFull}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6" /></svg>
              </button>
            </div>
          </div>
          <div className="chart-instrument">
            <strong>{symbol} <span>/ USD</span></strong>
            <span>{frame} · Hyperliquid</span>
          </div>
          <div className="ohlc">
            {shown ? (
              <>
                <span>O <b className={down ? "down" : "up"}>{formatPrice(shown.open)}</b></span>
                <span>H <b className={down ? "down" : "up"}>{formatPrice(shown.high)}</b></span>
                <span>L <b className={down ? "down" : "up"}>{formatPrice(shown.low)}</b></span>
                <span>C <b className={down ? "down" : "up"}>{formatPrice(shown.close)}</b></span>
                {shown.volume != null && <span>Vol <b>{shown.volume.toFixed(2)}</b></span>}
                {shown.time && <span className="chart-hover-time">{formatBarTime(shown.time)}</span>}
              </>
            ) : (
              <span>Connecting to Hyperliquid markets…</span>
            )}
          </div>
          <div className="chart-stage">
            <div className="chart-canvas" ref={canvasRef} tabIndex={0} role="region" aria-label={`${symbol} interactive ${frame} chart`} />
            <div className="chart-drawing-tools" role="toolbar" aria-label="Drawing tools">
              <ToolButton title="Crosshair / pan" active={tool === "cross"} onClick={() => setTool("cross")}><circle cx="12" cy="12" r="8" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></ToolButton>
              <ToolButton title="Trend line" active={tool === "trend"} onClick={() => setTool("trend")}><path d="M13 5h6v6" /><path d="M19 5 5 19" /></ToolButton>
              <ToolButton title="Horizontal line" active={tool === "hline"} onClick={() => setTool("hline")}><path d="M5 12h14" /></ToolButton>
              <ToolButton title="Fibonacci retracement" active={tool === "fib"} onClick={() => setTool("fib")}><path d="M3 6h18M7 12h10M10 18h4" /></ToolButton>
              <span className="drawing-divider" />
              <button type="button" className="drawing-color" title="Change drawing color" aria-label="Change drawing color" onClick={() => setColor(COLORS[(COLORS.indexOf(color) + 1) % COLORS.length])}>
                <span style={{ background: color }} />
              </button>
              <button type="button" title="Undo drawing change" aria-label="Undo drawing change" disabled={!drawingCount} onClick={undoDrawing}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5A5.5 5.5 0 0 1 14.5 20H11" /></svg>
              </button>
              <button type="button" title="Hide drawings" aria-label="Hide drawings" disabled={!drawingCount} onClick={toggleHidden}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
              <button type="button" title="Clear drawings" aria-label="Clear drawings" disabled={!drawingCount} onClick={clearDrawings}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              </button>
            </div>
            <div className="chart-navigation" role="group" aria-label="Chart navigation">
              <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => zoom(-1)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg></button>
              <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => zoom(1)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></button>
              <button type="button" title="Fit chart" aria-label="Fit chart" onClick={() => chartRef.current?.timeScale().fitContent()}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg></button>
            </div>
          </div>
          <div className="chart-foot">
            <span>Hyperliquid · {live ? "Live" : bars.length ? "Snapshot" : "Connecting"}</span>
            <span>{bars.length ? `${bars.length} bars · UTC` : ""}</span>
            <span className="chart-help">Scroll to zoom · Drag to explore · TradingView</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolButton({ title, active, onClick, children }) {
  return (
    <button type="button" title={title} aria-label={title} aria-pressed={active} className={active ? "active" : ""} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{children}</svg>
    </button>
  );
}

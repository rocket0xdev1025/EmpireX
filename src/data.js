export const markets = [
  { symbol: "BTC", name: "Bitcoin", category: "crypto", price: 81680, change: -0.82, leverage: 40, volume: 4820000000 },
  { symbol: "ETH", name: "Ethereum", category: "crypto", price: 2415.7, change: -1.8, leverage: 25, volume: 1960000000 },
  { symbol: "SOL", name: "Solana", category: "crypto", price: 178.42, change: 1.24, leverage: 20, volume: 640000000 },
  { symbol: "HYPE", name: "Hyperliquid", category: "crypto", price: 24.18, change: 3.41, leverage: 10, volume: 210000000 },
  { symbol: "XRP", name: "Ripple", category: "crypto", price: 2.41, change: -0.54, leverage: 20, volume: 380000000 },
  { symbol: "BNB", name: "Binance Coin", category: "crypto", price: 612.3, change: 0.36, leverage: 10, volume: 190000000 },
  { symbol: "DOGE", name: "Dogecoin", category: "crypto", price: 0.1842, change: -2.15, leverage: 10, volume: 270000000 },
  { symbol: "AVAX", name: "Avalanche", category: "crypto", price: 22.64, change: 0.92, leverage: 10, volume: 84000000 },
  { symbol: "LINK", name: "Chainlink", category: "crypto", price: 14.88, change: -1.12, leverage: 10, volume: 96000000 },
  { symbol: "SUI", name: "SUI", category: "crypto", price: 2.27, change: 2.64, leverage: 10, volume: 150000000 },
  { symbol: "AAVE", name: "Aave", category: "crypto", price: 218.4, change: -0.44, leverage: 10, volume: 42000000 },
  { symbol: "ENA", name: "Ethena", category: "crypto", price: 0.412, change: 4.18, leverage: 5, volume: 78000000 },
  { symbol: "LTC", name: "Litecoin", category: "crypto", price: 94.2, change: -0.28, leverage: 10, volume: 51000000 },
  { symbol: "NVDA", name: "NVIDIA", category: "equities", price: 214.22, change: -1.65, leverage: 10, volume: 820000000 },
  { symbol: "TSLA", name: "Tesla", category: "equities", price: 353.82, change: -2.36, leverage: 10, volume: 610000000 },
  { symbol: "AAPL", name: "Apple", category: "equities", price: 228.14, change: 0.42, leverage: 10, volume: 440000000 },
  { symbol: "MSFT", name: "Microsoft", category: "equities", price: 418.55, change: -0.31, leverage: 10, volume: 290000000 },
  { symbol: "AMZN", name: "Amazon", category: "equities", price: 196.08, change: 0.88, leverage: 10, volume: 310000000 },
  { symbol: "GOOGL", name: "Google", category: "equities", price: 176.4, change: 1.12, leverage: 10, volume: 250000000 },
  { symbol: "META", name: "Meta", category: "equities", price: 612.77, change: -0.74, leverage: 10, volume: 220000000 },
  { symbol: "COIN", name: "Coinbase", category: "equities", price: 248.9, change: 2.05, leverage: 10, volume: 180000000 },
  { symbol: "HOOD", name: "Robinhood", category: "equities", price: 42.16, change: 1.48, leverage: 10, volume: 140000000 },
  { symbol: "PLTR", name: "Palantir", category: "equities", price: 78.33, change: -1.22, leverage: 10, volume: 260000000 },
  { symbol: "AMD", name: "Advanced Micro Devices Inc", category: "equities", price: 164.5, change: -0.96, leverage: 10, volume: 200000000 },
  { symbol: "MSTR", name: "Strategy Inc", category: "equities", price: 338.2, change: -3.14, leverage: 5, volume: 310000000 },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Co Ltd", category: "equities", price: 192.6, change: 0.57, leverage: 10, volume: 170000000 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", category: "equities", price: 574.18, change: -0.22, leverage: 20, volume: 900000000 },
  { symbol: "QQQ", name: "Invesco QQQ Trust Series I", category: "equities", price: 498.42, change: -0.41, leverage: 20, volume: 640000000 },
  { symbol: "XAU", name: "Gold", category: "metals", price: 4169.6, change: -0.06, leverage: 20, volume: 520000000 },
  { symbol: "XAG", name: "Silver", category: "metals", price: 48.22, change: 0.84, leverage: 10, volume: 160000000 },
  { symbol: "WTI", name: "Oil - US Crude", category: "commodities", price: 78.46, change: -0.63, leverage: 10, volume: 240000000 },
  { symbol: "PAXG", name: "PAX Gold", category: "metals", price: 4162.1, change: 0.11, leverage: 5, volume: 28000000 },
];

export const tokenFile = {
  BTC: "BTC.svg",
  ETH: "ETH.svg",
  SOL: "SOL.svg",
  HYPE: "HYPE.svg",
  XRP: "XRP.svg",
  BNB: "BNB.svg",
  DOGE: "DOGE.png",
  AVAX: "AVAX.svg",
  LINK: "LINK.svg",
  SUI: "SUI.svg",
  AAVE: "AAVE.svg",
  ENA: "ENA.svg",
  LTC: "LTC.svg",
  NVDA: "NVDA.png",
  TSLA: "TSLA.png",
  AAPL: "AAPL.svg",
  MSFT: "MSFT.png",
  AMZN: "AMZN.png",
  GOOGL: "GOOGL.svg",
  META: "META.svg",
  COIN: "COIN.png",
  HOOD: "HOOD.png",
  PLTR: "PLTR.png",
  AMD: "AMD.svg",
  MSTR: "MSTR.png",
  TSM: "TSM.png",
  SPY: "SPY.svg",
  QQQ: "QQQ.svg",
  XAU: "XAU.png",
  XAG: "XAG.png",
  WTI: "WTI.svg",
  PAXG: "PAXG.svg",
  USDC: "USDC.svg",
  USDG: "USDG.png",
};

export function tokenSrc(symbol) {
  const file = tokenFile[symbol];
  return file ? `/assets/tokens/${file}` : null;
}

export function formatPrice(value) {
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.1 ? 4 : 5;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatCompact(value) {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString("en-US")}`;
}

export const cryptoRail = ["BTC", "ETH", "SOL", "HYPE", "XRP", "BNB", "DOGE", "AVAX", "LINK", "SUI", "AAVE", "ENA", "LTC"];
export const equityRail = ["NVDA", "TSLA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "COIN", "HOOD", "PLTR", "AMD", "MSTR", "TSM", "SPY", "QQQ"];

export function findMarket(symbol) {
  return markets.find((market) => market.symbol === symbol) ?? markets[0];
}

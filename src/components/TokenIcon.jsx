import { tokenSrc } from "../data.js";

export default function TokenIcon({ symbol, size = 36 }) {
  const src = tokenSrc(symbol);
  if (!src) {
    return (
      <span className="token-fallback" style={{ width: size, height: size }}>
        {symbol.slice(0, 2)}
      </span>
    );
  }
  return <img className="token-icon" src={src} alt="" width={size} height={size} />;
}

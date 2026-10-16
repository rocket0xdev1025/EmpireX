export function EmpireMark({ size = 22 }) {
  return (
    <svg className="empire-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="3.2" rx="1.2" />
      <rect x="3" y="10.4" width="13" height="3.2" rx="1.2" />
      <rect x="3" y="16.8" width="8.2" height="3.2" rx="1.2" />
    </svg>
  );
}

export function RobinhoodMark() {
  return (
    <svg className="partner-logo robinhood" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.84 24h.53c.096 0 .192-.048.224-.128C7.591 13.696 11.94 8.656 14.67 5.638c.112-.128.064-.225-.096-.225h-4.88a.55.55 0 0 0-.45.225L5.746 9.972c-.514.642-.642 1.236-.642 2.086v4.43c-1.14 3.194-1.862 5.361-2.392 7.32-.032.125.016.192.129.192M20.447.646c-.754-.802-4.157-.834-5.73-.224a3 3 0 0 0-.786.465 41 41 0 0 0-3.323 3.178c-.112.113-.064.225.097.225h5.409c.497 0 .786.289.786.786v6.1c0 .16.128.208.225.064l3.258-4.254c.53-.69.69-.898.835-1.861.192-1.413.08-3.58-.77-4.479m-6.982 16.18 2.231-3.676a.7.7 0 0 0 .064-.29V6.73c0-.16-.112-.225-.224-.097-3.355 3.74-5.971 7.672-8.395 12.407-.06.12.016.225.16.177l5.009-1.54c.565-.174.882-.402 1.155-.852" />
    </svg>
  );
}

export function HyperliquidMark() {
  return (
    <svg className="partner-logo hyperliquid" width="22" height="16" viewBox="2.3 43.5 150.46 111.12" fill="currentColor" aria-hidden="true">
      <path d="M152.75393,98.33694c0,49.53839-30.41458,65.4366-46.54323,51.38164-13.13338-11.52047-17.05043-35.94411-36.86579-38.47859-25.11487-2.99537-27.419,30.41426-44.00855,30.41426-19.35459,0-23.04117-27.87978-23.04117-42.39574,0-14.74629,4.14741-34.7921,20.50659-34.7921,19.12413,0,20.27625,28.80147,44.23899,27.18856,23.7324-1.61291,24.19319-31.56639,39.86116-44.23897,13.59385-11.29016,45.852.69123,45.852,50.92094Z" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="3.2" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="12.8" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

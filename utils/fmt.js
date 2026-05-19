"use client";

// ── Dirham SVG (UAE — 2 horizontal lines) ─────────────────────────────────

export function DirhamSvg({ size = "0.9em", style = {} }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", position: "relative", top: "-0.05em", ...style }}
    >
      <path d="M6 3 h4 a6 6 0 0 1 0 12 H6 V3z" />
      <line x1="3" y1="8"  x2="12" y2="8"  />
      <line x1="3" y1="11" x2="12" y2="11" />
    </svg>
  );
}

// ── JSX amount renderers ────────────────────────────────────────────────────

export function Amt({ value, currency = "AED", showSign = false, style = {} }) {
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const sign = showSign && value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, ...style }}>
      {sign && <span>{sign}</span>}
      {currency === "AED" ? <DirhamSvg /> : <span>$</span>}
      <span>{abs}</span>
    </span>
  );
}

export function AmtFull({ value, currency = "AED", showSign = false, style = {} }) {
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = showSign && value > 0 ? "+" : value < 0 ? "−" : "";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, ...style }}>
      {sign && <span>{sign}</span>}
      {currency === "AED" ? <DirhamSvg /> : <span>$</span>}
      <span>{abs}</span>
    </span>
  );
}

// Plain string fallback (for non-JSX contexts only)
export const fmtStr = (n, currency = "AED") => {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return currency === "AED" ? `AED ${abs}` : `$${abs}`;
};

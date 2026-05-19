// shared.jsx — Budget app shared UI primitives
// (Reuses Ax icons from src/ui.jsx; adds budget-specific bits)

// ─── Category dot (replaces colored dots from the original app) ──────
function BgCatDot({ cat, size = 8, ring = false }) {
  const c = bgCat(cat);
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: c.color, flexShrink: 0,
      boxShadow: ring ? `0 0 0 3px ${c.color}22` : 'none',
    }} />
  );
}

// ─── Category icon (subtle hairline glyph in a chip) ─────────────────
function BgCatIcon({ cat, size = 36 }) {
  const c = bgCat(cat);
  const glyphs = {
    home: <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinejoin="round"/>,
    cart: <><circle cx="9" cy="20" r="1.2" fill={c.color}/><circle cx="17" cy="20" r="1.2" fill={c.color}/><path d="M3 4h2l2.5 11h12l2-8H7" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></>,
    bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinejoin="round"/>,
    car:  <><path d="M5 16v3a1 1 0 001 1h2a1 1 0 001-1v-3M15 16v3a1 1 0 001 1h2a1 1 0 001-1v-3M4 16h16l-2-6a2 2 0 00-2-1.5H8A2 2 0 006 10l-2 6z" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="14" r="1" fill={c.color}/><circle cx="17" cy="14" r="1" fill={c.color}/></>,
    fork: <path d="M6 3v8a2 2 0 002 2v8M6 3v6a2 2 0 002 2M10 3v6a2 2 0 01-2 2M16 3c-1 0-2 1-2 2v5c0 1 1 2 2 2v9" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinecap="round"/>,
    bag:  <><path d="M5 8h14l-1 12a1 1 0 01-1 1H7a1 1 0 01-1-1L5 8z" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke={c.color} strokeWidth="1.4"/></>,
    repeat:<path d="M4 8l3-3 3 3M7 5v6a3 3 0 003 3h6M20 16l-3 3-3-3M17 19v-6a3 3 0 00-3-3H8" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>,
    film: <><rect x="3" y="5" width="18" height="14" rx="1.4" fill="none" stroke={c.color} strokeWidth="1.4"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4M10 9l5 3-5 3z" stroke={c.color} strokeWidth="1.4" strokeLinejoin="round" fill="none"/></>,
    heart:<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="none" stroke={c.color} strokeWidth="1.4" strokeLinejoin="round"/>,
    vault:<><rect x="3" y="5" width="18" height="14" rx="1.4" fill="none" stroke={c.color} strokeWidth="1.4"/><circle cx="12" cy="12" r="3.4" fill="none" stroke={c.color} strokeWidth="1.4"/><circle cx="12" cy="12" r="0.7" fill={c.color}/></>,
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--ax-midnight)',
      border: `1px solid ${c.color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: `inset 0 0 0 1px ${c.color}0a`,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        {glyphs[c.icon] || glyphs.home}
      </svg>
    </div>
  );
}

// ─── Coverage ring — the signature visual for this app ────────────────
// Two arcs: outer = "income coverage" (how much of month covered)
//          inner = current spend vs income
function BgCoverageRing({ size = 200, income, spent, saved, projected, dayOfMonth, daysInMonth }) {
  const r1 = (size / 2) - 8;   // outer
  const r2 = (size / 2) - 24;  // inner
  const C1 = 2 * Math.PI * r1;
  const C2 = 2 * Math.PI * r2;
  // Outer: month progress
  const monthPct = dayOfMonth / daysInMonth;
  // Inner: spend / income
  const burnPct = Math.min((spent + saved) / income, 1);
  const isOver = (spent + saved) > income;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* outer track */}
        <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,243,239,0.06)" strokeWidth="3"/>
        {/* outer progress (month) */}
        <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,243,239,0.30)" strokeWidth="3"
          strokeDasharray={`${monthPct * C1} ${C1}`} strokeLinecap="round" />
        {/* inner track */}
        <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth="6"/>
        {/* inner progress (spend) */}
        <circle cx={size/2} cy={size/2} r={r2} fill="none"
          stroke={isOver ? '#D97757' : 'var(--ax-gold)'} strokeWidth="6"
          strokeDasharray={`${burnPct * C2} ${C2}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 800ms var(--ax-ease), stroke 320ms var(--ax-ease)' }} />
      </svg>
    </div>
  );
}

// ─── Health Pill (On track / Watch / Over) ────────────────────────────
function BgHealthPill({ status }) {
  const map = {
    'on-track': { label: 'On track', color: '#7A8C6F', bg: 'rgba(122,140,111,0.12)' },
    'watch':    { label: 'Watch',    color: '#D4B76A', bg: 'rgba(212,183,106,0.14)' },
    'over':     { label: 'Over',     color: '#D97757', bg: 'rgba(217,119,87,0.15)' },
  };
  const s = map[status] || map['watch'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 2,
      background: s.bg, border: `1px solid ${s.color}55`,
      color: s.color,
      fontSize: 10, fontWeight: 500, letterSpacing: '0.28em',
      textTransform: 'uppercase',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

// ─── Progress bar (used in budget rows) ───────────────────────────────
function BgBar({ pct, color = 'var(--ax-gold)', height = 3 }) {
  const over = pct > 100;
  const clamped = Math.min(pct, 100);
  return (
    <div style={{
      width: '100%', height, borderRadius: 2,
      background: 'var(--ax-border)', overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        width: `${clamped}%`, height: '100%',
        background: over ? '#D97757' : color,
        transition: 'width 600ms var(--ax-ease), background 320ms var(--ax-ease)',
      }} />
      {over && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 2, background: '#D97757',
          boxShadow: '0 0 8px #D97757',
        }} />
      )}
    </div>
  );
}

// ─── Detail row (label / value) ──────────────────────────────────────
function BgDetailRow({ label, value, valueColor, mono, right, isLast, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid var(--ax-border)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'rgba(201,165,90,0.04)'; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={mono ? 'ax-num' : ''} style={{
          fontFamily: mono ? 'var(--ax-font-body)' : 'var(--ax-font-display)',
          fontSize: mono ? 14 : 15,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: mono ? '0.06em' : '0',
          color: valueColor || 'var(--ax-fg)',
        }}>{value}</span>
        {right}
      </div>
    </div>
  );
}

// ─── Tab icons (matching the source app: Home, Txns, Budget, Insights, Settings) ─
const BgTabIcons = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="14" y="3" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="3" y="14" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="14" y="14" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  Txns: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <rect x="5" y="3" width="14" height="18" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Budget: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M4 18s2-3 5-3 4 2 7 1 4-4 4-4M4 13v6a1 1 0 001 1h14a1 1 0 001-1V5a3 3 0 00-3-3H7a3 3 0 00-3 3v8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Insights: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Settings: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

Object.assign(window, {
  BgCatDot, BgCatIcon, BgCoverageRing, BgHealthPill,
  BgBar, BgDetailRow, BgTabIcons,
});

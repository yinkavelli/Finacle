// budget-app/ui.jsx — Budget-specific UI primitives

// === Category dot (the signature affordance) ===
function CatDot({ cat, size = 8, ring = false }) {
  const c = window.CATEGORIES[cat];
  if (!c) return null;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: c.color,
      boxShadow: ring ? `0 0 0 3px ${c.color}22` : 'none',
      flexShrink: 0,
    }} />
  );
}

// === Coverage bar — income (full width) vs spend (gold fill) ===
// The hero visualization on the Home screen.
function CoverageBar({ income, spend, height = 8, showMarkers = true, animated = true }) {
  const pct = Math.min(100, (spend / income) * 100);
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        position: 'relative', width: '100%', height,
        background: 'rgba(245,243,239,0.10)',
        borderRadius: height / 2, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: pct > 95
            ? 'linear-gradient(90deg, #C9A55A 0%, #B17460 100%)'
            : 'linear-gradient(90deg, #9A7B3D 0%, #C9A55A 50%, #D4B76A 100%)',
          borderRadius: height / 2,
          animation: animated ? 'ax-fill-bar 900ms var(--ax-ease)' : 'none',
        }} />
        {/* Target line at e.g. 80% of income */}
        {showMarkers && (
          <div style={{
            position: 'absolute', left: '80%', top: -3, bottom: -3,
            width: 1, background: 'rgba(245,243,239,0.4)',
          }} />
        )}
      </div>
    </div>
  );
}

// === Category row (used in list + budget breakdown) ===
function CategoryRow({ catKey, spent, budget, onClick }) {
  const c = window.CATEGORIES[catKey];
  if (!c) return null;
  const pct = Math.min(100, (spent / budget) * 100);
  const over = spent > budget;
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'transparent', border: 0,
      padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
      transition: 'background 220ms var(--ax-ease)',
      fontFamily: 'var(--ax-font-body)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CatDot cat={catKey} size={8} ring />
          <span style={{ fontSize: 13, color: 'var(--ax-fg)', fontWeight: 400 }}>{c.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 16, fontWeight: 400,
            color: over ? 'var(--ax-fg)' : 'var(--ax-fg)',
          }}>
            ${spent.toFixed(0)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--ax-fg-faint)', letterSpacing: '0.04em' }}>
            / ${budget.toFixed(0)}
          </span>
        </div>
      </div>
      {/* Progress */}
      <div style={{
        position: 'relative', height: 3,
        background: 'rgba(245,243,239,0.06)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`, background: c.color,
          transition: 'width 600ms var(--ax-ease)',
        }} />
        {/* If overspent, secondary stripe */}
        {over && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
            background: `repeating-linear-gradient(45deg, transparent 0 4px, rgba(245,243,239,0.15) 4px 5px)`,
            opacity: 0.6,
          }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--ax-fg-muted)', letterSpacing: '0.04em' }}>
          {over
            ? <span>Over by <span style={{ color: '#B17460' }}>${(spent - budget).toFixed(0)}</span></span>
            : <span>${(budget - spent).toFixed(0)} <span style={{ color: 'var(--ax-fg-faint)' }}>remaining</span></span>}
        </span>
        <span style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 11, fontStyle: 'italic',
          color: over ? '#B17460' : 'var(--ax-gold)',
        }}>{pct.toFixed(0)}%</span>
      </div>
    </button>
  );
}

// === Sparkline ===
function Sparkline({ values, width = 80, height = 24, color = 'var(--ax-gold)', area = false }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = (max - min) || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaD = d + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {area && <path d={areaD} fill={color} fillOpacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

// === Stat tile (Income / Spend / Surplus) — clean editorial display ===
function StatTile({ eyebrow, value, subtle, color, italic, accent }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
        textTransform: 'uppercase', fontWeight: 500,
      }}>{eyebrow}</div>
      <div className="ax-num" style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300,
        marginTop: 6, color: color || 'var(--ax-fg)',
        letterSpacing: '-0.01em',
        fontStyle: italic ? 'italic' : 'normal',
      }}>{value}</div>
      {subtle && (
        <div style={{
          fontSize: 10, color: accent || 'var(--ax-fg-muted)', marginTop: 4,
          letterSpacing: '0.04em',
        }}>{subtle}</div>
      )}
    </div>
  );
}

// === Floating Chat FAB (bottom right, above tab bar) ===
function ChatFAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 20, bottom: 102, zIndex: 25,
      width: 54, height: 54, borderRadius: 4,
      background: 'var(--ax-midnight)',
      border: '1px solid var(--ax-border-gold)',
      color: 'var(--ax-gold)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px -8px rgba(201,165,90,0.35)',
      transition: 'all 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 24px 48px -10px rgba(0,0,0,0.6), 0 0 40px -6px rgba(201,165,90,0.5)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px -8px rgba(201,165,90,0.35)';
    }}>
      {/* Custom mark — italic A like Axinity */}
      <span style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 22, fontStyle: 'italic',
        fontWeight: 500, lineHeight: 1, marginTop: -2,
      }}>a</span>
      {/* Pulse dot */}
      <span style={{
        position: 'absolute', top: 8, right: 8, width: 5, height: 5,
        borderRadius: '50%', background: 'var(--ax-gold)',
        animation: 'ax-pulse-gold 2.4s infinite',
      }} />
    </button>
  );
}

// === Stacked-bar (proportional) for category overview ===
function StackedCategoryBar({ height = 6, total, items }) {
  // items: [{ catKey, amount }]
  return (
    <div style={{
      width: '100%', height, borderRadius: height / 2, overflow: 'hidden',
      background: 'rgba(245,243,239,0.06)',
      display: 'flex',
    }}>
      {items.map((it, i) => {
        const c = window.CATEGORIES[it.catKey];
        if (!c) return null;
        const w = (it.amount / total) * 100;
        return (
          <div key={i} style={{
            width: `${w}%`, height: '100%', background: c.color,
            transition: 'width 600ms var(--ax-ease)',
          }} />
        );
      })}
    </div>
  );
}

// === Inline divider with optional caption ===
function AxRule({ caption, gold = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
      <span style={{
        flex: caption ? 0 : 1, height: 1,
        background: gold ? 'var(--ax-gold)' : 'var(--ax-border)',
        width: caption ? 24 : 'auto',
      }} />
      {caption && (
        <>
          <span style={{
            fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
            textTransform: 'uppercase', fontWeight: 500,
          }}>{caption}</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ax-border)' }} />
        </>
      )}
    </div>
  );
}

// === Severity glyph for suggestions ===
const SuggestionGlyph = {
  cut:      (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 5v9M8 11l4-4 4 4M5 19h14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  optimise: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 17l4-4 4 4 8-8M14 9h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  praise:   (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// Replace tab-bar icons for the budget app (Home / Txns / Budget / Insights / Settings)
const BudgetIcons = {
  Home:     (p) => <svg viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4"/><rect x="13" y="3" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4"/><rect x="3" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4"/><rect x="13" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Txns:     (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 3h10l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M16 3v4h4M9 11h7M9 15h7M9 19h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Budget:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 14c0-5 4-8 9-8s9 3 9 8v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="17" cy="13" r="0.9" fill="currentColor"/><path d="M12 6V4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Insights: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 20V8M9 20V4M15 20v-9M21 20V12M3 20h18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Settings: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>,
};

Object.assign(window, {
  CatDot, CoverageBar, CategoryRow, Sparkline, StatTile,
  ChatFAB, StackedCategoryBar, AxRule, SuggestionGlyph, BudgetIcons,
});

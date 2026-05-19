// ui.jsx — Shared UI primitives for Axinity Mobile
// Icons are minimal 1.5px hairline glyphs (no emoji). Card visual, tabs, chrome.

// ─── Phone-spec iOS Status Bar (light text for dark mode) ────────────
function AxStatusBar({ light = true, time = '9:41' }) {
  const c = light ? '#F5F3EF' : '#0A0908';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px 0',
      fontFamily: 'var(--ax-font-body)',
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: c, letterSpacing: '-0.02em' }}>{time}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c }}>
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="3.5" rx="0.5" />
          <rect x="5" y="5" width="3" height="6" rx="0.5" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="0.5" />
          <rect x="15" y="0" width="3" height="11" rx="0.5" />
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 11a1.4 1.4 0 100-2.8A1.4 1.4 0 008 11z"/>
          <path d="M3.4 6.3l1.05 1.05A4.9 4.9 0 018 6a4.9 4.9 0 013.55 1.35l1.05-1.05A6.4 6.4 0 008 4.5a6.4 6.4 0 00-4.6 1.8z"/>
          <path d="M0 3.5l1.5 1.5A8.5 8.5 0 018 2.5a8.5 8.5 0 016.5 2.5L16 3.5A10.5 10.5 0 008 0 10.5 10.5 0 000 3.5z"/>
        </svg>
        {/* battery */}
        <svg width="27" height="12" viewBox="0 0 27 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="currentColor" strokeOpacity="0.4"/>
          <rect x="24" y="3.5" width="1.5" height="5" rx="0.75" fill="currentColor" fillOpacity="0.4"/>
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Hairline icon set (Axinity-style, 1.5px stroke, 22-24px box) ────
const Ax = {
  Home:    (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Card:    (p) => <svg viewBox="0 0 24 24" {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 10h19" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Activity:(p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 12h3l3-7 6 14 3-7h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  Insights:(p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Vault:   (p) => <svg viewBox="0 0 24 24" {...p}><rect x="3" y="5" width="18" height="14" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="0.7" fill="currentColor"/><path d="M16 8l1 -1M16 16l1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  ArrowUp: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowDown:(p)=> <svg viewBox="0 0 24 24" {...p}><path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus:    (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Swap:    (p) => <svg viewBox="0 0 24 24" {...p}><path d="M7 5L3 9l4 4M3 9h14M17 19l4-4-4-4M21 15H7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  More:    (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>,
  ChevR:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevL:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevD:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Close:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Search:  (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Eye:     (p) => <svg viewBox="0 0 24 24" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>,
  EyeOff:  (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 4l16 16M9.5 5.4A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.1M6.2 7.6A17 17 0 002 12s3.5 7 10 7a10.6 10.6 0 005.5-1.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Lock:    (p) => <svg viewBox="0 0 24 24" {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M8 10.5V7a4 4 0 018 0v3.5" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Bell:    (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 17V11a6 6 0 0112 0v6l1.5 2H4.5L6 17zM10 21a2 2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Filter:  (p) => <svg viewBox="0 0 24 24" {...p}><path d="M3 6h18M6 12h12M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Spark:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3l1.8 5.8L19.6 10l-5.8 1.8L12 17l-1.8-5.2L4.4 10l5.8-1.2L12 3z" fill="currentColor"/></svg>,
  Faceid:  (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M9 10v1M15 10v1M9 15s1 1.4 3 1.4S15 15 15 15M12 9v4h-1" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings:(p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Copy:    (p) => <svg viewBox="0 0 24 24" {...p}><rect x="8" y="8" width="12" height="12" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Share:   (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="6" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="18" cy="6" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="18" cy="18" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M8 11l8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Flame:   (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4-1 0-1.5 1-1.5 2C7.5 6 12 3 12 3z" fill="currentColor"/></svg>,
};

// ─── Eyebrow (Axinity signature: section number) ─────────────────────
function AxEyebrow({ num, label, color }) {
  return (
    <div style={{
      fontFamily: 'var(--ax-font-body)',
      fontSize: 11, fontWeight: 500,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: color || 'var(--ax-gold)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {num != null && <span style={{ color: 'var(--ax-gold)' }}>{String(num).padStart(2, '0')}</span>}
      {num != null && <span style={{ width: 16, height: 1, background: 'var(--ax-border-gold-soft)' }} />}
      <span>{label}</span>
    </div>
  );
}

// ─── Card visual — the hero showpiece ────────────────────────────────
function AxCardVisual({ card, width = 320, idx = 0, animated = true, frontOnly = false }) {
  const aspect = 1.586; // standard card ratio
  const height = width / aspect;
  const isGold = card.style === 'gold';
  const isParchment = card.style === 'parchment';

  // Background palette
  let bg, fg, accent, sheen, label;
  if (isGold) {
    bg = 'linear-gradient(135deg, #1a1612 0%, #2a2218 35%, #1a1612 100%)';
    fg = '#F5F3EF';
    accent = '#C9A55A';
    sheen = 'linear-gradient(105deg, transparent 30%, rgba(201,165,90,0.18) 50%, transparent 70%)';
    label = 'RESERVE';
  } else if (isParchment) {
    bg = 'linear-gradient(135deg, #f5f3ef 0%, #e8e4d8 50%, #d4cdb8 100%)';
    fg = '#0A0908';
    accent = '#9A7B3D';
    sheen = 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)';
    label = 'TRAVEL';
  } else {
    bg = 'linear-gradient(135deg, #0a0908 0%, #1a1815 50%, #0a0908 100%)';
    fg = '#F5F3EF';
    accent = '#C9A55A';
    sheen = 'linear-gradient(105deg, transparent 30%, rgba(245,243,239,0.06) 50%, transparent 70%)';
    label = 'VIRTUAL';
  }

  return (
    <div style={{
      width, height, borderRadius: 16, position: 'relative', overflow: 'hidden',
      background: bg,
      border: isParchment ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(201,165,90,0.22)',
      boxShadow: isGold
        ? '0 30px 60px -20px rgba(0,0,0,0.7), 0 0 40px -10px rgba(201,165,90,0.18), inset 0 1px 0 rgba(201,165,90,0.25)'
        : isParchment
          ? '0 30px 60px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 30px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,243,239,0.06)',
      color: fg, flexShrink: 0,
    }}>
      {/* sheen layer */}
      <div style={{
        position: 'absolute', inset: 0, background: sheen,
        animation: animated ? 'ax-card-shine 6s infinite' : 'none', mixBlendMode: 'screen',
      }} />
      {/* halftone signature in corner — only on gold card */}
      {isGold && (
        <div style={{
          position: 'absolute', top: -10, right: -10, width: 140, height: 140,
          backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(255,179,71,0.35) 1.5px, transparent 2px)',
          backgroundSize: '10px 10px',
          WebkitMaskImage: 'radial-gradient(ellipse at top right, #000 20%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse at top right, #000 20%, transparent 70%)',
        }} />
      )}
      {/* Top row */}
      <div style={{ position: 'absolute', top: 18, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1 }}>
            Axinity
          </div>
          <div style={{ fontFamily: 'var(--ax-font-body)', fontSize: 7, fontWeight: 200, letterSpacing: '0.6em', marginTop: 4, color: accent }}>
            PARTNERS
          </div>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 500, letterSpacing: '0.28em',
          padding: '4px 8px', border: `1px solid ${accent}`, color: accent,
          borderRadius: 2,
        }}>{label}</div>
      </div>

      {/* Chip — geometric, abstract */}
      <div style={{
        position: 'absolute', left: 22, top: '50%', transform: 'translateY(-30%)',
        width: 38, height: 30, borderRadius: 4,
        background: isParchment
          ? 'linear-gradient(135deg, #c9a55a 0%, #d4b76a 50%, #9a7b3d 100%)'
          : 'linear-gradient(135deg, #c9a55a 0%, #d4b76a 40%, #7a6332 100%)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          position: 'absolute', inset: 4, borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, transparent 33%, ${isParchment ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)'} 33%, ${isParchment ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)'} 67%, transparent 67%),
                              linear-gradient(0deg, transparent 33%, ${isParchment ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)'} 33%, ${isParchment ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.25)'} 67%, transparent 67%)`,
        }} />
      </div>

      {/* Number */}
      <div style={{
        position: 'absolute', bottom: 50, left: 22, right: 22,
        fontFamily: 'var(--ax-font-body)', fontVariantNumeric: 'tabular-nums',
        fontSize: 14, letterSpacing: '0.18em', fontWeight: 400,
        color: isParchment ? 'rgba(0,0,0,0.7)' : 'rgba(245,243,239,0.85)',
      }}>
        {card.number}
      </div>

      {/* Bottom row */}
      <div style={{ position: 'absolute', bottom: 18, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '0.28em', color: isParchment ? 'rgba(0,0,0,0.4)' : 'rgba(245,243,239,0.4)', fontWeight: 500 }}>EXPIRES</div>
          <div style={{ fontFamily: 'var(--ax-font-body)', fontSize: 12, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{card.expiry}</div>
        </div>
        <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 16, fontWeight: 400, letterSpacing: '0.04em', color: accent }}>
          {/* Mastercard-ish abstract */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: accent, opacity: 0.85 }} />
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: isParchment ? '#7a6332' : '#9A7B3D', opacity: 0.85, marginLeft: -8 }} />
          </div>
        </div>
      </div>

      {/* Frozen overlay */}
      {card.frozen && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(10,9,8,0.55)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
        }}>
          <Ax.Lock width="24" height="24" style={{ color: '#F5F3EF' }} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: '#F5F3EF', fontWeight: 500 }}>FROZEN</div>
        </div>
      )}
    </div>
  );
}

// ─── Section card — flat midnight matching bg, hairline border ───────
function AxSection({ children, style = {}, padding = 24, aesthetic = 'matte' }) {
  let bg, border, extra = {};
  if (aesthetic === 'glass') {
    bg = 'rgba(10,9,8,0.55)';
    border = '1px solid rgba(201,165,90,0.12)';
    extra = { backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)' };
  } else if (aesthetic === 'metallic') {
    bg = 'linear-gradient(155deg, #0d0c0a 0%, #15110b 60%, #0a0908 100%)';
    border = '1px solid rgba(201,165,90,0.18)';
    extra = { boxShadow: 'inset 0 1px 0 rgba(201,165,90,0.08)' };
  } else {
    bg = 'var(--ax-midnight)';
    border = '1px solid var(--ax-border)';
  }
  return (
    <div style={{
      background: bg, border, borderRadius: 4, padding,
      position: 'relative', ...extra, ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Quick-action pill (Send / Add / Exchange / More) ────────────────
function AxQuickAction({ icon: Icon, label, onClick, accent = false }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      fontFamily: 'var(--ax-font-body)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 4,
        background: accent ? 'var(--ax-gold)' : 'var(--ax-midnight)',
        border: accent ? '1px solid var(--ax-gold)' : '1px solid var(--ax-border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ? 'var(--ax-midnight)' : 'var(--ax-parchment)',
        transition: 'all 220ms var(--ax-ease)',
      }}>
        <Icon width="22" height="22" />
      </div>
      <div style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ax-fg-muted)', fontWeight: 500,
      }}>{label}</div>
    </button>
  );
}

// ─── Merchant avatar — letter chip with hairline gold border ─────────
function AxMerchant({ logo, accent, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--ax-card)',
      border: `1px solid ${accent || 'var(--ax-border)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--ax-font-display)',
      fontSize: size * 0.42, fontWeight: 400,
      color: accent || 'var(--ax-fg-muted)',
      flexShrink: 0,
    }}>{logo}</div>
  );
}

// ─── Halftone signature texture (corner accent) ──────────────────────
function AxHalftone({ position = 'top-right', size = 180, opacity = 0.7 }) {
  const pos = {
    'top-right': { top: -20, right: -20, mask: 'radial-gradient(ellipse at top right, #000 10%, transparent 65%)' },
    'top-left': { top: -20, left: -20, mask: 'radial-gradient(ellipse at top left, #000 10%, transparent 65%)' },
    'bottom-right': { bottom: -20, right: -20, mask: 'radial-gradient(ellipse at bottom right, #000 10%, transparent 65%)' },
  }[position];
  return (
    <div style={{
      position: 'absolute', width: size, height: size, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(255,179,71,0.55) 1.6px, transparent 2.4px)',
      backgroundSize: '10px 10px',
      WebkitMaskImage: pos.mask, maskImage: pos.mask,
      opacity, ...pos,
    }} />
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────
function AxTabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
      paddingBottom: 24, paddingTop: 8, paddingLeft: 4, paddingRight: 4,
      background: 'linear-gradient(to top, var(--ax-midnight) 60%, rgba(10,9,8,0.9) 80%, transparent 100%)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--ax-border)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            padding: '8px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? 'var(--ax-gold)' : 'var(--ax-fg-muted)',
            transition: 'color 220ms var(--ax-ease)',
            position: 'relative',
          }}>
            <Icon width="22" height="22" />
            <div style={{
              fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'var(--ax-font-body)', fontWeight: 500,
            }}>{t.label}</div>
            {isActive && (
              <div style={{
                position: 'absolute', top: -8, width: 24, height: 1.5,
                background: 'var(--ax-gold)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Screen header (eyebrow + title) ─────────────────────────────────
function AxScreenHeader({ num, eyebrow, title, italic, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
      <div>
        <AxEyebrow num={num} label={eyebrow} />
        <h1 style={{
          fontFamily: 'var(--ax-font-display)',
          fontSize: 34, fontWeight: 300, letterSpacing: '-0.015em',
          lineHeight: 1.05, color: 'var(--ax-fg)', margin: '12px 0 0',
        }}>
          {title}
          {italic && <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)', fontWeight: 300 }}> {italic}</span>}
        </h1>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  AxStatusBar, Ax, AxEyebrow, AxCardVisual, AxSection,
  AxQuickAction, AxMerchant, AxHalftone, AxTabBar, AxScreenHeader,
});
